import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect';


const URLS = {
    1: "https://mainnet.infura.io/v3/84842078b09946638c03157f83405213",
    4: "https://rinkeby.infura.io/v3/76af76acd4fa47f99214ad183eb4f145",
  };

export const [walletConnect, wcHooks] = initializeConnector(
  (actions) => new WalletConnect(actions, {rpc: URLS}),
    [1,4]
 )