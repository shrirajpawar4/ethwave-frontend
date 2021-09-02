import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/Portal.json"

export default function App() {
  const [currAccount, setCurrAccount] = React.useState("");
  const [allWaves, setAllWaves] = React.useState([]);
  const contractAddress = "0xF7c4fB55636210F7c62352739Cca2d0c5e326381";
  const contractABI = abi.abi;

  const checkWalletConnected = () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure to connect metamask")
      return
    } else {
      console.log("ethereum object", ethereum)
    }

    ethereum.request({ method: 'eth_accounts' })
      .then(accounts => {
        if (accounts.length !== 0) {
          const account = accounts[0];

          console.log("Account: ", account)
          setCurrAccount(account);
        } else {
          console.log("no account found")
        }
      })
  }

  const connectWallet = () => {
    const { ethereum } = window;

     if (!ethereum) {
      alert("Make sure to connect metamask")
    }

    ethereum.request({ method: 'eth_requestAccounts' })
      .then(accounts => {
        console.log("Connected", accounts[0])
        setCurrAccount(accounts[0])
      })
      .catch(err => console.log(err));
  }

  async function getAllWaves() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const waveportalContract = new ethers.contract(contractAddress, contractABI, signer);

    let waves = await waveportalContract.getAllWaves()

    let wavesCleaned = []
    waves.forEach(wave => {
      console.log("wave", wave)
      wavesCleaned.push({
        address: wave.address,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message
      })
    })
    console.log("cleaned", wavesCleaned)
    setAllWaves(wavesCleaned)

  waveportalContract.on("NewWave", (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message)
    setAllWaves(oldArray => [...oldArray, {
      address: from,
      time: new Date(timestamp * 1000),
      message: message
    }])
    })
  }

  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let count = await waveportalContract.getTotalWaves();
    console.log("Retreived total waves", count.toNumber())

    const waveTxn = await waveportalContract.wave("this is a message")
    console.log("Mining..", waveTxn.hash)
    await waveTxn.wait()
    console.log("Mined!", waveTxn.hash)

    count = await waveportalContract.getTotalWaves();
    console.log("Retreived total waves", count.toNumber())
  }

  React.useEffect(() => {
    checkWalletConnected()
  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          I am Shree and I am working in web3 space so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {currAccount ? null : (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
        </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div style={{ backgroundColor: 'OldLace', marginTop: '16px', padding: '8px' }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
