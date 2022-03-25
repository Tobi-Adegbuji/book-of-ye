import BooksOfYe from './BooksOfYe.json'
import { Contract } from '@ethersproject/contracts'
import { ethers } from 'ethers'

 const contractAddress = '0x63a500Db4C3cAdBa7C663e4C7A0F92c1D75274f3' 
//  '0x580b6e863567402E8AEDFf49391d4F26E9E34151'

export const getContract = (account, provider) => {
  
  const signer = provider.getSigner(account)
  var contract = new Contract(contractAddress, BooksOfYe.abi, signer)
  console.log(contract)
  return contract
}
