import { getPriorityConnector } from '@web3-react/core';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import styles from '../styles/App.module.css';
import instance from '../utils/BooksOfYeContract'
import proof from '../merkle_tree';
import { getProofForAddress } from '../merkle_tree';
import { cbwHooks, coinbaseWallet } from './connectors/Coinbase';
import { metaHooks, metaMask } from './connectors/Metamask'
import { walletConnect, wcHooks } from './connectors/WalletConnect';

const Container = styled.div`
display: flex;
align-items: center;
align-content: center;
width: 70%;
margin-top: 20px;


`

const ClaimCards = styled.div`
display: inline;
color: black;
background-color: #F3EEE4;
width: 200px;
padding: 2em;
border-radius: .3em;
margin-top: 0px;
cursor: pointer;
font-size: 8px;
font-family: "Inter";
text-align: center;
`; 

const QtyContainer = styled.div`
display: inline;
color: white;
padding-left: 10%;
padding-top: 4%;
width: 200px;


`
const QtyText = styled.p`
    display: block;
    font-family: "Inter";
    font-size: 8px;
    margin-top: 10px;
    padding-top: 10px;
`
const QtyNumber = styled.h1`
    display: block;
    font-family: "Vaporetta";
    font-size: 36px;
    margin-top: -5px;
`

const AirdropMintBox = (props) => {
  const {
    usePriorityAccount,
  } = getPriorityConnector(
    [metaMask, metaHooks],
    [walletConnect, wcHooks],
    [coinbaseWallet, cbwHooks]
  )

  const account = usePriorityAccount();

  const airdropMint = async () => {
      await instance.methods.airdropMint(account, getProofForAddress(account)).call(); 
    }


  return (
    <Container className='airdropContainer'>
        <ClaimCards onClick={() => airdropMint()}>
            CLAIM CARDS
        </ClaimCards>
        <QtyContainer>
            <QtyText>CARDS TO CLAIM</QtyText>
            <QtyNumber>{props.cardsToClaim}</QtyNumber>
        </QtyContainer>
    </Container>
    
  )
}

export default AirdropMintBox;