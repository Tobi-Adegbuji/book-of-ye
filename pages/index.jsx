import Head from "next/head";
import Card from "../components/Card";
import { useEffect, useState } from "react";
import cardInfo from "../utils/cardData";
import instance from "../utils/BooksOfYeContract";
import styles from "../styles/App.module.css";
import Tab from "../components/Tab";
import Layout from "../components/Layout";
import web3 from "../utils/web3";

function App(props) {
  const [amountLeft, setAmountLeft] = useState(props.tokensLeft);
  const [saleEvent, setSaleEvent] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [metaInstalled, setMetaInstalled] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [cards, setCards] = useState([]);
  const [isWhiteListed, setIsWhiteListed] = useState(false); 
  const cardName = [
    "Let There Be Light",
    "Garden Of Eden",
    "Noah's Ark",
    "The Tower Of Babel",
    "Lot's Wife"
  ];
  const bookPassage = [
    "Genesis 1:3",
    "Genesis 1:27",
    "Genesis 7:1",
    "Genesis 11:19",
    "Genesis 19:26"
  ];

  useEffect(() => {
    getActiveSaleEvent();
    refreshInventory();
    isMetaMaskInstalled();
    checkIfLoggedIn();
    checkIfWhiteListed(); 
  }, []);

  const checkIfLoggedIn = async () => {
    const accounts = await web3.eth.getAccounts();
    setLoggedIn(accounts.length != 0);
  }

  //Returns 1st active sale event that it finds from least to greatest
  const getActiveSaleEvent = async () => {
    for (let i = 0; i < 5; i++) {
      const sEvent = await instance.methods.viewSaleStatus(i).call();
      if (sEvent[1]) {
        setSaleEvent(
          {
            price: web3.utils.fromWei(sEvent[0], "ether"),
            isActive: sEvent[1],
            isPreSale: sEvent[2],
            isPublicSale: sEvent[3],
            minCardId: sEvent[4],
            maxCardId: sEvent[5],
            saleEventNumber: i
          }
        );
        break;
      }
    }
  };

  const getTotalTokens = () => {
    let sum = 0;
    cardInfo.forEach((array) => {
      sum += array.length;
    });
    setAmountLeft(sum);
  };

  const refreshInventory = async () => {
    //Get Minted Ids
    const ids = await instance.methods.viewMintedCards().call();

    // console.log("Minted Ids: ", ids);

    //Remove the minted Ids from cardInfo arrays
    for (let i = 0; i < cardInfo.length; i++) {
      ids.forEach((mintedId) => {
        const id = parseInt(mintedId);
        if (cardInfo[i].includes(id)) {
          for (let j = 0; j < cardInfo[i].length; j++) {
            if (cardInfo[i][j] === id) {
              cardInfo[i].splice(j, 1);
            }
          }
        }
      });
    }

    // console.log("Card Info: ", cardInfo);

    const cardProps = [];

    const colorways = ["gold", "platinum", "crimson", "cobalt"];

    let cardRow = [];

    for (let i = 0, j = 0; i < cardInfo.length; i++, j++) {
      if (j == 4) {
        j = 0;
        cardProps.push(cardRow);
        cardRow = [];
      }

      const card = {
        tokenId: cardInfo[i][0] == undefined ? -1 : cardInfo[i][0],
        img: `${i}.png`,
        color: colorways[j],
        amount: cardInfo[i].length,
      };

      cardRow.push(card);

      if (i === cardInfo.length - 1) {
        cardProps.push(cardRow);
      }
    }

    // console.log(cardProps);
    setCards(cardProps);
    getTotalTokens();
  };

  const isMetaMaskInstalled = () => {
    const { ethereum } = window;
    
    setMetaInstalled(Boolean(ethereum && ethereum.isMetaMask));
  };

  const onClickConnect = async () => {
    try {
      setShowSpinner(true);
      await ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      setLoggedIn(accounts.length != 0);
      setShowSpinner(false);
    } catch (error) {
      console.error(error);
      setShowSpinner(false);
    }
  };

  const checkIfWhiteListed = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    const wl = await instance.methods.checkWhitelist(0, account).call();
    setIsWhiteListed(wl)
  }

  const displayCards = (
    <div className={styles.App}>
      {cards.map((cardArray, key) => {
        return (
          <div className={styles.cardRow}>
            <h5 className={styles.bookPassage}>{bookPassage[key]}</h5>
            <h3 className={styles.cardNames}>{cardName[key]}</h3>
            <div className={styles.cardContainer}>
              {cardArray.map((card, key) => {
                return (
                  <Card
                    key={key}
                    refreshInventory={refreshInventory}
                    isMetaMaskInstalled={isMetaMaskInstalled}
                    checkIfLoggedIn={checkIfLoggedIn}
                    tokenId={card.tokenId}
                    img={card.img}
                    color={card.color}
                    amount={card.amount}
                    price={saleEvent[0]}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const displayConnectScreen = (
    <div className={styles.welcomeScreen}>
      <p>Welcome</p>
      <h1>Please Connect Your Wallet</h1>
      {metaInstalled ? (
        <>
          {showSpinner ? (
            <img src="/modalCircle.png" className="rotate" />
          ) : (
            <button onClick={onClickConnect}>Connect MetaMask</button>
          )}
        </>
      ) : (
        <>
          <h4>Oops, doesn't seem you have MetaMask installed.</h4>
          <a href="https://metamask.io/download/" className="button">
            Install MetaMask Here
          </a>
        </>
      )}
    </div>
  );

  const displayScreen = () => {
    const isActive = saleEvent.isActive;
    const isPreSale = saleEvent.isPreSale;
    const isPublicSale = saleEvent.isPublicSale;

    console.log(saleEvent)

    if (loggedIn) {

      console.log("User is whitelisted: ", isWhiteListed)


      if (!isPreSale && !isPublicSale) {
        if (isWhiteListed) {
          return <h1>You are on whitelist but no active sale</h1>;
        } else {
          return <h1>Public Sale will begin after pre-sale.</h1>;
        }
      } else if (isActive && isPreSale && isWhiteListed) {
        return displayCards;
      } else if (isActive && isPublicSale && !isPreSale) {
        return displayCards;
      }
    } else {
      return displayConnectScreen;
    }
  };

  return (
    <>
      <Layout>
        <img className={styles.logo} src={"/logo.png"} alt="" />
        {displayScreen()}
      </Layout>
      <Tab
        amountLeft={amountLeft}
        total={200}
        price={saleEvent.price}
        stage={saleEvent.isPreSale ? "Pre-Sale" : "Sale"}
      />
    </>
  );
}

export default App;
