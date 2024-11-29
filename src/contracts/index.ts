import { ethers } from 'ethers';
import { TokenABI } from './Token';

const TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with actual address

export const getTokenContract = (provider: ethers.Provider | ethers.Signer) => {
  return new ethers.Contract(TOKEN_ADDRESS, TokenABI, provider);
};