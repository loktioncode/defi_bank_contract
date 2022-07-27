import Head from "next/head";
import styles from "../styles/MiniDash.module.css";
import Web3Modal from "web3modal";
import { BigNumber, Contract, providers, utils } from "ethers";
import { useEffect, useRef, useState, useCallback } from "react";
import { CONTRACT_ADDRESS, abi } from "../constants";
// import mainImg from "../public/vercel.svg";
import NotificationMessage from "./Notification";
import TxList from "./TxList";
import InputField from "./InputField";



export default function MiniDash() {
    const zero = BigNumber.from(0);

    // walletConnected keep track of whether the user's wallet is connected or not
    const [walletConnected, setWalletConnected] = useState(false);

    const [loading, setLoading] = useState(false);
    const [bankBalance, setBankBalance] = useState(zero);
    const [transferAmount, settransferAmount] = useState(zero);
    const [recipient, setRecipient] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [txs, setTxs] = useState([]);
    const web3ModalRef = useRef();


    const getProviderOrSigner = async (needSigner = false) => {

        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        // If user is not connected to the Rinkeby network, let them know and throw an error
        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 4) {
            window.alert("Change the network to Rinkeby");
            setError("Change the network to Rinkeby");
            throw new Error("Change network to Rinkeby");
        }

        if (needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    };




    const transferFunds = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const bankContract = new Contract(
                CONTRACT_ADDRESS,
                abi,
                signer
            );
            // call the deposit from the contract
            const tx = await bankContract.transfer(recipient, utils.parseEther(transferAmount, 'ether'));
            setLoading(true);
            // wait for the transaction to get mined
            await tx.wait();
            setLoading(false);
            // get the updated number of addresses in the whitelist
            await getBalance();
            setSuccess(`Successfully transferred ${transferAmount} ETH to ${recipient}`);

        } catch (err) {
            console.error(err);
            setError(`Amount transfer failed:`);
        }
    };

    /**
     * getbankBalance - Get the current balance of the bank
     */
    const getBalance = useCallback(async () => {
        try {
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


        } catch (err) {
            console.error(err);
            setError(`Failed to fetch balance`);
        }
    }, []);



    const connectWallet = useCallback(async () => {
        setError(null);
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // When used for the first time, it prompts the user to connect their wallet
            await getProviderOrSigner();
            setWalletConnected(true);
            setError(null);


        } catch (err) {
            console.error(err);
        }
    }, []);


    useEffect(() => {

        setTimeout(() => {
            setError(null);
            setSuccess(null);
        }, 3000);

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
    }, [connectWallet, walletConnected, getBalance, error, success]);

    return (
        <>

            <div className={styles.main}>
                <div className={``}>
                    <h1 className={styles.title}>OPERATIONS</h1>

                    <NotificationMessage message={error ? error : success} error={error} success={success} />

                    <div className={styles.description}>
                        CURRENT BALANCE:{utils.formatEther(bankBalance)}
                    </div>
                    <InputField labelName={"Recipient:"} id={"reciep"} placeHolder={"0x3455400......"} onChange={(e) => setRecipient(e.target.value)} />
                    <InputField labelName={"Total Amount:"} currency={"ETH"} id={"deposit"} placeHolder={"199.99"} onChange={(e) => settransferAmount(e.target.value)} />

                    {
                        walletConnected ? (
                            !loading ? (
                                <div className={`flex items-center space-x-2`}>

                                    <button onClick={() => transferFunds()} className={`${styles.button29} + flex-1 `} >
                                        TRANSFER FUNDS
                                    </button>

                                    {
                                        utils.formatEther(bankBalance) > 1 ? <button onClick={() => withdrawFunds()} className={`${styles.button29} + flex-1`}>
                                            WITHDRAW FUNDS
                                        </button> : null
                                    }


                                </div>) :
                                <div className={`flex items-center space-x-2`}>
                                    <button className={`${styles.button} + flex-1 `}>
                                        LOADING...
                                    </button>
                                </div>

                        ) :

                            (
                                <div className={`flex items-center space-x-2`}>
                                    <button onClick={connectWallet} className={`${styles.button29} + flex-1 `}>
                                        Connect your wallet
                                    </button>
                                </div>
                            )


                    }
                </div>

                <TxList txs={txs} />




            </div>
        </>

    );
}
