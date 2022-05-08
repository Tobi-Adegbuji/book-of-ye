import web3 from "./web3";
import BooksOfYeA from "./BooksOfYeA.json";

const instance = new web3.eth.Contract(
    BooksOfYeA.abi,
    //Rink
    '0x5741C8e37EBB8074316a6307D4Eda1c86b20Cb99'
    //Mainnet
    // "0x63a500Db4C3cAdBa7C663e4C7A0F92c1D75274f3"
  );


export default instance;