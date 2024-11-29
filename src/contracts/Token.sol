// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Token {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    address public admin;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public frozen;
    mapping(address => bool) public blacklisted;
    
    uint256 public maxSupply;
    uint256 public transferFee;
    bool public transfersEnabled;
    bool private killed;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event FrozenAccount(address indexed account, bool frozen);
    event BlacklistedAccount(address indexed account, bool blacklisted);
    event TokensBurned(address indexed from, uint256 value);
    event TokensMinted(address indexed to, uint256 value);
    event TransferFeeUpdated(uint256 newFee);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    event TransfersEnabledUpdated(bool enabled);
    event ContractKilled(address indexed admin, uint256 balance);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier whenNotKilled() {
        require(!killed, "Contract has been terminated");
        _;
    }
    
    modifier whenTransfersEnabled() {
        require(transfersEnabled, "Transfers are currently disabled");
        _;
    }
    
    modifier notFrozen(address account) {
        require(!frozen[account], "Account is frozen");
        _;
    }
    
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Account is blacklisted");
        _;
    }
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply,
        uint256 _maxSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        admin = msg.sender;
        maxSupply = _maxSupply;
        transfersEnabled = true;
        killed = false;
        
        totalSupply = _initialSupply * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    // Kill function to terminate contract
    function killContract() public onlyAdmin {
        require(!killed, "Contract is already terminated");
        
        // Transfer all remaining tokens to admin
        if (balanceOf[address(this)] > 0) {
            uint256 contractBalance = balanceOf[address(this)];
            balanceOf[address(this)] = 0;
            balanceOf[admin] += contractBalance;
            emit Transfer(address(this), admin, contractBalance);
        }
        
        // Get contract's ETH balance
        uint256 ethBalance = address(this).balance;
        
        killed = true;
        emit ContractKilled(admin, ethBalance);
        
        // Self-destruct and send remaining ETH to admin
        selfdestruct(payable(admin));
    }
    
    // Admin Functions
    function mint(address to, uint256 value) public onlyAdmin whenNotKilled {
        require(totalSupply + value <= maxSupply, "Would exceed max supply");
        balanceOf[to] += value;
        totalSupply += value;
        emit TokensMinted(to, value);
        emit Transfer(address(0), to, value);
    }
    
    function burn(address from, uint256 value) public onlyAdmin whenNotKilled {
        require(balanceOf[from] >= value, "Insufficient balance");
        balanceOf[from] -= value;
        totalSupply -= value;
        emit TokensBurned(from, value);
        emit Transfer(from, address(0), value);
    }
    
    function setTransferFee(uint256 _fee) public onlyAdmin whenNotKilled {
        transferFee = _fee;
        emit TransferFeeUpdated(_fee);
    }
    
    function setMaxSupply(uint256 _maxSupply) public onlyAdmin whenNotKilled {
        require(_maxSupply >= totalSupply, "Max supply cannot be less than current supply");
        maxSupply = _maxSupply;
        emit MaxSupplyUpdated(_maxSupply);
    }
    
    function enableTransfers(bool _enabled) public onlyAdmin whenNotKilled {
        transfersEnabled = _enabled;
        emit TransfersEnabledUpdated(_enabled);
    }
    
    function freezeAccount(address account, bool _frozen) public onlyAdmin whenNotKilled {
        frozen[account] = _frozen;
        emit FrozenAccount(account, _frozen);
    }
    
    function blacklistAccount(address account, bool _blacklisted) public onlyAdmin whenNotKilled {
        blacklisted[account] = _blacklisted;
        emit BlacklistedAccount(account, _blacklisted);
    }
    
    function transferAdmin(address newAdmin) public onlyAdmin whenNotKilled {
        require(newAdmin != address(0), "Invalid address");
        admin = newAdmin;
    }
    
    function withdrawFees(address to) public onlyAdmin whenNotKilled {
        uint256 fees = balanceOf[address(this)];
        require(fees > 0, "No fees to withdraw");
        balanceOf[address(this)] = 0;
        balanceOf[to] += fees;
        emit Transfer(address(this), to, fees);
    }
    
    // Banking Functions
    function deposit() public payable whenTransfersEnabled whenNotKilled notBlacklisted(msg.sender) {
        require(msg.value > 0, "Must send ether");
        uint256 tokens = msg.value * (10 ** uint256(decimals)) / (1 ether);
        require(totalSupply + tokens <= maxSupply, "Would exceed max supply");
        balanceOf[msg.sender] += tokens;
        totalSupply += tokens;
        emit TokensMinted(msg.sender, tokens);
        emit Transfer(address(0), msg.sender, tokens);
    }
    
    function withdraw(uint256 tokens) public whenTransfersEnabled whenNotKilled notFrozen(msg.sender) notBlacklisted(msg.sender) {
        require(balanceOf[msg.sender] >= tokens, "Insufficient balance");
        uint256 etherAmount = (tokens * (1 ether)) / (10 ** uint256(decimals));
        require(address(this).balance >= etherAmount, "Insufficient contract balance");
        balanceOf[msg.sender] -= tokens;
        totalSupply -= tokens;
        payable(msg.sender).transfer(etherAmount);
        emit TokensBurned(msg.sender, tokens);
        emit Transfer(msg.sender, address(0), tokens);
    }
    
    // Standard ERC20 Functions
    function transfer(address to, uint256 value) public whenTransfersEnabled whenNotKilled notFrozen(msg.sender) notBlacklisted(msg.sender) notBlacklisted(to) returns (bool success) {
        require(balanceOf[msg.sender] >= value + transferFee, "Insufficient balance");
        
        balanceOf[msg.sender] -= value + transferFee;
        balanceOf[to] += value;
        
        if (transferFee > 0) {
            balanceOf[address(this)] += transferFee;
            emit Transfer(msg.sender, address(this), transferFee);
        }
        
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) public whenNotKilled notFrozen(msg.sender) notBlacklisted(msg.sender) notBlacklisted(spender) returns (bool success) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) public whenTransfersEnabled whenNotKilled notFrozen(from) notBlacklisted(from) notBlacklisted(to) returns (bool success) {
        require(balanceOf[from] >= value + transferFee, "Insufficient balance");
        require(allowance[from][msg.sender] >= value + transferFee, "Insufficient allowance");
        
        balanceOf[from] -= value + transferFee;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value + transferFee;
        
        if (transferFee > 0) {
            balanceOf[address(this)] += transferFee;
            emit Transfer(from, address(this), transferFee);
        }
        
        emit Transfer(from, to, value);
        return true;
    }
    
    // View Functions
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    function getTokenPrice() public view returns (uint256) {
        return 1 ether;  // 1:1 ratio with ETH for simplicity
    }
    
    // Receive function to accept ETH
    receive() external payable {
        if (!killed) {
            deposit();
        }
    }
}