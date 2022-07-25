import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { BigNumber, Contract, providers, utils } from "ethers";
import { useEffect, useRef, useState, useCallback } from "react";
import { CONTRACT_ADDRESS, abi } from "../constants";
// import mainImg from "../public/vercel.svg";
import ErrorMessage from "../components/Errors";
import TxList from "../components/TxList";
import Bank from "../components/Bank";
import Nav from "../components/Nav";



export default function Home() {

  const [loading, setLoading] = useState(false);


  return (
    <div>
      <Head>
        <title>DEFI BANK</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Nav />

      <Bank />


      <footer className={styles.footer}>
        Made with &#10084; by Crypto Bro
      </footer>
    </div>
  );
}
