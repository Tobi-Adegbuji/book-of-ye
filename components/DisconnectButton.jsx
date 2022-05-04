import { getPriorityConnector } from '@web3-react/core';
import React from 'react'
import styled from 'styled-components'
import { cbwHooks, coinbaseWallet } from './connectors/Coinbase';
import { metaHooks, metaMask } from './connectors/Metamask'
import { walletConnect, wcHooks } from './connectors/WalletConnect';


const DisconnectBtn = styled.div`
color: black;
background-color: #F3EEE4;
width: 225px;
padding: 2em;
border-radius: .3em;
margin-top: 20px;
cursor: pointer;
font-size: 7px;
font-family: "Inter";
text-align: center;
`; 

const DisconnectButton = () => {

    const { usePriorityConnector } = getPriorityConnector([metaMask, metaHooks], [walletConnect, wcHooks], [coinbaseWallet, cbwHooks])

    const wallet = usePriorityConnector();

  return (
    
    <DisconnectBtn onClick={() => wallet.deactivate()}>
        CONNECT A DIFFERENT WALLET
    </DisconnectBtn>
  )
}

export default DisconnectButton