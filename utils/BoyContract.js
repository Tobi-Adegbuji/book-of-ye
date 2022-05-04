import BooksOfYe from './BooksOfYe.json'
import BooksOfYeA from "./BooksOfYeA.json";
import { Contract } from '@ethersproject/contracts'
import { ethers } from 'ethers'

 const contractAddress = 
//  '0x7b1d12d8ECccD04b8fAEd928Ab23398c103bC511' 
'0x63a500Db4C3cAdBa7C663e4C7A0F92c1D75274f3'
// '0x580b6e863567402E8AEDFf49391d4F26E9E34151'
export const getContract = (account, provider) => {
  
  const signer = provider.getSigner(account)
  var contract = new Contract(contractAddress, BooksOfYe.abi, signer)
  return contract
}
