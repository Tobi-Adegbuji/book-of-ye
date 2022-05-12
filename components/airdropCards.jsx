import { getPriorityConnector } from '@web3-react/core'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import styles from '../styles/App.module.css'
import instance from '../utils/BooksOfYeContract'
import proof from '../merkle_tree'
import { getProofForAddress } from '../merkle_tree'
import { cbwHooks, coinbaseWallet } from './connectors/Coinbase'
import { metaHooks, metaMask } from './connectors/Metamask'
import { walletConnect, wcHooks } from './connectors/WalletConnect'
import { getContract } from '../utils/BoyContract'
import ReactModal from 'react-modal'

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
  background-color: #f3eee4;
  width: 200px;
  padding: 2em;
  border-radius: 0.3em;
  margin-top: 0px;
  cursor: pointer;
  font-size: 8px;
  font-family: 'Inter';
  text-align: center;
`

const QtyContainer = styled.div`
  display: inline;
  color: white;
  padding-left: 10%;
  padding-top: 4%;
  width: 200px;
`
const QtyText = styled.p`
  display: block;
  font-family: 'Inter';
  font-size: 8px;
  margin-top: 10px;
  padding-top: 10px;
`
const QtyNumber = styled.h1`
  display: block;
  font-family: 'Vaporetta';
  font-size: 36px;
  margin-top: -5px;
`

const TokenModal = styled(ReactModal)`
  color: #ffffff;
  background-color: #181616;
  width: 50%;
  height: 380px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-color: #181616;
  border-radius: 7px;
  display: flex;
  align-items: center;
  flex-direction: column;
  word-wrap: break-word;
`

const TokenModalImage = styled.img`
  width: 150px;
  position: relative;
  left: 0%;
  top: -15%;
`

const CloseModelX = styled.img`
  margin-left: 20px;
  margin-top: 20px;
  margin-right: auto;
  left: 0;
  top: 0;
  position: absolute;
  cursor: pointer;
`

const ModalCircleLoader = styled.img`
  margin-top: -50px;
  animation: rotation 4s infinite linear;

  @keyframes rotation {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(359deg);
    }
  }
`
const TokenModalHeading = styled.h1`
  font-family: 'Vaporetta';
  font-weight:400;
  font-size: 32px;
`
const TokenModalText = styled.h1`
  font-family: 'Vaporetta';
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  width: 70%;
  text-align: center;
  font-size: 18px;
  margin-top: -5px;
  margin-left: auto;
  margin-right: auto;
  color: #D0CDCD;

`
const ResponseContainer = styled.div`
    width: 100%;
    text-align: center;

`
const ModalStatusImage = styled.img`
  margin-top: -50px;
  margin-left: auto;
  margin-right: auto;

`
const MessageContainer = styled.div`
  text-align: center;
`

const ErrorMessage = styled.p`
  display: block;
  font-family: 'Vaporetta';
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  width: 70%;
  text-align: center;
  font-size: 18px;
  margin-top: -5px;
  margin-left: auto;
  margin-right: auto;
  color: #D0CDCD;
`


const AirdropMintBox = (props) => {
  const [tokenModal, setTokenModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [mintWasSuccessful, setMintWasSuccessful] = useState(false)
  const [showMintResult, setShowMintResult] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

  const { usePriorityAccount, usePriorityProvider } = getPriorityConnector(
    [metaMask, metaHooks],
    [walletConnect, wcHooks],
    [coinbaseWallet, cbwHooks]
  )

  const account = usePriorityAccount()
  const provider = usePriorityProvider()

  const formatErrorMessage = () => {
    if (errorMessage.includes('Mint Limit Reached')) 
      return 'Mint Limit Reached'
    else if (errorMessage.includes('insufficient funds'))
      return 'Insufficient Funds'
    else if (errorMessage.includes('reimbursed'))
      return 'You Have Already Claimed Your Cards'
    else if (errorMessage.includes('whitelist'))
      return 'You Are Not On The Whitelist'
    else if (errorMessage.includes('MetaMask Tx Signature:'))
      return errorMessage.replace('MetaMask Tx Signature:', '')
    else
      return 'Transaction Failed On The Blockchain, Your Purchase Was Reversed'
  }

  const airdropMint = async () => {
    setTokenModal(true)
    try {
    const boyContract = getContract(account, provider)
    await boyContract.airdropMint(account, getProofForAddress(account))

    if (!showMintResult) {
      setShowMintResult(true)
      setMintWasSuccessful(true)
    }
  } catch(e){
    setErrorMessage(e.message)
    if (!showMintResult) {
      setShowMintResult(true)
      setMintWasSuccessful(false)
    }
  }
}


  return (
    <>
      <Container className="airdropContainer">
        <ClaimCards onClick={() => airdropMint()}>CLAIM CARDS</ClaimCards>
        <QtyContainer>
          <QtyText>CARDS TO CLAIM</QtyText>
          <QtyNumber>{props.cardsToClaim}</QtyNumber>
        </QtyContainer>
      </Container>
      <TokenModal
        isOpen={tokenModal}
        preventScroll={true}
        style={{
          overlay: {
            zIndex: 1000,
            backgroundColor: 'black',
            background: 'rgba(0, 0, 0, 0.9)',
          },
        }}
      >
        <TokenModalImage src={'./unknown-card.png'} />
        <CloseModelX src="./close_x.png" 
        onClick={() => { 
          setTokenModal(false) 
          setShowMintResult(false)
        }}
        />

        {!showMintResult ? (
          <ResponseContainer>
            <ModalCircleLoader src={'./modalCircle.png'}></ModalCircleLoader>
            <TokenModalHeading>{isSigning ? 'Signing' : 'Please Sign the Transaction'}</TokenModalHeading>
            <TokenModalText>{isSigning ? '' : 'Note that if the transaction fails on the blockchain, the purchase will be reversed.'}</TokenModalText>  
          </ResponseContainer>
        ) : (
          <ResponseContainer>
            {mintWasSuccessful ? (
              <>
                <ModalStatusImage src="/Checkmark.png"></ModalStatusImage>
                <TokenModalHeading>Cards Minted</TokenModalHeading>
              </>
            ) : (
              <>
                <ModalStatusImage src="/failed.png"></ModalStatusImage>
                <TokenModalHeading>Transaction Failed</TokenModalHeading>
                <MessageContainer>
                  <ErrorMessage>{formatErrorMessage()}</ErrorMessage>
                </MessageContainer>
              </>
            )}
          </ResponseContainer>
        )}
        </TokenModal>
    </>
  )
}

export default AirdropMintBox
