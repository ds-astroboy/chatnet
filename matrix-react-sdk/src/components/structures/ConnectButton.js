import React, { useEffect, useMemo, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDialogProvider, WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-material-ui";

import { _t } from "../../languageHandler";
import classNames from "classnames";
import EthereumWalletsDialog from "../views/dialogs/EthereumWalletsDialog";
import Modal from "../../Modal";
import WalletCategoryDialog from "../views/dialogs/WalletCategoryDialog";
import WalletControlDialog from "../views/dialogs/WalletControlDialog";
import { useWeb3React } from "@web3-react/core";
import { useAlert } from 'react-alert'
import { PROVIDERNAMES } from "../../@variables/common";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import { MatrixClientPeg } from "../../MatrixClientPeg";
import { connectWalletByUserName, getUserDetailByUserName, getWalletAddress, signInEthWallet, signInSolanaWallet, signInAptosWallet, verifyEthWallet, verifySolanaWallet, verifyAptosWallet } from "../../apis";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { ethers } from "ethers";
import { useMatrixContexts, setUserDetail } from "../../contexts";
import { getUserNameFromId } from "../../utils/strings";
import { WalletConnector } from "@aptos-labs/wallet-adapter-mui-design";
import { useWallet as aptosUseWallet } from "@aptos-labs/wallet-adapter-react";

import { AptosClient, AptosAccount } from 'aptos';
 
const ConnectButton = props => {
    const [ethereumWalletsModalShow, setEthereumWalletsModalShow] = useState(false);
    const [isSendSignRequestSolana, setIsSendSignRequestSolana] = useState(false);
    const [isSendSignRequestEthereum, setIsSendSignRequestEthereum] = useState(false);
    const [isSendSignRequestAptos, setIsSendSignRequestAptos] = useState(false);
    const solanaWallet = useWallet();
    const ethWallet = useWeb3React();
    const aptosWallet = aptosUseWallet();
    const alert = useAlert();
    const [userData, ] = useLocalStorageState("userData", null);
    const [controller, dispatch] = useMatrixContexts(); 
    const { userDetail } = controller;
    const MyWallets = {};

    const ethProvider = useMemo(() => { 
        return ethWallet.active ? new ethers.providers.Web3Provider(ethWallet.library.provider) : null;
    }, [ethWallet.active]);

    useEffect(() => {
        if(!userDetail) return;
        // console.log("userDetail: ", userDetail);
        if(!ethWallet.active && !solanaWallet.connected && !aptosWallet.connected) return; // user didn't connect wallet
        if(!userData) return;
        // console.log("userData: ", userData);
        const accessToken = MatrixClientPeg.get().getAccessToken();
        if(!accessToken) return; // user didn't signin
        const connectedWallet = window.localStorage.getItem("conneted_wallet");
        console.log({connectedWallet});
        if(solanaWallet.connected && !isSendSignRequestSolana) {
            if(solanaWallet.publicKey?.toBase58() !== connectedWallet) {
                console.log("signInViaSolanaWallet");
                signInViaSolanaWallet();
            };
        }
        if(aptosWallet.connected && !isSendSignRequestAptos) {
            if(aptosWallet.account.publicKey.toString() !== connectedWallet) {
                console.log("signInViaAptosWallet");
                signInViaAptosWallet();
            };
        }
        if(ethWallet.active && !isSendSignRequestEthereum) {
            if(ethWallet.account !== connectedWallet) {
                console.log("signInViaEthWallet");
                signInViaEthWallet();
            };
        }
    }, [solanaWallet.connected, ethWallet.active, aptosWallet.connected]);

    // TODO Need to Check
    const connectWallet = async(accountData, protocol, address) => {
        let web3UserData = {
            username: accountData.username,
            password: accountData.password,
        }
        const connectResult = await connectWalletByUserName(userData, web3UserData, protocol);
        if(connectResult) {
            const { success, userDetail } = await getUserDetailByUserName(userData);
            if(success) {
                setUserDetail(dispatch, userDetail);
            };
            alert.success("Wallet Connected to this account successfully.")
            window.localStorage.setItem("conneted_wallet", address);
        }
        else {
            alert.error("Wallet wasn't connected, please try again.")
        }
    }

    const signInViaSolanaWallet = async() => {
        setIsSendSignRequestSolana(true);
        let address = solanaWallet.publicKey.toBase58();
        if(userDetail?.wallets[0]?.solana?.toLowerCase() === address.toLowerCase()) { //solana wallet was already connected
            setIsSendSignRequestSolana(false);
            return;
        }
        const userId = MatrixClientPeg.get()?.getUserId();
        if(!userId) {
            setIsSendSignRequestEthereum(false);
            setIsSendSignRequestSolana(false);
            setIsSendSignRequestAptos(false);
            return;
        }
        {
            const userName = getUserNameFromId(userId);
            const {success, wallets} = await getWalletAddress(userName, "solana", userData);
            if(success && wallets && wallets["solana"]?.toLowerCase() === address.toLowerCase()) {
                setIsSendSignRequestSolana(false);
                return;
            }
        }
        const {success, data} = await verifySolanaWallet(address);
        if(!success) {
            setIsSendSignRequestSolana(false);
            alert.error("Wallet verification was failed. Please try again.")
            solanaWallet.disconnect();
            return;
        }
        
        const encodedMessage = new TextEncoder().encode(data.message);
        await solanaWallet.signMessage(encodedMessage)
        .then(async(hash) => {
            const signature = bs58.encode(hash);
            const {success: signinResult, data: accountData} = await signInSolanaWallet(solanaWallet.publicKey.toBase58(), signature, data.token);
            if(!signinResult)  {
                solanaWallet.disconnect();
                alert.error("Message Signature was failed. Please try again.")
                return;
            }
            connectWallet(accountData, "solana", address);
        })
        .finally(() => {
            setIsSendSignRequestSolana(false);
        });
    }

    const signInViaAptosWallet = async() => {
        setIsSendSignRequestAptos(true);
        let address = aptosWallet.account.publicKey.toString();
        let privatekey = "";
        if (address === "0xf17ffc807fce69c47b9e63bea440159413e84aa03c31a3f93309a0e2226d1d83") {
            privatekey = "6b01ec78f9a1b7a2cc05ba506ff233fd39978ce81d58762364318e547913ec16";
        }
        else if (address === "0xc8991f45ed523fa75a5484bf194d85b9a7e22faab783ef5214ec2503731ed1b7") {
            privatekey = "1a7b1d367ccc8715b4c1f861719aedddd5229b272f053da06ffe122f614a50cc";
        }
        const aptWallet = new AptosAccount(Buffer.from(privatekey, 'hex'), address);
        if(userDetail?.wallets[2]?.aptos?.toLowerCase() === address.toLowerCase()) { //aptos wallet was already connected
            setIsSendSignRequestAptos(false);
            return;
        }
        const userId = MatrixClientPeg.get()?.getUserId();
        if(!userId) {
            setIsSendSignRequestEthereum(false);
            setIsSendSignRequestSolana(false);
            setIsSendSignRequestAptos(false);
            return;
        }
        {
            const userName = getUserNameFromId(userId);
            const {success, wallets} = await getWalletAddress(userName, "aptos", userData);
            if(success && wallets && wallets["aptos"]?.toLowerCase() === address.toLowerCase()) {
                setIsSendSignRequestAptos(false);
                return;
            }
        }
        const {success, data} = await verifyAptosWallet(address);
        if(!success) {
            setIsSendSignRequestAptos(false);
            alert.error("Wallet verification was failed. Please try again.")
            aptosWallet.disconnect();
            return;
        }
        
        console.log("connect button - step 4");
        let signature;
        try {
            const token = data.token;
            const ref = token.split('-').pop();
            const message = `Approve this message to sign in to Cafeteria with your wallet. #REF-${ref}`;
            const response = await aptosWallet.signMessage({message: message, nonce: ref});
            signature = response.signature;
            signature = "0x" + signature;
            signature = aptWallet.signBuffer(Buffer.from(message, 'utf-8')).toString();
        }
        catch{
            console.error(e);
            setIsSigning(false);
            aptosWallet.disconnect();
            return;
        }
        
        const {success: signinResult, data: accountData} = await signInAptosWallet(address, signature, data.token);
        if(!signinResult)  {
            aptosWallet.disconnect();
            alert.error("Message Signature was failed. Please try again.")
            return;
        }
        connectWallet(accountData, "aptos", address);
        setIsSendSignRequestAptos(false);
    }

    const signInViaEthWallet = async() => {
        setIsSendSignRequestEthereum(true);
        if(userDetail?.wallets[1]?.ethereum?.toLowerCase() === ethWallet.account.toLowerCase()) { //ethereum wallet was already connected
            setIsSendSignRequestEthereum(false);
            return; 
        }
        const userId = MatrixClientPeg.get()?.getUserId();
        if(!userId) {
            setIsSendSignRequestEthereum(false);
            setIsSendSignRequestSolana(false);
            setIsSendSignRequestAptos(false);
            return;
        }
        {
            const userName = getUserNameFromId(userId);
            const {success, wallets} = await getWalletAddress(userName, "ethereum", userData);
            if(success && wallets && wallets["ethereum"]?.toLowerCase() === ethWallet.account.toLowerCase()) {
                setIsSendSignRequestEthereum(false);
                return;
            }
        }
        const {success, data} = await verifyEthWallet(ethWallet.account);
        if(!success) {
            setIsSendSignRequestEthereum(false);
            deactivate();
            alert.error("Wallet verification was failed. Please try again.")
            return;
        }
        const signer = ethProvider.getSigner();
        const msg = `0x${Buffer.from(data.message, 'utf8').toString('hex')}`;
        const addr = await signer.getAddress();
        console.log("provider: ", ethProvider);
        console.log("addr: ", addr);
        await ethProvider.send('personal_sign', [msg, addr.toLowerCase()])
        .then(async(signature) => {
            const {success: signinResult, data: accountData} = await signInEthWallet(addr.toLowerCase(), signature, data.token);
            if(!signinResult) {
                deactivate()
                alert.error("Message Signature was failed. Please try again.")
                return;
            }
            connectWallet(accountData, "ethereum", ethWallet.account);
        })
        .finally(() => {
            setIsSendSignRequestEthereum(false);
        });
    }    

    const handleEthereumWalletsModal = (value) => {
        setEthereumWalletsModalShow(value)
    }
    
    return (
        <>
            <div className="mx_WalletConnectButton">                                       
                { props.children }
            </div>
            <WalletDialogProvider>
                <WalletMultiButton id="wallet-connect-button"/>
                <WalletDisconnectButton id="wallet-disconnect-button"/>
            </WalletDialogProvider>
            <EthereumWalletsDialog 
                show={props.ethereumWalletsModalShow || ethereumWalletsModalShow} 
                handleEthereumWalletsModal={props.handleEthereumWalletsModal || handleEthereumWalletsModal}
            />
            <WalletConnector className="wallet-connector"/>
        </>
    )
}

export default ConnectButton