import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";

export const [metaMask, metaHooks] = initializeConnector(
    (actions) => new MetaMask(actions)
  );