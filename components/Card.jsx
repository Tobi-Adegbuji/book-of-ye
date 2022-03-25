import React, { useState } from 'react'
import styles from '../styles/Card.module.css'
import ReactModal from 'react-modal'
import { getPriorityConnector } from '@web3-react/core'
import { walletConnect, wcHooks } from './connectors/WalletConnect'
import { coinbaseWallet, cbwHooks } from './connectors/Coinbase'
import { metaHooks, metaMask } from './connectors/Metamask'
import { getContract } from '../utils/BoyContract'
import { ethers } from 'ethers'

function Card(props) {
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

  const handleBuyClick = async () => {
    setTokenModal(true)

    try {
      props.getActiveSaleEvent()

      await props.checkIfWhiteListed()
      const boyContract = getContract(account, provider)

      if (props.isWhiteListed && props.isPreSale) {
        await boyContract.preSaleMint(props.saleEventNumber, props.tokenId, {
          value: ethers.utils.parseEther(props.price.toString()),
        })
      } else if (!props.isPreSale && props.isPublicSale) {
        await boyContract.publicMint(props.saleEventNumber, props.tokenId, {
          value: ethers.utils.parseEther(props.price.toString()),
        })
      }
      if (!showMintResult) {
        setShowMintResult(true)
        setMintWasSuccessful(true)
      }
    } catch (e) {
      console.error(e)
      setErrorMessage(e.message)
      if (!showMintResult) {
        setShowMintResult(true)
        setMintWasSuccessful(false)
      }
    }
  }

  const formatErrorMessage = () => {
    if (errorMessage.includes('Mint Limit Reached')) 
      return 'Mint Limit Reached'
    else if (errorMessage.includes('insufficient funds'))
      return 'Insufficient Funds'
    else if (errorMessage.includes('MetaMask Tx Signature:'))
      return errorMessage.replace('MetaMask Tx Signature:', '')
    else
      return 'Transaction Failed On The Blockchain, Your Purchase Was Reversed'
  }

  return (
    <>
      <div className={styles.card}>
        <img
          onClick={props.amount === 0 ? () => {} : handleBuyClick}
          className={styles.cardImage}
          src={`cards/${props.img}`}
        />

        {props.amount > 0 ? (
          <div className={styles.cardTextContainer}>
            <p className={styles.cardBuy} onClick={handleBuyClick}>
              buy
            </p>
            {props.color === 'gold' ? (
              <p className={styles.inventoryText}>{`${props.amount}/1`} LEFT</p>
            ) : null}
            {props.color === 'platinum' ? (
              <p className={styles.inventoryText}>{`${props.amount}/4`} LEFT</p>
            ) : null}
            {props.color === 'crimson' ? (
              <p className={styles.inventoryText}>
                {`${props.amount}/10`} LEFT
              </p>
            ) : null}
            {props.color === 'cobalt' ? (
              <p className={styles.inventoryText}>
                {`${props.amount}/25`} LEFT
              </p>
            ) : null}
          </div>
        ) : (
          <div className={styles.cardSoldOutContainer}>
            <div className={styles.soldOut}>
              <img src={`/check.png`} alt="" />
              <p>sold out</p>
            </div>
          </div>
        )}
      </div>
      <ReactModal
        className={styles.tokenModal}
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
        <img className={styles.tokenModalImage} src={`cards/${props.img}`} />
        {!showMintResult ? (
          <>
            <div className={styles.responseContainer}>
              <img
                className={styles.closeModal}
                src={`close_x.png`}
                onClick={() => {
                  setTokenModal(false)
                  setShowMintResult(false)
                  props.refreshInventory()
                }}
              />
              <img className="rotate" src={`/modalCircle.png`} />
              <h3 className={styles.tokenModalHeading}>
                {isSigning ? 'Signing' : 'Please Sign The Transaction'}
              </h3>
              <div className={styles.messageContainer}>
                <p className={styles.tokenModalText}>
                  {isSigning
                    ? ''
                    : 'Note that if the transaction fails on the blockchain, the purchase will be reversed'}
                </p>
                <hr className={styles.line}></hr>
                <div className={styles.tokenModalLower}>
                  <div className={styles.tokenModalLowerLeft}>
                    <h5 className={styles.tokenModalCardName}>
                      {props.cardName}
                    </h5>
                    <h5 className={styles.tokenModalCardColor}>
                      {props.color}
                    </h5>
                  </div>
                  <div className={styles.tokenModalLowerRight}>
                    <img className={styles.etherIcon} src="/ether.png"></img>
                    <h5 className={styles.tokenModalPrice}>{props.price}</h5>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.responseContainer}>
            <img
              className={styles.closeModal}
              src={`close_x.png`}
              onClick={() => {
                setTokenModal(false)
                setShowMintResult(false)
                props.refreshInventory()
              }}
            />
            {mintWasSuccessful ? (
              <>
                <img className={styles.modalStatusImage} src="/Checkmark.png" />
                <h3 className={styles.tokenModalHeading}>Card Reserved</h3>
                <div className={styles.messageContainer}>
                  <p className={styles.tokenModalText}>
                    Note that if the transaction fails on the blockchain, the
                    purchase will be reversed
                  </p>
                  <hr className={styles.line}></hr>
                  <div className={styles.tokenModalLower}>
                    <div className={styles.tokenModalLowerLeft}>
                      <h5 className={styles.tokenModalCardName}>
                        {props.cardName}
                      </h5>
                      <h5 className={styles.tokenModalCardColor}>
                        {props.color}
                      </h5>
                    </div>
                    <div className={styles.tokenModalLowerRight}>
                      <img className={styles.etherIcon} src="/ether.png"></img>
                      <h5 className={styles.tokenModalPrice}>{props.price}</h5>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <img className={styles.modalStatusImage} src="/failed.png" />
                <h3 className={styles.tokenModalHeading}>Transaction Failed</h3>
                <div className={styles.messageContainer}>
                  <p className={styles.errorMessage}>{formatErrorMessage()}</p>
                  <hr className={styles.line}></hr>
                  <div className={styles.tokenModalLower}>
                    <div className={styles.tokenModalLowerLeft}>
                      <h5 className={styles.tokenModalCardName}>
                        {props.cardName}
                      </h5>
                      <h5 className={styles.tokenModalCardColor}>
                        {props.color}
                      </h5>
                    </div>
                    <div className={styles.tokenModalLowerRight}>
                      <img className={styles.etherIcon} src="/ether.png"></img>
                      <h5 className={styles.tokenModalPrice}>{props.price}</h5>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </ReactModal>
    </>
  )
}

export default Card
