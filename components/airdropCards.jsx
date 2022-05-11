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
  height: 490px;
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

const AirdropMintBox = (props) => {
  const [tokenModal, setTokenModal] = useState(false)

  const { usePriorityAccount, usePriorityProvider } = getPriorityConnector(
    [metaMask, metaHooks],
    [walletConnect, wcHooks],
    [coinbaseWallet, cbwHooks]
  )

  const account = usePriorityAccount()
  const provider = usePriorityProvider()

  const airdropMint = async () => {
    setTokenModal(true)

    const boyContract = getContract(account, provider)
    await boyContract.airdropMint(account, getProofForAddress(account))
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
        <CloseModelX/>
        <TokenModalImage src={'./unknown-card.png'} />
      </TokenModal>
    </>
  )
}

export default AirdropMintBox
