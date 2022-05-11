import web3 from "./web3";
import BooksOfYeA from "./BooksOfYeA.json";

const instance = new web3.eth.Contract(
    BooksOfYeA.abi,
    //Rink
    '0x9d943d50D0814E1f18fA3544F31eBdfaF2D68b4a'
    //Mainnet
    // "0x63a500Db4C3cAdBa7C663e4C7A0F92c1D75274f3"
  );


export default instance;