import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { BigNumber, Contract, providers, utils } from "ethers";
import { useEffect, useRef, useState, useCallback } from "react";
import { CONTRACT_ADDRESS, abi } from "../constants";
// import mainImg from "../public/vercel.svg";
import NotificationMessage from "../components/Notification";
import TxList from "../components/TxList";
import InputField from "../components/InputField";



export default function Bank() {
    const zero = BigNumber.from(0);

    // isOwner gets the owner of the contract through the signed address
    const [isOwner, setIsOwner] = useState(false);

    // walletConnected keep track of whether the user's wallet is connected or not
    const [walletConnected, setWalletConnected] = useState(false);

    const [loading, setLoading] = useState(false);

    const [bankBalance, setBankBalance] = useState(zero);
    const [inputAmount, setinputAmount] = useState(zero);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);


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


    const withdrawFunds = async () => {
        try {
            const signer = await getProviderOrSigner(true);

            const bankContract = new Contract(
                CONTRACT_ADDRESS,
                abi,
                signer
            );

            let amount = utils.parseEther(inputAmount);

            // call the deposit from the contract
            const tx = await bankContract.withdraw(amount, {
                // value signifies the cost to withdraw which is "0.002" eth.
                // We are parsing `0.002` string to ether using the utils library from ethers.js
                value: utils.parseEther('0.002'),
            });
            setLoading(true);
            // wait for the transaction to get mined
            await tx.wait();
            setLoading(false);
            await getBalance();
            setSuccess("Withdrawal successful");
        } catch (err) {
            // window.alert(error.data);
            setError(`Invalid amount: ${err.code}`);
            if (err.reason.startsWith("execution reverted: ")) {
             
                setError(`${err.reason.substring(20)}`);

            }

        }
    };


    const withdrawProfit = async () => {
        console.log("withdrawing profits");
        try {
            const signer = await getProviderOrSigner(true);

            const bankContract = new Contract(
                CONTRACT_ADDRESS,
                abi,
                signer
            );

            // call the deposit from the contract
            const tx = await bankContract.withdrawProfits();
            setLoading(true);
            // wait for the transaction to get mined
            await tx.wait();
            setLoading(false);
            // get the updated number of addresses in the whitelist
            await getBalance();
            setSuccess("Withdrawal successful");
        } catch (err) {
            console.error(err);

        }
    };

    /**
 * getOwner: gets the contract owner by connected address
 */
    const getOwner = useCallback(async () => {
        try {
            const provider = await getProviderOrSigner();
            const bankContract = new Contract(
                CONTRACT_ADDRESS,
                abi,
                provider
            );
            // call the owner function from the contract
            const _owner = await bankContract.owner();
            // we get signer to extract address of currently connected Metamask account
            const signer = await getProviderOrSigner(true);
            // Get the address associated to signer which is connected to Metamask
            const address = await signer.getAddress();
            if (address.toLowerCase() === _owner.toLowerCase()) {
                setIsOwner(true);
            }
        } catch (err) {
            console.error(err.message.data);
            setError(`${err}`);
        }
    }, []);

    const depositFundsToBank = async () => {
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
            const tx = await bankContract.deposit({ from: signer.address, value: utils.parseEther(inputAmount, 'ether') });
            setLoading(true);
            // wait for the transaction to get mined
            await tx.wait();
            setLoading(false);
            // get the updated number of addresses in the whitelist
            await getBalance();
            setSuccess("Deposit successful");

        } catch (err) {
            console.error(err);
            setError(`Deposit amount cannot be empty!`);
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
            getOwner();

        }
    }, [connectWallet, walletConnected, getBalance, getOwner, error, success]);

    return (
        <>

            <div className={styles.bank}>
                <div className={``}>

                    <h1 className={styles.title}>BANK</h1>
                    <div className={styles.description}>
                        Save crypto and get crypto loans!.
                    </div>
                    <NotificationMessage message={error ? error : success} error={error} success={success} />

                    <div className={styles.description}>
                        ACCOUNT BALANCE:{utils.formatEther(bankBalance)}
                    </div>

                    <InputField labelName={"Total Amount:"} currency={"ETH"} id={"deposit"} placeHolder={"199.99"} onChange={(e) => setinputAmount(e.target.value)} />

                    {
                        walletConnected ? (
                            !loading ? (
                                <div className={`flex items-center space-x-2`}>
                                    {/* <Button text={'DEPOSIT FUNDS'}  onClick={depositFundsToBank()}/> */}

                                    <button onClick={() => depositFundsToBank()} className={`${styles.button29} + flex-1 `} >
                                        DEPOSIT FUNDS
                                    </button>

                                    {
                                        utils.formatEther(bankBalance) > 0 ? <button onClick={() => withdrawFunds()} className={`${styles.button29} + flex-1`}>
                                            WITHDRAW FUNDS
                                        </button> : null
                                    }

                                    {
                                        isOwner ? (
                                            <button onClick={() => withdrawProfit()} className={`${styles.button29} + flex-1 `}>
                                                WITHDRAW PROFITS
                                            </button>) : ""
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
