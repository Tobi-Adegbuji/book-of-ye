import React from "react";
import styled from "styled-components";
import { metaHooks, metaMask } from './connectors/Metamask'
import { coinbaseWallet, cbwHooks } from './connectors/Coinbase'
import { walletConnect, wcHooks } from './connectors/WalletConnect'



const Vendor = styled.div`
  background-color: ${(props) =>
    props.bgColor || (props.darkMode ? "#2f2f2f" : "#f8f8ff")};
  width: 100%;
  height: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  box-shadow: rgba(0, 0, 0, 0.1) 0.5px 0.5px 1px 0.5px;
  cursor: pointer;
  transition: ease-in-out 0.3s;
  margin: 10px;
  padding: 10px;
  box-sizing: border-box;
  :hover {
    transform: scale(1.05);
  }
`;

const VendorContainer = styled.div`
  display: flex;
  width: 83%;
  height: 100%;
  align-items: center;
`;

const VendorName = styled.p`
  color: ${(props) => props.textColor || (props.darkMode ? "white" : "black")};
  font-size: 1.3em;
  text-align: center;
  width: 50%;
`;

const VendorImage = styled.div`
  background-image: url(${(props) => props.vendorImageUrl || ""});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 50%;
  height: 100%;
`;

function WalletVendor({
  darkMode,
  imageUrl,
  vendorName,
  closeModal,
}) {
  

  const propmtUser = async () => {
    
    const vendor = vendorName.trim().replace(" ", "");

    //Where activation occurs
    if (vendor === "Metamask"){
      typeof window !== "undefined" && window.ethereum 
      ?  
      metaMask.activate(4)
      :
      window.open('https://metamask.app.link/dapp/shop.booksofye.com/', "_blank")
    }
    if(vendor === "Coinbase")
      coinbaseWallet.activate(4)
    if(vendor === "WalletConnect")
      walletConnect.activate(4)

    closeModal();
  };



  return (
    <>
      <Vendor
        onClick={propmtUser}
        darkMode={darkMode}
      >
        <VendorContainer>
          <VendorImage vendorImageUrl={imageUrl} />
          <VendorName darkMode={darkMode}>{vendorName}</VendorName>
        </VendorContainer>
      </Vendor>
    </>
  );
}

export default WalletVendor;
