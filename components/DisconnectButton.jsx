import { getPriorityConnector } from '@web3-react/core';
import React from 'react'
import styled from 'styled-components'
import { cbwHooks, coinbaseWallet } from './connectors/Coinbase';
import { metaHooks, metaMask } from './connectors/Metamask'
import { walletConnect, wcHooks } from './connectors/WalletConnect';


const DisconnectBtn = styled.div`
color: white;
background-color: black;
width: fit-content;
padding: 1em;
border-radius: .3em;
margin-top: 20px;
cursor: pointer;
`; 

const DisconnectButton = () => {

    const { usePriorityConnector } =
    getPriorityConnector(
      [metaMask, metaHooks],
      [walletConnect, wcHooks],
      [coinbaseWallet, cbwHooks]
    )

    const wallet = usePriorityConnector();

  return (
    <DisconnectBtn onClick={() => wallet.deactivate()}>
        Disconnect Wallet 
    </DisconnectBtn>
  )
}

export default DisconnectButton