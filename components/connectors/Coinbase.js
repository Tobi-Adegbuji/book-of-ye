import { CoinbaseWallet } from "@web3-react/coinbase-wallet";
import { initializeConnector } from "@web3-react/core";



const URLS = {
    1: "https://mainnet.infura.io/v3/84842078b09946638c03157f83405213",
    4: "https://rinkeby.infura.io/v3/76af76acd4fa47f99214ad183eb4f145",
  };

  //Initialize Coinbase
  export const [coinbaseWallet, cbwHooks] = initializeConnector(
    (actions) =>
      new CoinbaseWallet(actions, {
        url: URLS[1],
        appName: 'books-of-ye',
      })
  )
