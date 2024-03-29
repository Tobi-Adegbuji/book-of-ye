import React, { useEffect, useState } from 'react'

import styled from 'styled-components'
import ReactModal from 'react-modal'
import WalletVendor from './WalletVendor'
import { metaHooks, metaMask } from './connectors/Metamask'

const Modal = styled(ReactModal)`
  color: ${(props) => props.textColor || 'black'};
  background-color: ${(props) =>
    props.bgColor || (props.darkMode ? '#2B2B2B' : 'white')};
  width: 50%;
  height: 490px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-color: ${(props) => props.bgColor || 'white'};
  border-radius: 7px;
  display: flex;
  align-items: center;
  flex-direction: column;
  word-wrap: break-word;
  border-radius: 12px;
  box-sizing: border-box;
  max-width: 500px;
  overflow-x: hidden;
  @media only screen and (max-width: 600px) {
    width: 95%;
  }
  :focus {
    outline: 0;
  }
`

const WalletVendorContainer = styled.div`
  height: 90%;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const ModalCloseIcon = styled.div`
  height: 50%;
  width: 15px;
  background-color: #dd6262;
  margin-left: 10px;
  border-radius: 50%;
  transition: ease-in-out 0.1s;
  :hover {
    box-shadow: ${(props) => (props.darkMode ? '0 0 4px red' : '0 0 2px red')};
  }
`

const ModalTab = styled.div`
  width: 100%;
  height: 30px;
  background-color: ${(props) =>
    props.darkMode ? '#232323' : 'rgba(0, 0, 0, 0.1)'};
  display: flex;
  align-items: center;
`

const ConnectButton = styled.div`
  box-shadow: rgba(0, 0, 0, 0.1) 0.5px 0.5px 4px 0.5px;
  width: 25%;
  height: 45px;
  text-align: center;
  border-radius: 7px;
  display: flex;
  align-items: center;
  font-weight: bold;
  font-family: Inter;
  font-size: 14px;
  letter-spacing: 4px;
  justify-content: center;
  cursor: pointer;
  margin-top: 10px;
  background-color: ${(props) => (props.darkMode ? '#2F2F2F' : 'white')};
  color: ${(props) => (props.darkMode ? 'white' : 'black')};
  @media only screen and (max-width: 600px) {
    width: 50%;
  }
`

function WalletModal(props) {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  
  useEffect(() => {
    metaMask.connectEagerly()
  }, [])

  const handleCloseModal = () => {
    setModalIsOpen(false)
  }

  useEffect(() => {
    setModalIsOpen(props.modalIsOpen)
  }, [props.modalIsOpen])

  return (
    <>
      <ConnectButton
        darkMode={props.darkMode}
        onClick={() => {
          setModalIsOpen(true)
        }}
      >
        CONNECT
      </ConnectButton>
      <Modal
        darkMode={props.darkMode}
        isOpen={modalIsOpen}
        textColor={props.textColor}
        bgColor={props.bgColor}
        shouldCloseOnOverlayClick={true}
        preventScroll={true}
        ariaHideApp={false}
        style={{
          overlay: {
            zIndex: '2',
            backgroundColor: props.modalBgColor || 'black',
            background: 'rgba(0, 0, 0, 0.4)',
          },
        }}
      >
        <ModalTab>
          <ModalCloseIcon
            darkMode={props.darkMode}
            onClick={() => setModalIsOpen(false)}
          />
        </ModalTab>

        <WalletVendorContainer>
          <WalletVendor
            vendorName="Metamask"
            darkMode={props.darkMode}
            imageUrl={'./metafox.svg.png'}
            closeModal={handleCloseModal}
          />
          <WalletVendor
            vendorName="Coinbase"
            darkMode={props.darkMode}
            imageUrl={'./coinbase.png'}
            closeModal={handleCloseModal}
          />
          <WalletVendor
            vendorName="Wallet Connect"
            darkMode={props.darkMode}
            imageUrl={'./walletconnect.ico'}
            closeModal={handleCloseModal}
          />
        </WalletVendorContainer>
      </Modal>
    </>
  )
}

export default WalletModal