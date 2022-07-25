import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { BigNumber, Contract, providers, utils } from "ethers";
import { useEffect, useRef, useState, useCallback } from "react";
import { CONTRACT_ADDRESS, abi } from "../constants";
// import mainImg from "../public/vercel.svg";
import ErrorMessage from "../components/Errors";
import TxList from "../components/TxList";
import InputField from "../components/InputField";

export default function Home() {
    const zero = BigNumber.from(0);

    // walletConnected keep track of whether the user's wallet is connected or not
    const [walletConnected, setWalletConnected] = useState(false);

    const [loading, setLoading] = useState(false);

    const [bankBalance, setBankBalance] = useState(zero);
    const [depositAmount, setDepositAmount] = useState(zero);

    const [error, setError] = useState();
    const [txs, setTxs] = useState([]);



    // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
    const web3ModalRef = useRef();

    /**
     * Returns a Provider or Signer object representing the Ethereum RPC with or without the
     * signing capabilities of metamask attached
     *
     * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
     *
     * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
     * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
     * request signatures from the user using Signer functions.
     *
     * @param {*} needSigner - True if you need the signer, default false otherwise
     */
    const getProviderOrSigner = async (needSigner = false) => {
        // Connect to Metamask
        // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        // If user is not connected to the Rinkeby network, let them know and throw an error
        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 4) {
            window.alert("Change the network to Rinkeby");
            throw new Error("Change network to Rinkeby");
        }

        if (needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    };
    const withdrawFunds = async (amount) => {
       
        try {
            const signer = await getProviderOrSigner(true);

            const bankContract = new Contract(
                CONTRACT_ADDRESS,
                abi,
                signer
            );

            const value = 0.002 + parseFloat(amount);
            console.log(`withdraw ---> ${value.toString()}`);
            // call the deposit from the contract
            const tx = await bankContract.withdraw(value,{
                // value signifies the cost to withdraw which is "0.002" eth.
                // We are parsing `0.002` string to ether using the utils library from ethers.js
                value: utils.parseEther(value.toString()),
            });

            setLoading(true);
            // wait for the transaction to get mined
            await tx.wait();
            setLoading(false);
            // get the updated number of addresses in the whitelist
            await getBalance();
        } catch (err) {
            console.error(err);
        }
    };

    const depositFundsToBank = async () => {
        console.log(">> depositing", depositAmount);
        try {
            // We need a Signer here since this is a 'write' transaction.
            const signer = await getProviderOrSigner(true);
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            const bankContract = new Contract(
                CONTRACT_ADDRESS,
                abi,
                signer
            );
            // call the deposit from the contract
            const tx = await bankContract.deposit({ from: signer.address, value: utils.parseEther(depositAmount, 'ether') });
            setLoading(true);
            // wait for the transaction to get mined
            await tx.wait();
            setLoading(false);
            // get the updated number of addresses in the whitelist
            await getBalance();
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * getbankBalance - Get the current balance of the bank
     */
    const getBalance = useCallback(async () => {
        try {
            console.log(">> getting balance");
            // Get the provider from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const provider = await getProviderOrSigner(true);
            // We connect to the Contract using a Provider, so we will only
            // have read-only access to the Contract
            const bankContract = new Contract(
                CONTRACT_ADDRESS,
                abi,
                provider
            );
            const address = await provider.getAddress();
            // call the balanceOf from the contract
            const _userAccountBalance = await bankContract.balanceOf(address);

            setBankBalance(_userAccountBalance);
            console.log(">> address bal:", _userAccountBalance);

        } catch (err) {
            console.error(err);
        }
    }, []);



    const connectWallet = useCallback(async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // When used for the first time, it prompts the user to connect their wallet
            await getProviderOrSigner();
            setWalletConnected(true);

        } catch (err) {
            console.error(err);
        }
    }, []);


    useEffect(() => {
        // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
        if (!walletConnected) {
            // Assign the Web3Modal class to the reference object by setting it's `current` value
            // The `current` value is persisted throughout as long as this page is open
            web3ModalRef.current = new Web3Modal({
                network: "rinkeby",
                providerOptions: {},
                disableInjectedProvider: false,
            });
            connectWallet();
            getBalance();

        }
    }, [connectWallet, walletConnected, getBalance]);

    return (

        <div className={styles.main}>
            <div>
                <h1 className={styles.title}>Welcome to DEFI BANK!</h1>
                <div className={styles.description}>
                    Save crypto and get crypto loans!.
                </div>
                <div className={styles.description}>
                    ACCOUNT BALANCE:{utils.formatEther(bankBalance)}
                </div>

                <InputField labelName={"Total Amount:"} currency={"ETH"} id={"deposit"} placeHolder={"199.99"} onChange={(e) => setDepositAmount(e.target.value)} />

                {
                    walletConnected ? (
                        !loading ? (
                            <div className={`flex items-center h-8 space-x-2`}>
                                <button onClick={() => depositFundsToBank()} className={`${styles.button} + flex-shrink `} >
                                    DEPOSIT FUNDS
                                </button>
                                <button onClick={() => withdrawFunds(depositAmount)} className={`${styles.button} + flex-shrink `}>
                                    WITHDRAW FUNDS
                                </button>
                                <button disabled={true} className={`${styles.button} + flex-shrink `}>
                                    WITHDRAW PROFITS
                                </button>
                            </div>) : <button className={`${styles.button} + flex-shrink text-center`}>
                            LOADINGS.......
                        </button>
                    ) : <button onClick={connectWallet} className={styles.button}>
                        Connect your wallet
                    </button>
                }
            </div>
            <ErrorMessage message={error} />
            <TxList txs={txs} />


        </div>


    );
}
