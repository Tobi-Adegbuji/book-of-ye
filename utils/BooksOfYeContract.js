import web3 from "./web3";
import BooksOfYeA from "./BooksOfYeA.json";

const instance = new web3.eth.Contract(
    BooksOfYeA.abi,
    //Rink
    '0xdd85b3e000752b1b83c1325899a01ee9664ba146'
    //Mainnet
    // "0x63a500Db4C3cAdBa7C663e4C7A0F92c1D75274f3"
  );


export default instance;