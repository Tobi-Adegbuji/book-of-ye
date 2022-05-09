import web3 from "./web3";
import BooksOfYeA from "./BooksOfYeA.json";

const instance = new web3.eth.Contract(
    BooksOfYeA.abi,
    //Rink
    '0x1E2b4458C364063E84026d09df6193071EB73B6E'
    //Mainnet
    // "0x63a500Db4C3cAdBa7C663e4C7A0F92c1D75274f3"
  );


export default instance;