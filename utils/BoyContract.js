import BooksOfYe from './BooksOfYe.json'
import BooksOfYeA from "./BooksOfYeA.json";
import { Contract } from '@ethersproject/contracts'
import { ethers } from 'ethers'
 
//721A Rinkeby Contract
 const contractAddress = '0x5741C8e37EBB8074316a6307D4Eda1c86b20Cb99'
 
// '0x63a500Db4C3cAdBa7C663e4C7A0F92c1D75274f3'
// '0x580b6e863567402E8AEDFf49391d4F26E9E34151'
export const getContract = (account, provider) => {
  
  const signer = provider.getSigner(account)
  var contract = new Contract(contractAddress, BooksOfYeA.abi, signer)
  return contract
}
