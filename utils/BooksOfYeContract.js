import web3 from "./web3";
import BooksOfYe from "./BooksOfYe.json";

const instance = new web3.eth.Contract(
    BooksOfYe.abi,
    //Rink
    // "0x580b6e863567402E8AEDFf49391d4F26E9E34151"
    //Mainnet
    "0x63a500Db4C3cAdBa7C663e4C7A0F92c1D75274f3"
  );


export default instance;