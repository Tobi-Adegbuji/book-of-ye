import { Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import "../styles/globals.css";


function BookOfYe({ Component, pageProps, tabData }) {
  return (
    <div>
        <Component {...pageProps} />
    </div>
  );
}


export default BookOfYe;
