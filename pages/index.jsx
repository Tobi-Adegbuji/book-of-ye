import Card from '../components/Card'
import { useEffect, useState } from 'react'
import cardInfo from '../utils/cardData'
import instance from '../utils/BooksOfYeContract'
import styles from '../styles/App.module.css'
import Tab from '../components/Tab'
import Layout from '../components/Layout'
import web3 from '../utils/web3'
import { walletConnect, wcHooks } from '../components/connectors/WalletConnect'
import { coinbaseWallet, cbwHooks } from '../components/connectors/Coinbase'
import { metaHooks, metaMask } from '../components/connectors/Metamask'
import { getPriorityConnector } from '@web3-react/core'
import Countdown from 'react-countdown'
import WalletModal from '../components/WalletModal'
import DisconnectButton from '../components/DisconnectButton'
import { getContract } from '../utils/BoyContract'


function App(props) {
  const [amountLeft, setAmountLeft] = useState(
    props.tokensLeft ? props.tokensLeft : '???'
  )
  const [saleEvent, setSaleEvent] = useState({})
  const [cards, setCards] = useState([])
  const [isWhiteListed, setIsWhiteListed] = useState(false)
  const storeChainId = 1
  const metamaskActive = metaHooks.useIsActive();

  const cardName = [
    'Let There Be Light',
    'Garden Of Eden',
    "Noah's Ark",
    'The Tower Of Babel',
    "Lot's Wife",
  ]
  const bookPassage = [
    'Genesis 1:3',
    'Genesis 1:27',
    'Genesis 7:1',
    'Genesis 11:19',
    'Genesis 19:26',
  ]

  const {
    usePriorityAccount,
    usePriorityIsActive,
    usePriorityProvider,
    usePriorityChainId,
  } = getPriorityConnector(
    [metaMask, metaHooks],
    [walletConnect, wcHooks],
    [coinbaseWallet, cbwHooks]
  )

  const account = usePriorityAccount()
  const isConnected = usePriorityIsActive()
  const chainId = usePriorityChainId()

  useEffect(() => {
    metaMask.connectEagerly()
    coinbaseWallet.connectEagerly()
    walletConnect.connectEagerly()
  }, [])

  useEffect(() => {
    checkChainBeforeContractInteraction()
  }, [chainId])

  const checkChainBeforeContractInteraction = async () => { 
    if (chainId === storeChainId) {
      getActiveSaleEvent()
      refreshInventory()
      checkIfWhiteListed()
    }
  }

  const getActiveSaleEvent = async () => {
    for (let i = 0; i < 5; i++) {
      const sEvent = await instance.methods.viewSaleStatus(i).call()

      if (sEvent[1]) {
        setSaleEvent({
          price: web3.utils.fromWei(sEvent[0], 'ether'),
          isActive: sEvent[1],
          isPreSale: sEvent[2],
          isPublicSale: sEvent[3],
          minCardId: sEvent[4],
          maxCardId: sEvent[5],
          saleEventNumber: i,
        })
        break
      }
    }
  }

  const getTotalTokens = () => {
    let sum = 0
    cardInfo.forEach((array) => {
      sum += array.length
    })
    setAmountLeft(sum)
  }

  const refreshInventory = async () => {
    //Get Minted Ids
    const ids = await instance.methods.viewMintedCards().call()

    //Remove the minted Ids from cardInfo arrays
    for (let i = 0; i < cardInfo.length; i++) {
      ids.forEach((mintedId) => {
        const id = parseInt(mintedId)
        if (cardInfo[i].includes(id)) {
          for (let j = 0; j < cardInfo[i].length; j++) {
            if (cardInfo[i][j] === id) {
              cardInfo[i].splice(j, 1)
            }
          }
        }
      })
    }

    const cardProps = []

    const colorways = ['gold', 'platinum', 'crimson', 'cobalt']

    let cardRow = []

    for (let i = 0, j = 0; i < cardInfo.length; i++, j++) {
      if (j == 4) {
        j = 0
        cardProps.push(cardRow)
        cardRow = []
      }

      const randIndex = Math.floor(Math.random() * cardInfo[i].length - 1) + 1

      const card = {
        tokenId: cardInfo[i][0] == undefined ? -1 : cardInfo[i][randIndex],
        img: `${i}.png`,
        color: colorways[j],
        amount: cardInfo[i].length,
      }

      cardRow.push(card)

      if (i === cardInfo.length - 1) {
        cardProps.push(cardRow)
      }
    }

    setCards(cardProps)
    getTotalTokens()
  }

  const checkIfWhiteListed = async () => {
    
    const wl = await instance.methods.checkWhitelist(0, account).call()
    setIsWhiteListed(wl)
  }

  const refreshPage = () => {
    window.location.reload()
  }

  const displayCards = (
    <div className={styles.App}>
      {metamaskActive ? null : <DisconnectButton /> }
      {cards.map((cardArray, key) => {
        return (
          <div key={key} className={styles.cardRow}>
            <h5 className={styles.bookPassage}>{bookPassage[key]}</h5>
            <h3 className={styles.cardNames}>{cardName[key]}</h3>
            <div className={styles.cardContainer}>
              {cardArray.map((card) => {
                return (
                  <Card
                    account={account}
                    key={card.tokenId}
                    refreshInventory={refreshInventory}
                    tokenId={card.tokenId}
                    img={card.img}
                    color={card.color}
                    cardName={cardName[key]}
                    amount={card.amount}
                    price={saleEvent.price}
                    checkIfWhiteListed={checkIfWhiteListed}
                    isWhiteListed={isWhiteListed}
                    isPreSale={saleEvent.isPreSale}
                    isPublicSale={saleEvent.isPublicSale}
                    saleEventNumber={saleEvent.saleEventNumber}
                    getActiveSaleEvent={getActiveSaleEvent}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )

  const displayConnectScreen = (
    <div className={styles.welcomeScreen}>
      <p className={styles.welcomeSubText}>WELCOME</p>
      <h1 className={styles.welcomeScreenText}>Please Connect Your Wallet</h1>
      <WalletModal darkMode />
    </div>
  )

  const displayScreen = () => {
    const isActive = saleEvent.isActive
    const isPreSale = saleEvent.isPreSale
    const isPublicSale = saleEvent.isPublicSale

    if (isConnected && chainId === storeChainId) {
      if (!isPreSale && !isPublicSale) {
        if (isWhiteListed) {
          return (
            <>
              <p className={styles.welcomeSubText}>THANK YOU</p>;
              {metamaskActive ? null : <DisconnectButton /> }
              <h1 className={styles.welcomeScreenText}>
                You are on the whitelist.
                <br></br>
                <br></br>The Pre-Sale begins in: <br></br>
                <br></br>
                <Countdown date={'2022-02-28T13:00:00.000-05:00'}>
                  <button onClick={refreshPage}>Enter Sale</button>
                </Countdown>
              </h1>
              ;
            </>
          )
        } else if (!isWhiteListed) {
          return (
            <>
              <p className={styles.welcomeSubText}>THANK YOU</p>
              <h1 className={styles.welcomeScreenText}>
                The Sale will begin after the Pre-Sale has finished, if there is
                remaining stock.
                <br></br>
                <br></br>The Pre-Sale begins in: <br></br>
                <br></br>
                <Countdown date={'2022-02-28T13:00:00.000-05:00'}></Countdown>
              </h1>
            </>
          )
        }
      } else if (isActive && isPreSale && isWhiteListed) {
        return displayCards
      } else if (isActive && isPublicSale && !isPreSale) {
        return displayCards
      } else if (
        (isPreSale && !isPublicSale && !isWhiteListed) ||
        (isPreSale && isPublicSale && !isWhiteListed)
      ) {
        return (
          <>
            {metamaskActive ? null : <DisconnectButton /> }
            <p className={styles.welcomeSubText}>THANK YOU</p>
            <h1 className={styles.welcomeScreenText}>
              The Sale will begin after the Pre-Sale has finished, if there is
              remaining stock.
            </h1>
            ;
          </>
        )
      }
    } else {
      return displayConnectScreen
    }
  }

  const preSaleOrPublic = () => {
    if (!saleEvent.isPresale && !saleEvent.isPublicSale) {
      return 'Pre-Sale'
    } else if (saleEvent.isPresale && !saleEvent.isPublicSale) {
      return 'Pre-Sale'
    } else if (!saleEvent.isPresale && saleEvent.isPublicSale) {
      return 'Sale'
    }
  }

  return (
    <>
      <Layout>
        <div className={styles.header}>
          <img className={styles.logo} src={"/logo.png"} alt="" />
          Please note that there is a limit of 8 Cards per person.
        </div>
        {displayScreen()}
      </Layout>
      <Tab
        amountLeft={amountLeft}
        total={200}
        price={saleEvent.price}
        stage={preSaleOrPublic()}
      />
    </>
  )
}

export default App
