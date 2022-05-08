import { useEffect, useState } from 'react'
import cardInfo from '../utils/cardData'
import instance from '../utils/BooksOfYeContract'
import styles from '../styles/App.module.css'
import styled from 'styled-components';
import Tab from '../components/Tab'
import Layout from '../components/Layout'
import web3 from '../utils/web3'
import { walletConnect, wcHooks } from '../components/connectors/WalletConnect'
import { coinbaseWallet, cbwHooks } from '../components/connectors/Coinbase'
import { metaHooks, metaMask } from '../components/connectors/Metamask'
import { getPriorityConnector } from '@web3-react/core'
import Countdown from 'react-countdown'
import WalletModal from '../components/WalletModal'
import AirdropMintBox from '../components/airdropCards'
import DisconnectButton from '../components/DisconnectButton'
import { getContract } from '../utils/BoyContract'
import { BlockForkEvent } from '@ethersproject/abstract-provider'
import { getProofForAddress } from '../merkle_tree.js'
import proof from '../merkle_tree.js';

function App(props) {
  const [amountLeft, setAmountLeft] = useState(
    props.tokensLeft ? props.tokensLeft : '???'
  )
  const [saleEvent, setSaleEvent] = useState({})
  const [isWhiteListed, setIsWhiteListed] = useState(false)
  const storeChainId = 4
  const metamaskActive = metaHooks.useIsActive();

  const [airdropActive, setAirdropActive] = useState(false);
  const [cardsToMint, setCardsToMint] = useState(0);
  const [cardsToClaim, setCardsToClaim] = useState(0);
  const [airdropClaimed, setAirdropClaimed] = useState(false);
  const [tokenModal, setTokenModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [mintWasSuccessful, setMintWasSuccessful] = useState(false)
  const [showMintResult, setShowMintResult] = useState(false)
  const [isSigning, setIsSigning] = useState(false)


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
    console.log("Cards To Mint",cardsToMint);
    console.log(airdropActive);
  }, [])

  useEffect(() => {
    checkChainBeforeContractInteraction()
  }, [chainId])

  const checkChainBeforeContractInteraction = async () => { 
    if (chainId === storeChainId) {
      getActiveSaleEvent()
      checkIfWhiteListed()
      isAirdropActive()
      checkCardsToClaim()
      claimedAirdrop()
      

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

  const checkIfWhiteListed = async () => {
    const wl = await instance.methods.checkWhitelist(account, getProofForAddress(account)).call();
    setIsWhiteListed(wl)
  }

  const isAirdropActive = async () => {
    const airdropOn = await instance.methods.airdropActive.call();
    if (airdropOn){
      setAirdropActive(true);
    } else {
      setAirdropActive(false);
    }
  }

  const checkCardsToClaim = async () => { 
      try{
      console.log("account", account);
      const cards = await instance.methods.balanceOf(account).call();
      const quantity = cards * 5;
      console.log("Cards to claim:" + quantity);
  
      if (quantity > 0){
        setCardsToClaim(quantity);
      } else  {
        setCardsToClaim(0);
      }
      return quantity;
    }
    catch (e){
      console.log(e.message);
    }
    
  }

  const claimedAirdrop = async () => { 
    const isClaimedAirdrop = await instance.methods.isReimbursed().call();
    console.log("claimed airdrop:" + isClaimedAirdrop);

    if (isClaimedAirdrop) {
      setAirdropClaimed(true);
    } else {
      setAirdropClaimed(false);
    }
    
    return isClaimedAirdrop;
  }

  const refreshPage = () => {
    window.location.reload()
  }

  const mintClick = async () => {
    const account = usePriorityAccount();

    try {
      const boyContract = getContract(account, provider)

      if (isWhiteListed && isPreSale) {
        await boyContract.preSaleMint(saleEvent.saleEventNumber, 1, {
          value: ethers.utils.parseEther(props.price.toString()),
        })
      } else if (!isPreSale && isPublicSale) {
        await boyContract.publicMint(saleEvent.saleEventNumber, 1, {
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

  const displayCards = (
    <div className={styles.App}>
      {metamaskActive ? null : <DisconnectButton /> }
      <h1 className={styles.mintSubtext}>Quantity To Mint</h1>
      <div className={styles.quantityContainer}>
        <form>
          <div style={{marginLeft: "auto", marginRight: "auto"}}>
            <button className={styles.qtyButton} id="1" type="button" value="1" onClick={() => setCardsToMint(1)}>1</button>
            <button className={styles.qtyButton} id="2" type="button" value="2" onClick={() => setCardsToMint(2)}>2</button>
            <button className={styles.qtyButton} id="3" type="button" value="3" onClick={() => setCardsToMint(3)}>3</button>
            <button className={styles.qtyButton} id="4" type="button" value="4" onClick={() => setCardsToMint(4)}>4</button>
            <button className={styles.qtyButton} id="5" type="button" value="5" onClick={() => setCardsToMint(5)}>5</button>
            <button className={styles.qtyButton} id="6" type="button" value="6" onClick={() => setCardsToMint(6)}>6</button>
            <button className={styles.qtyButton} id="7" type="button" value="7" onClick={() => setCardsToMint(7)}>7</button>
            <button className={styles.qtyButton} id="8" type="button" value="8" onClick={() => setCardsToMint(8)}>8</button>
          </div>
          <button className={styles.mintButton} type="submit" onSubmit={() => mintClick()}>Mint Exodus Card</button>
        </form>
      </div>
    </div>
  )

  const displayAirdropScreen = (
    <div className={styles.App}>
      {metamaskActive ? null : <DisconnectButton /> }
      <h1 className={styles.welcomeScreenText}></h1>

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
    // IS AIRDROP ACTIVE AND PUBLIC/PRESALE IS OFF
      
      if (airdropActive && !isPublicSale && !isPreSale ) {
      
      //Users that have Genesis cards to claim and have not yet
      if (cardsToClaim > 0){
        return (
          <>
            <div className={styles.airdropContainer}>
              <h1 className={styles.airdropScreenText}>
                Press below to claim your cards.
              </h1>
              <p className={styles.airdropSubText}>When signing the transaction, cards from the new contract will be minted to your wallet 
              <br></br>according to the new multiples.</p>
              <AirdropMintBox cardsToClaim={cardsToClaim}></AirdropMintBox>

            </div>
            ;
          </>
        )
      } 
      //Users that have Genesis cards but have claimed airdrop already
      else if (airdropClaimed && cardsToClaim > 0){
        return (
          <>
            <div className={styles.airdropContainer}>
              <h1 className={styles.airdropScreenText}>
                Your cards have been claimed.
              </h1>
              <p className={styles.airdropSubText}>Please check your wallet. </p>
              <DisconnectButton/>

            </div>
            ;
          </>
        )
      } 
      //Users that have 0 Genesis cards
      else if (!airdropClaimed && cardsToClaim == 0){
        return (
          <>
            <div className={styles.airdropContainer}>
              <p style={{fontFamily: "Inter", fontSize:"10px"}} className={styles.airdropSubText}>WE'RE SORRY</p>
              <h1 className={styles.airdropScreenText}>
              There doesn’t appear to be any Genesis <br></br>cards in this wallet.
              </h1>
              <DisconnectButton/>

            </div>
            ;
          </>
        )
      }
    }
    //IF PRESALE AND PUBLIC SALE IS OFF
    else if (!isPreSale && !isPublicSale) {
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
    } 
    //PRE-SALE IS ACTIVE AND ON WL
    else if (isActive && isPreSale && isWhiteListed) {
        return (
        <>
          <div className={styles.header}>
            <img className={styles.logo} src={"/logo.png"} alt="" />
            <div className={styles.videoContainer}>
              <video autoPlay loop style={{ width: '100%', height: '100%' }}>
                <source src="/testvideo.mp4" />
              </video>
            </div>
          </div>
          <div className={styles.App}>
          {metamaskActive ? null : <DisconnectButton /> }
            <h1 className={styles.mintSubtext}>Quantity To Mint</h1>
          <div>
            <form className={styles.formContainer}>
              <div className={styles.quantityContainer}>
                <button className={styles.qtyButton} id="1" type="button" value="1" onClick={() => setCardsToMint(1)}>1</button>
                <button className={styles.qtyButton} id="2" type="button" value="2" onClick={() => setCardsToMint(2)}>2</button>
                <button className={styles.qtyButton} id="3" type="button" value="3" onClick={() => setCardsToMint(3)}>3</button>
                <button className={styles.qtyButton} id="4" type="button" value="4" onClick={() => setCardsToMint(4)}>4</button>
                <button className={styles.qtyButton} id="5" type="button" value="5" onClick={() => setCardsToMint(5)}>5</button>
                <button className={styles.qtyButton} id="6" type="button" value="6" onClick={() => setCardsToMint(6)}>6</button>
                <button className={styles.qtyButton} id="7" type="button" value="7" onClick={() => setCardsToMint(7)}>7</button>
                <button className={styles.qtyButton} id="8" type="button" value="8" onClick={() => setCardsToMint(8)}>8</button>
              </div>
              <button className={styles.mintButton} type="submit" onSubmit={() => mintClick()}>Mint Exodus Card</button>
            </form>
          </div>
          </div>  
        </>
        )
      
    // PUBLIC SALE IS ACTIVE
      } 
    //PUBLIC SALE
    else if (isActive && isPublicSale && !isPreSale) {
        return (
        <>
        <div className={styles.header}>
          <img className={styles.logo} src={"/logo.png"} alt="" />
          <div className={styles.videoContainer}>
            <video autoPlay loop style={{ width: '100%', height: '100%' }}>
              <source src="/testvideo.mp4" />
            </video>
          </div>
        </div>
        <div className={styles.App}>
        {metamaskActive ? null : <DisconnectButton /> }
          <h1 className={styles.mintSubtext}>Quantity To Mint</h1>
        <div>
          <form className={styles.formContainer}>
            <div className={styles.quantityContainer}>
              <button className={styles.qtyButton} id="1" type="button" value="1" onClick={() => setCardsToMint(1)}>1</button>
              <button className={styles.qtyButton} id="2" type="button" value="2" onClick={() => setCardsToMint(2)}>2</button>
              <button className={styles.qtyButton} id="3" type="button" value="3" onClick={() => setCardsToMint(3)}>3</button>
              <button className={styles.qtyButton} id="4" type="button" value="4" onClick={() => setCardsToMint(4)}>4</button>
              <button className={styles.qtyButton} id="5" type="button" value="5" onClick={() => setCardsToMint(5)}>5</button>
              <button className={styles.qtyButton} id="6" type="button" value="6" onClick={() => setCardsToMint(6)}>6</button>
              <button className={styles.qtyButton} id="7" type="button" value="7" onClick={() => setCardsToMint(7)}>7</button>
              <button className={styles.qtyButton} id="8" type="button" value="8" onClick={() => setCardsToMint(8)}>8</button>
            </div>
            <button className={styles.mintButton} type="submit" onSubmit={() => mintClick()}>Mint Exodus Card</button>
          </form>
        </div>
        </div>
        </>
        )
      } 
    // PRESALE IS ACTIVE AND USER ISNT ON WL
    else if ((isPreSale && !isPublicSale && !isWhiteListed) || (isPreSale && isPublicSale && !isWhiteListed)
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
    }  
    else {
      return displayConnectScreen;
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
