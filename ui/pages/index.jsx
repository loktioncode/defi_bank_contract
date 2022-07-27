import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { BigNumber, Contract, providers, utils } from "ethers";
import { useEffect, useRef, useState, useCallback } from "react";
import { CONTRACT_ADDRESS, abi } from "../constants";
// import mainImg from "../public/vercel.svg";

import Bank from "../components/Bank";
import MiniDash from "../components/MiniDash";
import Save from "../components/Save";
import Nav from "../components/Nav";



export default function Home() {


  return (
    <div>
      <Head>
        <title>DEFI BANK</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Nav />
      <h1 className={styles.title}>Save Crypto and get Crypto Loans!.</h1>
      <div className="grid grid-cols-3 gap-5 justify-items-center">
        <Bank />
        <MiniDash />
        <Save />
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by @loktioncode
      </footer>
    </div>
  );
}
