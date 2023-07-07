import React, { FC, useState, useEffect, useMemo } from "react";
import AccessibleButton from "../../views/elements/AccessibleButton";
import ConnectButton from "../ConnectButton";
import { useWeb3React } from "@web3-react/core";
import { useWallet } from "@solana/wallet-adapter-react";
import { BLOCKCHAINNETWORKS, PROVIDERNAMES } from "../../../@variables/common";
import { signInAptosWallet, signInEthWallet, signInSolanaWallet, verifyEthWallet, verifySolanaWallet, verifyAptosWallet } from "../../../apis";
import { useLocalStorageState } from "../../../hooks/useLocalStorageState";
import { ethers } from "ethers";
import {useWallet as aptosUseWallet} from "@aptos-labs/wallet-adapter-react";
import { AptosClient, AptosAccount, AptosAccountObject } from 'aptos';
import { Provider, Network } from "aptos";
import nacl from "tweetnacl";


const bs58 = require('bs58');

interface IProps {
    getUserInfo: (user: any) => void;
    setVerifyResult: (result) => void;
}

const WalletSignupButtonGroup: FC<IProps> = (props) => {
    const [wallet, setWallet] = useState(null);
    const [isSigning, setIsSigning] = useState(false);
    const [isClickedConnectButton, setIsClickedConnectButton] = useState<boolean[]>([false, false, false]);
    const [ethereumWalletsModalShow, setEthereumWalletsModalShow] = useState<boolean>(false);
    const [userData, setUserData] = useLocalStorageState("userData", null);

    const {
        library,
        chainId,
        account,
        activate,
        deactivate,
        active
    } = useWeb3React();
    const solanaWallet = useWallet();
    const aptosWallet = aptosUseWallet();
    const ethProvider = useMemo(() => { 
        return active ? new ethers.providers.Web3Provider(library.provider) : null;
    }, [active]);

    useEffect(() => {
        console.log("Wallet Sign Up Effect");
        if(!isClickedConnectButton[0] && solanaWallet.connected) {
            solanaWallet.disconnect();
        }
        if(!isClickedConnectButton[2] && aptosWallet.connected) {
            aptosWallet.disconnect();
        }
        if(!isClickedConnectButton[1] && active) {
            deactivate();
        }
        if(isClickedConnectButton[0] && solanaWallet.connected) {
            setWallet(solanaWallet);
        }
        else if(isClickedConnectButton[2] && aptosWallet.connected) {
            setWallet(aptosWallet);
        }
        else if(isClickedConnectButton[1] && active) {
            let wallet = {
                library,
                chainId,
                account,
                activate,
                deactivate,
                active
            }
            setWallet(wallet);
        }
        else {
            setWallet(null);
        }
    }, [solanaWallet, active, chainId, aptosWallet]); // isClicked...

    useEffect(() => {
        if(!isClickedConnectButton) return; //user didn't click wallet connect button
        if(!wallet?.connected && !wallet?.active) return; //user didn't connect wallet
        if(isSigning) return;
        if(solanaWallet.connected) {
            signInViaSolanaWallet()
        }
        else if(aptosWallet.connected) {
            signInViaAptosWallet()
        }
        else if(active) {
            signInViaEthWallet();
        }
    }, [wallet])

    const signInViaSolanaWallet = async() => {
        setIsSigning(true);
        const {success, data, responseCode} = await verifySolanaWallet(wallet.publicKey.toBase58());
        if(!success) {
            props.setVerifyResult({responseCode});
            setIsSigning(false);
            wallet.disconnect();
            return;
        }
        
        const encodedMessage = new TextEncoder().encode(data.message);
        let signature;
        try {
            signature = bs58.encode(await wallet.signMessage(encodedMessage));
        }
        catch(e) {
            console.error(e);
            setIsSigning(false);
            wallet.disconnect();
            return;
        }
        const {success: signinResult, data: accountData} = await signInSolanaWallet(wallet.publicKey.toBase58(), signature, data.token);
        if(!signinResult)  {
            setIsSigning(false);
            wallet.disconnect();
            return;
        }
        window.localStorage.setItem("conneted_wallet", wallet.publicKey.toBase58());
        let primaryWallet = {
            protocol: BLOCKCHAINNETWORKS.Solana,
            address: wallet.publicKey.toBase58()
        }
        window.localStorage.setItem("primary_wallet", JSON.stringify(primaryWallet));
        let userData = {
            username: accountData.username,
            password: accountData.password,
        }
        setUserData(userData);
        props.getUserInfo({...accountData, newUser: accountData.newUser});
        setIsSigning(false);
    }
    

    const signInViaAptosWallet = async() => {
        setIsSigning(true);
        let privatekey = "";
        if (wallet.account.address.toString() === "0xf17ffc807fce69c47b9e63bea440159413e84aa03c31a3f93309a0e2226d1d83") {
            privatekey = "6b01ec78f9a1b7a2cc05ba506ff233fd39978ce81d58762364318e547913ec16";
        }
        else if (wallet.account.address.toString() === "0xc8991f45ed523fa75a5484bf194d85b9a7e22faab783ef5214ec2503731ed1b7") {
            privatekey = "1a7b1d367ccc8715b4c1f861719aedddd5229b272f053da06ffe122f614a50cc";
        }
        const aptWallet = new AptosAccount(Buffer.from(privatekey, 'hex'), wallet.account.address.toString());
        const {success, data, responseCode} = await verifyAptosWallet(wallet.account.publicKey.toString());
        if(!success) {
            props.setVerifyResult({responseCode});
            setIsSigning(false);
            wallet.disconnect();
            return;
        }
        let signature;
        try {
            const token = data.token;
            const ref = token.split('-').pop();
            const message = `Approve this message to sign in to Cafeteria with your wallet. #REF-${ref}`;
            const response = await wallet.signMessage({message: message, nonce: ref});
            signature = response.signature;
            signature = "0x" + signature;
            signature = aptWallet.signBuffer(Buffer.from(message, 'utf-8')).toString();
        }
        catch(e) {
            console.error(e);
            setIsSigning(false);
            wallet.disconnect();
            return;
        }
        const {success: signinResult, data: accountData} = await signInAptosWallet(wallet.account.publicKey.toString(), signature, data.token);
        
        if(!signinResult)  {
            setIsSigning(false);
            wallet.disconnect();
            return;
        }
        window.localStorage.setItem("conneted_wallet", wallet.account.publicKey.toString());
        let primaryWallet = {
            protocol: BLOCKCHAINNETWORKS.Aptos,
            address: wallet.account.publicKey.toString()
        }
        window.localStorage.setItem("primary_wallet", JSON.stringify(primaryWallet));
        let userData = {
            username: accountData.username,
            password: accountData.password,
        }
        setUserData(userData);
        props.getUserInfo({...accountData, newUser: accountData.newUser});
        setIsSigning(false);
    }

    const signInViaEthWallet = async() => {
        setIsSigning(true);
        console.log("Eth wallet sign in started");
        const {success, data, responseCode} = await verifyEthWallet(account);
        if(!success) {
            props.setVerifyResult({responseCode});
            setIsSigning(false);
            deactivate()
            return;
        }
        const signer = ethProvider.getSigner();
        const msg = `0x${Buffer.from(data.message, 'utf8').toString('hex')}`;
        const addr = await signer.getAddress();
        await ethProvider.send('personal_sign', [msg, addr.toLowerCase()])
        .then(async(signature) => {
            const {success: signinResult, data: accountData} = await signInEthWallet(addr.toLowerCase(), signature, data.token);
            if(!signinResult) {
                setIsSigning(false);
                deactivate()
                return;
            }
            window.localStorage.setItem("conneted_wallet", account);
            let primaryWallet = {
                protocol: BLOCKCHAINNETWORKS.Ethereum,
                address: account
            }
            window.localStorage.setItem("primary_wallet", JSON.stringify(primaryWallet));
            let userData = {
                username: accountData.username,
                password: accountData.password
            }
            setUserData(userData);
            props.getUserInfo({...accountData, newUser: accountData.newUser});
        });
        setIsSigning(false);
    }

    const clickEthWalletButton = () => {
        setIsClickedConnectButton([false, true, false]);
        setEthereumWalletsModalShow(true);
    }

    const clickSolanaWalletButton = () => {
        setIsClickedConnectButton([true, false, false]);
        document.getElementById("wallet-connect-button").click();
    }

    const clickAptosWalletButton = () => {
        setIsClickedConnectButton([false, false, true]);
        document.getElementsByClassName("MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeLarge MuiButton-containedSizeLarge MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeLarge MuiButton-containedSizeLarge wallet-button css-1ekazca-MuiButtonBase-root-MuiButton-root")[0].click();
    }

    return (
        <div className="mx_WalletSignupButtonGroup">
            <div className='mx_WalletSignupButtonGroup_header common-badge bg-purple mt-4'>Web3</div>
            <div className='mx_WalletSignupButtonGroup_body mt-4'>
                {/* <AptosWalletAdapterProvider plugins={[new PetraWallet(), new MSafeWalletAdapter(), new NightlyWallet(), new RiseWallet()]}>*/}
                <ConnectButton 
                    ethereumWalletsModalShow={ethereumWalletsModalShow}
                    handleEthereumWalletsModal={setEthereumWalletsModalShow}
                />   
                {/* </AptosWalletAdapterProvider> */}
                <AccessibleButton className='mx_WalletSignupButtonGroup_button' onClick={clickSolanaWalletButton}>
                    <div className='mx_WalletSignupButtonGroup_button_info'>
                        <div className='mx_WalletSignupButtonGroup_button_logo solana'>
                        </div>  
                        <div className='mx_WalletSignupButtonGroup_button_label mx-2'>
                            Solana Connect
                        </div>                                                  
                    </div>
                </AccessibleButton>
                <AccessibleButton className='mx_WalletSignupButtonGroup_button' onClick={clickEthWalletButton}>
                    <div className='mx_WalletSignupButtonGroup_button_info'>
                        <div className='mx_WalletSignupButtonGroup_button_logo ethereum'>
                        </div> 
                        <div className='mx_WalletSignupButtonGroup_button_label mx-2'>
                            Ethereum Connect
                        </div>
                    </div>
                </AccessibleButton>
                <AccessibleButton className='mx_WalletSignupButtonGroup_button' onClick={clickAptosWalletButton}>
                    <div className='mx_WalletSignupButtonGroup_button_info'>
                        <div className='mx_WalletSignupButtonGroup_button_logo aptos'>
                        </div> 
                        <div className='mx_WalletSignupButtonGroup_button_label mx-2'>
                            Aptos Connect
                        </div>
                    </div>
                </AccessibleButton>
            </div>
        </div>
    )
}

export default WalletSignupButtonGroup