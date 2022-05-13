import web3 from "./web3";
import BooksOfYeA from "./BooksOfYeA.json";

const instance = new web3.eth.Contract(
    BooksOfYeA.abi,
    //Rink
    '0x9d943d50D0814E1f18fA3544F31eBdfaF2D68b4a'
    //Mainnet
    // "0x63a500Db4C3cAdBa7C663e4C7A0F92c1D75274f3"
  );

  // ["0x493dcf9eaac9cf6104d9f79efdd145264d2d65663624f60af4069a092cd09b60","0x43f505030737a701e99aa05631874a5d505d27178537180804b3eacea5bf1e09","0xf6ba7d491718734276fa1d73c615b261dd8d9f07f27f50e3cbf0676b638132ca"]
export default instance;