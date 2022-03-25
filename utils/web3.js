import Web3 from "web3";

let web3;

try {
    web3 = new Web3(
    new Web3.providers.HttpProvider(
      "https://mainnet.infura.io/v3/ad98fd9132d246f994a90dd9e465f149"
      // "https://rinkeby.infura.io/v3/84842078b09946638c03157f83405213"
      )
    );

} catch (e) {
  console.error(e);
}

export default web3;
