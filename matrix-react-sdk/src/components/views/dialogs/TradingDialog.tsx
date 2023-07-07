/*
Copyright 2017 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2020, 2021 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React, { useState, useEffect, FunctionComponent, useRef, useMemo } from "react";

import { _t } from '../../../languageHandler';
import BaseDialog from "../dialogs/BaseDialog";
import dis from "../../../dispatcher/dispatcher";
import AccessibleButton from "../elements/AccessibleButton";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import { mediaFromMxc } from "../../../customisations/Media";
import { User } from "matrix-js-sdk/src";
import Dropdown from "../../views/elements/Dropdown";
import BaseAvatar from "../avatars/BaseAvatar";
import { getWalletAddress } from "../../../utils/Gun";
import { getParsedNftAccountsByOwner, isValidSolanaAddress} from "@nfteyez/sol-rayz";
import axios from "axios";
import LoadingScreen from "../rooms/LoadingScreen";
import loadingLottie from "../../../../res/img/cafeteria-loading-regular.json";
import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    Transaction,
    TransactionInstruction
} from "@solana/web3.js";
import Spinner from "../elements/Spinner";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { checkVerifiedNFT } from "../../../apis";
import { getAssociatedTokenAddress } from "../../../blockchain/solana/associatedAccount/getAssociatedTokenAddress";
import { getAccountInfo } from "../../../blockchain/solana/getAccountInfo";
import { createAssociatedTokenAccountInstruction } from "../../../blockchain/solana/associatedAccount/createAssociatedTokenAccountInstruction";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { ESCROW_ACCOUNT_DATA_LAYOUT } from "../../../utils/escrow/escrowAccount";
import { signTransaction } from "../../../blockchain/solana/sendTransaction/signTransaction";
import { sendSignedTransaction, signAndSendTransaction } from "../../../blockchain/solana/sendTransaction/sendTransaction";
import { currenciesInfo, currencyList } from "../../../@variables/currencies";
import classNames from "classnames";

const BN = require("bn.js")
const escrowProgramAddr = "HPc5PVQpeGHqhK3i2ZhDYFM88jjcnBciEf2invkAKtU6";
interface IProps {
    tradeUserId: string;
    userId: string;
    wallet?: WalletAdapter;
    connection?: Connection;
    notification_id?: string;
    onFinished(): void;
    webSocket: any;
    isInitializer?: boolean;
    tradingWebSocket: any
}

const TradingDialog: FunctionComponent<IProps> = (props: IProps) => {
    const [userItems, setUserItems] = useState([]); 
    const [tradingUserItems, setTradingUserItems] = useState([]); 
    const [userItemsAvatar, setUserItemsAvatar] = useState([]);
    const [tradingUserItemsAvatar, setTradingUserItemsAvatar] = useState([]);
    const [user, setUser] = useState<User>(null);
    const [tradingUser, setTradingUser] = useState<User>(null);
    const [userAvatarUrl, setUserAvatarUrl] = useState(null);
    const [tradingUserAvatarUrl, setTradingUserAvatarUrl] = useState(null);
    const [currencyOptions1, setCurrencyOptions1] = useState([]);
    const [currencyOptions2, setCurrencyOptions2] = useState([]);
    const [currencyInfo1, setCurrencyInfo1] = useState([]);
    const [currencyInfo2, setCurrencyInfo2] = useState([]);
    const [selectedCurrency1, setSelectedCurrency1] = useState(currencyList[0]);
    const [selectedCurrency2, setSelectedCurrency2] = useState(currencyList[0]);
    const [selectedOpinion, setSelectedOpinion] = useState(false);
    const [tradingUserOpinion, setTradingUserOpinion] = useState(false);
    const [nftsData, setNftsData] = useState([]);    
    const [nftsTokenData, setNftsTokenData] = useState([]);    
    const [isLoading, setIsLoading] = useState(false);
    const [isTradingLoading, setIsTradingLoading] = useState(false);
    const [isClickApproveButton, setIsClickApproveButton] = useState(false);
    const [isUsersClickWalletApproveButton, setIsUsersClickWalletApproveButton] = useState([false, false]);
    const [signedToken, setSignedToken] = useState(null);
    const [transactionResult, setTransactionResult] = useState([false, false]);
    const [escrowAcc, setEscrowAcc] = useState(props.isInitializer ? Keypair.generate() : null);
    const payerAcc = useMemo(() => {
        return props.isInitializer ? Keypair.generate() : null
    }, [props.isInitializer]);

    const [tradingEvents, setTradingEvents] = useState([]);
    const [receiverAddr, setReceiverAddr] = useState("");
    const cli = MatrixClientPeg.get();
    // const [tradingTransaction, setTradingTransaction] = useState(null);
    const tradingTransaction = useRef(null);
    const tradingCancelTransaction = useRef(null); 

    const getUsersInfo = () => {
        let user1 = cli.getUser(props.userId);
        let user2 = cli.getUser(props.tradeUserId);
        setUser(user1);
        setTradingUser(user2);        
    }

    const getInitialItems = () => {
        let items = new Array(9).fill(null);
        const currencies = currencyList.map((currency: string) => ({
            name: currenciesInfo[currency].name,
            logo: currenciesInfo[currency].logo,
            amount: 0
        }));
        setUserItemsAvatar(items);
        setTradingUserItemsAvatar(items);
        setUserItems(items);
        setTradingUserItems(items);        
        setCurrencyInfo1(currencies);
        setCurrencyInfo2(currencies);
    }

    const getCurrencyOption = (currencyInfo) => {
        return (
            <div key={currencyInfo.name} className="mx_TradingDialog_currencyOption">
                <div className="mx_TradingDialog_currencyLogo">
                    <img src={currencyInfo.logo}/>
                </div>
                <div className="mx_TradingDialog_currencyName">
                    {currencyInfo.amount}
                </div>
            </div>
        )
    }

    const getCurrencyOptions = () => {
        let options1 = [];
        let options2 = [];
        currencyInfo1.map((currencyInfo) => {
            options1.push(getCurrencyOption(currencyInfo))
        });
        currencyInfo2.map((currencyInfo) => {
            options2.push(getCurrencyOption(currencyInfo))
        });

        setCurrencyOptions1(options1);
        setCurrencyOptions2(options2);
    }

    const getAllNftData = async() => {
        try 
        {
            let ownerToken = props.wallet.publicKey.toBase58();
            const result = isValidSolanaAddress(ownerToken);
            const nfts = await getParsedNftAccountsByOwner({
                publicAddress: ownerToken,
                connection: props.connection,
            });
            return nfts;
        }
        catch (error) {
            console.warn(error);
        }
    }

    const getNftTokenData = async() => {
        if(!props.wallet?.publicKey) return;
        try {
            setIsLoading(true);
            let nftData = await getAllNftData();
            setNftsTokenData(nftData);
            let data = Object.keys(nftData).map((key) => nftData[key]);                                                                    let arr = [];
            let n = data.length;
            let arr1 = [];
            arr1 = await new Promise(async(resolve, reject) => {
                let arr = [];
                for (let i = 0; i < n; i++) {
                    let val = axios.get(data[i].data.uri).then();
                    arr.push(val);
                }
                try {
                    Promise.allSettled(arr).then((data1) => {
                        resolve(data1);
                    })
                }
                catch (e) {
                    console.error(e);
                    reject(e);
                }
            })

            let arr2 = [];
            const accessToken = MatrixClientPeg.get().getAccessToken();
            arr2 = await new Promise(async(resolve, reject) => {
                let arr = [];
                for (let i = 0; i < n; i++) {
                    let val = checkVerifiedNFT(accessToken, data[i].updateAuthority);
                    arr.push(val);
                }
                try {
                    Promise.allSettled(arr).then((data1) => {
                        resolve(data1);
                    })
                }
                catch (e) {
                    console.error(e);
                    reject(e);
                }
            })

            arr1?.map((item, index) => {
                if(item.value) {
                    // item.value.data.isVerified = arr2[index].value;
                    item.value.data.isVerified = true;
                }
            });

            setNftsData(arr1);
            setIsLoading(false);
        } catch (error) {
        setIsLoading(false);
        console.warn(error);
        }
    }


    var wsSend = (data)  => {
        if( !props.tradingWebSocket.readyState ){
            setTimeout(function (){
                wsSend(data);
            }, 100);
        } else{
            props.tradingWebSocket.send(data);
        }
    };

    const shareUserItemsToAnotherUser = (items) => {
        let userItems: { userData: any, escrowAcc?: any } = { userData: [...items] };

        if(props.isInitializer) {
            let arr = [];
            escrowAcc.secretKey.forEach(value => arr.push(value));
            console.log("========escrowAcc arr=========", arr);
            userItems = { 
                ...userItems, 
                escrowAcc: { 
                    pubKey: escrowAcc.publicKey.toBase58(),
                    secretKey: arr
                } 
            }
        }

        wsSend(JSON.stringify({
            event: 'update_trade_items',
            data: {
                items: userItems,
                notification_id: props.notification_id
            }
        }))
    }

    const getItemsFromSelectDialog = (items: any) => {
        setUserItems(items);
        shareUserItemsToAnotherUser(items);
        shareUserOpinion(false);
    }

    const showAddItemDialog = (index: number) => {
        dis.dispatch({
            action: "show_select_item_dialog",
            itemIndex: index,
            userId: props.userId,
            tradeUserId: props.tradeUserId,
            userItems,
            nftsData,
            nftsTokenData,
            getItemsFromSelectDialog
        });
    }

    const deleteItem = (index = null) => {
        let items = JSON.parse(JSON.stringify(userItems));
        if(index !== null) {
            items[index] = null;
        }
        else {
            items = new Array(9).fill(null)
        }
        setUserItems(items);
        shareUserItemsToAnotherUser(items);
    }

    const handleItemClickEvent = (item: any, index: number) => {
        if(index > 5) return;
        if(item) {
            deleteItem(index);
            return;
        }
        if(index === 4) {
            deleteItem();
            return;
        }
        showAddItemDialog(index);        
    }

    const shareUserOpinion = (opinion) => {
        setSelectedOpinion(opinion);
        wsSend(JSON.stringify({ 
            event: 'update_user_opinion',
            data: {
                notification_id: props.notification_id,
                user_opinion: opinion
            }
        }));
    }

    const sendWalletApproveEvent = () => {
        wsSend(JSON.stringify({ 
            event: 'update_trade_approval', 
            data: {
                notification_id: props.notification_id
            }
        }))
    }

    const sendTradingResultEvent = (result: boolean) => {
        wsSend(JSON.stringify({ 
            event: 'send_trade_result',
            data: { 
                notification_id: props.notification_id,
                result
            }
        }))
    }

    const sendItemsToAnotherUser = async() => {
        let response = await sendSignedTransaction(
            tradingTransaction.current,
            props.connection
        )
        console.log("========response===========", response);
        if(response.result && props.isInitializer) {
            response = await createAta();
            if(!response.result) {
                cancelInitTransaction();
            }
        }
        console.log("========response===========", response);
        transactionResult[0] = response.result;
        sendTradingResultEvent(response.result);
        if(!response.result) {
            setIsTradingLoading(false);
            props.onFinished();
            dis.dispatch({
                action: "show_trading_result_dialog",
                type: "failed",
                tradeUserId: props.tradeUserId
            });
        }
    }

    const createAta = async() => {
        const destPub = new PublicKey(receiverAddr);
        console.log("receiverAddr====", receiverAddr);
        console.log("========payerAcc.publicKey=========", payerAcc.publicKey.toBase58())
        let balance = await props.connection.getBalance(payerAcc.publicKey);
        console.log("=======balance=======", balance);
        let escrowProgramId = new PublicKey(escrowProgramAddr);
        let keys = [
            { pubkey: payerAcc.publicKey, isSigner: true, isWritable: false },
            { pubkey: props.wallet.publicKey, isSigner: false, isWritable: false },
            { pubkey: destPub, isSigner: false, isWritable: false },
            { pubkey: escrowAcc.publicKey, isSigner: false, isWritable: true },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner:false, isWritable:false },
        ];

        let exchangerKeys = keys.slice();
        let initializerKeys = keys.slice();

        for(let i = 0; i < userItems.length; i++) {
            if(!userItems[i]) continue;
            if((userItems[i].optionIndex === 1 && userItems[i].name !== "Solana") || userItems[i].optionIndex === 2) {
                let mint = userItems[i].optionIndex === 1 ? userItems[i].mintAddress : userItems[i].nftTokenData.mint;
                const mintPub = new PublicKey(mint);
                let destAta = await getAssociatedTokenAddress(mintPub, destPub);
                exchangerKeys.push(
                    { pubkey: mintPub, isSigner: false, isWritable: false },
                    { pubkey: destAta, isSigner: false, isWritable: true },
                )
            }
        }

        for(let i = 0; i < tradingUserItems.length; i++) {
            if(!tradingUserItems[i]) continue;
            if((tradingUserItems[i].optionIndex === 1 && tradingUserItems[i].name !== "Solana") || tradingUserItems[i].optionIndex === 2) {
                let mint = tradingUserItems[i].optionIndex === 1 ? tradingUserItems[i].mintAddress : tradingUserItems[i].nftTokenData.mint;
                const mintPub = new PublicKey(mint);
                let ownerAta = await getAssociatedTokenAddress(mintPub, props.wallet?.publicKey);
                initializerKeys.push(
                    { pubkey: mintPub, isSigner: false, isWritable: false },
                    { pubkey: ownerAta, isSigner: false, isWritable: true },
                )
            }
        }
        let initialItemsNumber = getItemsNumber(userItems);
        let exchangeItemsNumber = getItemsNumber(tradingUserItems);
        console.log("=====initialItemsNumber=====", initialItemsNumber)
        console.log("=====exchangeItemsNumber=====", exchangeItemsNumber)
        let exchangerdata = Buffer.from(
            Uint8Array.of(
                3,  // 0 : init    1 : exchange   2 : cancel  3: create ATA Alice 4: create ATA Bob
                initialItemsNumber,   //a -> b token amount
                exchangeItemsNumber,   //b <- a token amount
            )
        )
        let initializerdata = Buffer.from(
            Uint8Array.of(
                4,  // 0 : init    1 : exchange   2 : cancel  3: create ATA Alice 4: create ATA Bob
                initialItemsNumber,   //a -> b token amount
                exchangeItemsNumber,   //b <- a token amount
            )
        )
        console.log("=======exchangerKeys=======")
        exchangerKeys.map((key) => console.log(key.pubkey.toBase58()));
        console.log("=======initializerKeys=======")
        initializerKeys.map((key) => console.log(key.pubkey.toBase58()));
        const createExchangerAtaIx = new TransactionInstruction({
            programId: escrowProgramId,
            keys: exchangerKeys,
            data: exchangerdata
        })
        const createInitializerAtaIx = new TransactionInstruction({
            programId: escrowProgramId,
            keys: initializerKeys,
            data: initializerdata
        }) 
        const transaction = new Transaction().add(createExchangerAtaIx);
        transaction.add(createInitializerAtaIx);
        let result = false, error;
        try {
            await props.connection.sendTransaction(
                transaction,
                [    
                  payerAcc,
                ],
                { skipPreflight: false, preflightCommitment: "confirmed" }
            );
            result = true;
        }
        catch(e) {
            console.log(e)
            error = e;
        }
        return { result, error };
    }

    const getInitializerAccountPubkeys = async() => {
        let accountPubkeys = [];
        const ownerPub = props.wallet?.publicKey;
        for(let i = 0; i < userItems.length; i++) {
            if(!userItems[i]) continue;
            if((userItems[i].optionIndex === 1 && userItems[i].name !== "Solana") || userItems[i].optionIndex === 2) {
                let mint = userItems[i].optionIndex === 1 ? userItems[i].mintAddress : userItems[i].nftTokenData.mint;
                const mintPub = new PublicKey(mint);
                let ownerAta = await getAssociatedTokenAddress(mintPub, ownerPub);
                let escrowAta = await getAssociatedTokenAddress(mintPub, escrowAcc.publicKey);
                accountPubkeys = [...accountPubkeys, mintPub, ownerAta, escrowAta]
            }
        }
        return { accountPubkeys}
    }

    const getExchangerAccountPubkeys = async(receiverAddress) => {
        let accountPubkeys = [];
        const ownerPub = props.wallet?.publicKey;
        const destPub = new PublicKey(receiverAddress);
        for(let i = 0; i < tradingUserItems.length; i++) {
            if(!tradingUserItems[i]) continue;
            if((tradingUserItems[i].optionIndex === 1 && tradingUserItems[i].name !== "Solana") || tradingUserItems[i].optionIndex === 2) {
                let mint = tradingUserItems[i].optionIndex === 1 ? tradingUserItems[i].mintAddress : tradingUserItems[i].nftTokenData.mint;
                const mintPub = new PublicKey(mint);
                let escrowAta = await getAssociatedTokenAddress(mintPub, escrowAcc.publicKey);
                let ownerAta = await getAssociatedTokenAddress(mintPub, ownerPub);
                accountPubkeys = [...accountPubkeys, escrowAta, ownerAta]
            }
        }
        for(let i = 0; i < userItems.length; i++) {
            if(!userItems[i]) continue;
            if((userItems[i].optionIndex === 1 && userItems[i].name !== "Solana") || userItems[i].optionIndex === 2) {
                let mint = userItems[i].optionIndex === 1 ? userItems[i].mintAddress : userItems[i].nftTokenData.mint;
                const mintPub = new PublicKey(mint);
                let ownerAta = await getAssociatedTokenAddress(mintPub, ownerPub);
                let destAta = await getAssociatedTokenAddress(mintPub, destPub);
                accountPubkeys = [...accountPubkeys, destAta, ownerAta];
            }
        }
        return { accountPubkeys }
    }

    const getAllAssociatedTokenAccount = async(receiverAddress) => {
       if(props.isInitializer) {
        return await getInitializerAccountPubkeys();
       }
       return await getExchangerAccountPubkeys(receiverAddress);
    }

    const getItemsNumber = (items) => {
        let number = 0;
        items.map((item) => {
            if(item && (item.optionIndex === 2 || (item.optionIndex === 1 && item.name !== "Solana"))) number ++;
        })
        return number;
    }

    const getSolDirection = (solAmount): number => {
        if(solAmount === 0) return 0;
        if(props.isInitializer) {
            if(solAmount > 0) {
                return 1;
            }
            return 2;
        }
        if(solAmount > 0) {
            return 2;
        }
        return 1;
    }

    const getSolAmount = (): number => {
        let userSolAmount = 0;
        let tradingUserSolAmount = 0;
        userItems.map((item) => {
            if(item && item.optionIndex === 1 && item.name === "Solana") {
                userSolAmount += item.amount;
            }
        })
        tradingUserItems.map((item) => {
            if(item && item.optionIndex === 1 && item.name === "Solana") {
                tradingUserSolAmount += item.amount;
            }
        })

        return (userSolAmount - tradingUserSolAmount) * LAMPORTS_PER_SOL;
    }

    const getTransactionInstruction = async(accountPubkeys, receiverAddress) => {
        let escrowProgramId = new PublicKey(escrowProgramAddr);
        const destPub = new PublicKey(receiverAddress);
        const PDA = await PublicKey.findProgramAddress(
            [Buffer.from("escrow")],
            escrowProgramId
        );
        let initialItemsNumber = getItemsNumber(props.isInitializer? userItems : tradingUserItems);
        let exchangeItemsNumber = getItemsNumber(props.isInitializer? tradingUserItems : userItems);
        let keys = [];
        let cancelKeys = [];
        if(props.isInitializer) {
            keys.push(
                { pubkey: props.wallet.publicKey, isSigner: true, isWritable: false },
                { pubkey: destPub, isSigner: false, isWritable: false },
                { pubkey: escrowAcc.publicKey, isSigner: false, isWritable: true },
                { pubkey: payerAcc.publicKey, isSigner: false, isWritable: true },
                { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
            )
            cancelKeys.push(
                { pubkey: props.wallet.publicKey, isSigner: true, isWritable: false },
                { pubkey: destPub, isSigner: false, isWritable: false },
                { pubkey: escrowAcc.publicKey, isSigner: false, isWritable: true }
            )
        }
        else {
            keys.push(
                { pubkey: props.wallet.publicKey, isSigner: true, isWritable: false },
                { pubkey: destPub, isSigner: false, isWritable: true },
                { pubkey: escrowAcc.publicKey, isSigner: false, isWritable: true },
            )
        }
        keys.push (
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        )
        cancelKeys.push(
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: PDA[0], isSigner: false, isWritable: false },
        )
        if(!props.isInitializer) {
            keys.push(
                { pubkey: PDA[0], isSigner: false, isWritable: false },
            )            
        }
        else {
            keys.push(
                { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            )  
        }

        if(accountPubkeys.length) {
            accountPubkeys.map((pubkey, index) => {
                keys.push({ pubkey: new PublicKey(pubkey), isSigner: false, isWritable: true })
                if(index % 3 !== 0) {
                    cancelKeys.push({ pubkey: new PublicKey(pubkey), isSigner: false, isWritable: true })
                }
            })
        }
        if(!props.isInitializer) {
            keys.push(
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            )   
        }
        cancelKeys.push(
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        )   
        
        let solAmount = getSolAmount();
        let solDirection = getSolDirection(solAmount);
        let dataArray = [
            solDirection
        ];
        if(solDirection) dataArray.push(...new BN(Math.abs(solAmount)).toArray("le", 8));
        dataArray.push(...new BN(initialItemsNumber).toArray("le", 1));
        let initialItems = JSON.parse(JSON.stringify(props.isInitializer? userItems: tradingUserItems));
        initialItems.map((item) => {
            if(item && (item.optionIndex === 2 || (item.optionIndex === 1 && item.name !== "Solana"))) {
                if(item.optionIndex === 2) {
                    dataArray.push(
                        ...new BN(1).toArray("le", 8),
                    )
                }
                else {
                    dataArray.push(
                        ...new BN(item.amount * (10 ** item.decimal)).toArray("le", 8),
                    )
                }
            }
        })
        dataArray.push(
            ...new BN(exchangeItemsNumber).toArray("le", 1),
        )
        let exchangeItems = JSON.parse(JSON.stringify(props.isInitializer? tradingUserItems: userItems));
        exchangeItems.map((item) => {
            if(item && (item.optionIndex === 2 || (item.optionIndex === 1 && item.name !== "Solana"))) {
                if(item.optionIndex === 2) {
                    dataArray.push(
                        ...new BN(1).toArray("le", 8),
                    )
                }
                else {
                    console.log("======item.amount * item.decimal=====", item.amount * (10 ** item.decimal))
                    dataArray.push(
                        ...new BN(item.amount * (10 ** item.decimal)).toArray("le", 8),
                    )
                }
            }
        })  

        let data = Buffer.from(
            new Uint8Array(
                [
                    props.isInitializer? 0 : 1, 
                    ...dataArray
                ]
            )
        )
        let cancelData = Buffer.from(
            new Uint8Array(
                [
                    2, 
                    initialItemsNumber,
                    exchangeItemsNumber
                ]
            )
        )
        keys.map((key, index) => {
            console.log(index, "===>", key.pubkey.toBase58());
        })
        if(props.isInitializer) {
            console.log("----Cancel----")
            cancelKeys.map((key, index) => {
                console.log(index, "===>", key.pubkey.toBase58());
            })
        }
        console.log("=========keys=========", keys);
        console.log("=========cancelKeys=========", cancelKeys);
        console.log("======initialItemsNumber======", initialItemsNumber);
        console.log("======exchangeItemsNumber======", exchangeItemsNumber);
        console.log("======solAmount======", solAmount);
        console.log("======solDirection======", solDirection);
        console.log("======dataArray======", dataArray);
        props.isInitializer && console.log("========escrowPubKey=========", escrowAcc.publicKey.toBase58());

        const ix = new TransactionInstruction({
            programId: escrowProgramId,
            keys,
            data
        })

        const cancelIx = new TransactionInstruction({
            programId: escrowProgramId,
            keys: cancelKeys,
            data: cancelData
        })

        if(props.isInitializer) {
            return {
                ix,
                cancelIx
            }
        }
        return {
            ix,
            cancelIx: null
        }
    }

    const checkAndSendItems = async() => {   
        const receiverAddress = await getWalletAddress(props.tradeUserId);
        if(!receiverAddress) return;
        setReceiverAddr(receiverAddress);
        setIsClickApproveButton(true);
        const { accountPubkeys } = await getAllAssociatedTokenAccount(receiverAddress);
        const {ix, cancelIx} = await getTransactionInstruction(
            accountPubkeys,
            receiverAddress
        )
        let transaction = new Transaction();
        if(props.isInitializer) {
            tradingCancelTransaction.current = new Transaction().add(cancelIx) ;
            const createEscrowAccountIx = SystemProgram.createAccount({
                space: ESCROW_ACCOUNT_DATA_LAYOUT.span,
                lamports: await props.connection.getMinimumBalanceForRentExemption(
                    ESCROW_ACCOUNT_DATA_LAYOUT.span
                ),
                fromPubkey: props.wallet.publicKey,
                newAccountPubkey: escrowAcc.publicKey,
                programId: new PublicKey(escrowProgramAddr),
            });
            console.log("=========payerAcc=========", payerAcc.publicKey.toBase58());
            transaction.add(createEscrowAccountIx, ix);   
        }
        else {
            transaction.add(ix)
        }
        let signersExceptWallet = [];
        if(props.isInitializer) signersExceptWallet.push(escrowAcc);
        const {result, signedTransaction} = await signTransaction(
            transaction, 
            props.wallet.publicKey,
            props.wallet,
            props.connection,
            signersExceptWallet
        )
        
        if(result) {
            tradingTransaction.current = signedTransaction;
            setIsTradingLoading(true);
            sendWalletApproveEvent();
        }
    }

    const changeOption1 = (option) => {
        setSelectedCurrency1(option);
    }

    const changeOption2 = (option) => {
        setSelectedCurrency2(option);
    }

    const getUserItemsInfo = (items, itemsAvatar, saveItemsAvatar, currencyInfos, saveCurrencyInfox, saveSelectedCurrency) => {
        let cInfos = JSON.parse(JSON.stringify(currencyInfos));
        cInfos.map(currency => {
            currency.amount = 0;
        })
        let avatarsUrls = Object.assign([], itemsAvatar);
        items.map((item, index) => {
            if(!item) {
                avatarsUrls[index] = null;
                return;
            };
            switch(item.optionIndex) {
                case 0:             
                case 1:
                    cInfos.find(currency => currency.name === item.name).amount += item.amount * 1
                    avatarsUrls[index] = {
                        optionIndex: item.optionIndex,
                        url: item.logo
                    };
                    break;
                case 2:
                    avatarsUrls[index] = {
                        optionIndex: item.optionIndex,
                        url: item.nftData.value.data.image
                    };
                    break;
            }
        })
        let amount = 0, currencyName = currencyList[0];
        cInfos.map((currency) => {
            if(amount < currency.amount) {
                amount = currency.amount;
                currencyName = currency.name;
            }
        })
        saveSelectedCurrency(currencyName);
        saveCurrencyInfox(cInfos);
        saveItemsAvatar(avatarsUrls);
    }

    const cancelInitTransaction = async() => {
        const { result, error } = await signAndSendTransaction(
            tradingCancelTransaction.current,
            props.wallet.publicKey,
            props.wallet,
            props.connection
        );
        if( result ) {
            setIsTradingLoading(false);
            props.onFinished();
            dis.dispatch({
                action: "show_trading_result_dialog",
                type: "failed",
                tradeUserId: props.tradeUserId
            });
        }
    }

    const handleTradingResultEvent = async(data) => {
        let result = transactionResult;
        result[1] = data.result;
        if(!result[1]) {
            if(props.isInitializer) {
                cancelInitTransaction();
            }
            else {
                setIsTradingLoading(false);
                props.onFinished();
                dis.dispatch({
                    action: "show_trading_result_dialog",
                    type: "failed",
                    tradeUserId: props.tradeUserId
                });
            }
        }
        if(!props.isInitializer && !result[0] && result[1]) {
            await sendItemsToAnotherUser();
        }
        if(result[0] && result[1]) {
            setIsTradingLoading(false);
            props.onFinished();
            dis.dispatch({
                action: "show_trading_result_dialog",
                type: "success",
                tradeUserId: props.tradeUserId
            });
        }
    }

    const showTradingFinishModal = () => {
        wsSend(JSON.stringify({ 
            event: 'cancel_trading', 
            data: {
                notification_id: props.notification_id
            }
        }))
        props.onFinished();
    }

    const getCurrentTime = () => {
        return new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, minute: 'numeric' })
    }

    const handelOpinionEvent = (data) => {
        console.log("===============", tradingUserOpinion, selectedOpinion);
        let events = tradingEvents.slice();
        let time = getCurrentTime();
        let user1 = cli.getUser(props.userId);
        let user2 = cli.getUser(props.tradeUserId);
        if(!tradingUserOpinion && data.user_opinion[props.tradeUserId] === true) {
            events.push(
                <>
                    <span className="dark bold">{user2?.displayName}</span>
                    <span className="grey">{` has approved of the trade ${time}`}</span>
                </>
            )
        }
        if(!selectedOpinion && data.user_opinion[props.userId] === true) {
            events.push(
                <>
                    <span className="dark bold">{user1?.displayName}</span>
                    <span className="grey">{` has approved of the trade ${time}`}</span>
                </>
            )
        }
        setTradingEvents(events.slice());
    }

    const handleWalletApproveEvent = (data) => {
        let events = tradingEvents.slice();
        let time = getCurrentTime();
        let user1 = cli.getUser(props.userId);
        let user2 = cli.getUser(props.tradeUserId);
        if(!isUsersClickWalletApproveButton[1] && data.approval_status[props.tradeUserId] === true) {
            events.push(
                <>
                    <span className="dark bold">{user2?.displayName}</span>
                    <span className="grey">{` has approved of the trade ${time}`}</span>
                </>
            )
        }
        if(!isUsersClickWalletApproveButton[0] && data.approval_status[props.userId] === true) {
            events.push(
                <>
                    <span className="dark bold">{user1?.displayName}</span>
                    <span className="grey">{` has approved of the trade ${time}`}</span>
                </>
            )
        }
        setTradingEvents(events.slice());
    }

    useEffect(() => {
        getUsersInfo();
        getInitialItems();
        getNftTokenData();
        getCurrencyOptions();        
    }, []); 

    useEffect(() => {
        props.tradingWebSocket.onmessage = (event) => {
            let data = JSON.parse(event.data);
            console.log("[message] server sent the message: ", data);
            switch(data.type) {
                case 'updated.trade.items':
                    setTradingUserItems(data.items.userData);
                    if(!props.isInitializer) {
                        console.log("========data.items.escrowAcc=========");
                        let escrowPub = new PublicKey(data.items.escrowAcc.pubKey);
                        let escrowSecret = Uint8Array.from(data.items.escrowAcc.secretKey);
                        let escrowKeyPair = new Keypair({
                            publicKey: escrowPub.toBytes(),
                            secretKey: escrowSecret,
                        }) 
                        setEscrowAcc(escrowKeyPair)
                    }
                    shareUserOpinion(false);
                    break;
                case 'user.opinion.status':
                    setTradingUserOpinion(data.user_opinion[props.tradeUserId]);
                    handelOpinionEvent(data);                    
                    break;
                case 'trade.approval.status':
                    let status = [data.approval_status[props.userId], data.approval_status[props.tradeUserId]]
                    setIsUsersClickWalletApproveButton(status);
                    handleWalletApproveEvent(data);
                    break;
                case 'trade.result':
                    handleTradingResultEvent(data);                    
                    break;
                case 'trade.cancelled':
                    setIsTradingLoading(false);
                    props.onFinished();
                    dis.dispatch({
                        action: "show_trading_result_dialog",
                        type: "cancel"
                    });
                    break;
            }
        }
        document.getElementById("mx_Dialog_cancelButton").addEventListener("click", showTradingFinishModal);
    }, [])    

    useEffect(() => {
        if(user && tradingUser) {
            setUserAvatarUrl(user.avatarUrl);
            setTradingUserAvatarUrl(tradingUser.avatarUrl);
        }
    }, [user, tradingUser])

    useEffect(() => {
        if(!userItemsAvatar.length && !tradingUserItemsAvatar.length) return;
        getUserItemsInfo(
            userItems, 
            userItemsAvatar, 
            setUserItemsAvatar,
            currencyInfo1,
            setCurrencyInfo1,
            setSelectedCurrency1
        );
        getUserItemsInfo(
            tradingUserItems, 
            tradingUserItemsAvatar, 
            setTradingUserItemsAvatar,
            currencyInfo2,
            setCurrencyInfo2,
            setSelectedCurrency2
        )
    }, [userItems, tradingUserItems])

    useEffect(() => {
        getCurrencyOptions();
    }, [currencyInfo1, currencyInfo2])

    useEffect(() => {
        if(isUsersClickWalletApproveButton[0] === true && isUsersClickWalletApproveButton[1] === true) {
            setIsTradingLoading(true);
            if(props.isInitializer) {
                sendItemsToAnotherUser();
            }
        }
    }, [isUsersClickWalletApproveButton])

    return (
        <BaseDialog className="mx_TradingDialog" title={`Trading with ${tradingUser?.displayName}`} onFinished={props.onFinished} hasCancel={!isTradingLoading}>
            <div className="mx_TradingDialog_body">
                <div className="mx_TradingDialog_container user">
                    <div className="mx_TradingDialog_items_header">
                        <div className="mx_TradingDialog_user_info">
                            <BaseAvatar
                                url={userAvatarUrl ? mediaFromMxc(userAvatarUrl).getSquareThumbnailHttp(40) : null}
                                name={user?.displayName}
                                width={40}
                                height={40}
                            /> 
                            <div className="mx_TradingDialog_User_Name dark bold">
                                {user?.displayName}
                            </div>
                            <div className="mx_TradingDialog_User_itemIcon">
                                <img src={require("../../../../res/img/NFT-library.png")}/>
                            </div>
                        </div>
                    </div>
                                       
                    <div className="mx_TradingDialog_items_wrap">
                        {
                            userItemsAvatar.map((item, index) => {
                                const className = classNames("mx_TradingDialog_item_box", {
                                    "update item": !!item,
                                    "add": (!item && index !==4 && index < 5),
                                    "nft-item": item?.optionIndex == 2,
                                    "refresh": index === 4,
                                    "locked": index > 5
                                })
                                return (
                                    <div className={className} key={index} onClick={() => handleItemClickEvent(item, index)}>
                                        {
                                            item
                                            ?
                                            <div>
                                                <img src={item.url} className={`${item.optionIndex == 2 ? "nft" : "currency"}`}/>
                                                {
                                                    item.optionIndex == 2 ?
                                                    <div className="badge">
                                                        <img src={require("../../../../res/img/verified.svg")}/>
                                                    </div>
                                                    :
                                                    false
                                                }
                                            </div>
                                            : 
                                            index === 4 || index > 5 ?
                                            <div></div>
                                            :
                                            !index
                                            ?
                                            <div className="mx_TradingDialog_item_add">
                                            </div>
                                            :
                                            null                                          
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="mx_TradingDialog_option_group">
                        <div className="mx_TradingDialog_currency_dropdown">
                            <div className="mx_TradingDialog_currency_dropdown_label white bg-green common-badge small">
                                You are trading ...
                            </div>
                            <Dropdown
                                id="mx_TradingDialog_currenyDropdown"
                                searchEnabled={false}
                                onOptionChange={changeOption1}
                                value={selectedCurrency1}
                                label={"Category Dropdown"}>
                                { currencyOptions1 }
                            </Dropdown>
                        </div> 
                        <div className="mx_TradingDialog_button_group">
                            <AccessibleButton 
                                className={`mx_TradingDialog_button no ${selectedOpinion === false? "selected" : ""}`}
                                onClick={() => shareUserOpinion(false)}
                            >
                            </AccessibleButton>
                            <AccessibleButton 
                                className={`mx_TradingDialog_button yes ${selectedOpinion === true? "selected" : ""} mx-4`}
                                onClick={() => shareUserOpinion(true)}
                            >
                            </AccessibleButton>
                        </div>
                    </div>
                </div>
                <div className="mx_TradingDialog_container tradingUser">
                    <div className="mx_TradingDialog_items_header">
                        <div className="mx_TradingDialog_user_info">
                            <BaseAvatar
                                url={tradingUserAvatarUrl ? mediaFromMxc(tradingUserAvatarUrl).getSquareThumbnailHttp(40) : null}
                                name={tradingUser?.displayName}
                                width={40}
                                height={40}
                            />
                            <div className="mx_TradingDialog_User_Name dark bold">
                                {tradingUser?.displayName}
                            </div>
                            <div className="mx_TradingDialog_User_itemIcon">
                                <img src={require("../../../../res/img/NFT-library.png")}/>
                            </div>
                        </div>
                        
                    </div>
                    
                    <div className="mx_TradingDialog_items_wrap">
                        {
                            tradingUserItemsAvatar.map((item, index) => {
                                const className = classNames("mx_TradingDialog_item_box", {
                                    "item": !!item,
                                    "nft-item": item?.optionIndex == 2,
                                    "refresh": index === 4,
                                    "locked": index > 5
                                })
                                return (
                                    <div className={className} key={index}>
                                        {
                                            item
                                            ?
                                            <div>
                                                <img src={item.url} className={`${item.optionIndex == 2 ? "nft" : "currency"}`}/>
                                                {
                                                    item.optionIndex == 2 ?
                                                    <div className="badge">
                                                        <img src={require("../../../../res/img/verified.svg")}/>
                                                    </div>
                                                    :
                                                    false
                                                }
                                            </div>
                                            :
                                            index === 4 || index > 5 ?
                                            <div></div>
                                            :
                                            false
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="mx_TradingDialog_option_group">
                        <div className="mx_TradingDialog_button_group tradingUser">
                            <AccessibleButton 
                                className={`mx_TradingDialog_button yes ${tradingUserOpinion === true? "selected" : "ghosted"} mx-4`}
                                onClick={null}
                            >
                            </AccessibleButton>
                            <AccessibleButton 
                                className={`mx_TradingDialog_button no ${tradingUserOpinion !== true ? "selected" : "ghosted"}`}
                                onClick={null}
                            >
                            </AccessibleButton>
                        </div>
                        <div className="mx_TradingDialog_currency_dropdown tradingUser">
                            <div className="mx_TradingDialog_currency_dropdown_label white bg-green common-badge small">
                                They are trading ...
                            </div>
                            <Dropdown
                                id="mx_TradingDialog_currenyDropdown"
                                searchEnabled={false}
                                onOptionChange={changeOption2}
                                value={selectedCurrency2}
                                label={"Category Dropdown"}>
                                { currencyOptions2 }
                            </Dropdown>
                        </div> 
                    </div>
                </div>                
            </div>
            {/* <div className="mx_TradingDialog_eventPanel">
                <div className="mx_TradingDialog_eventPanel_title">
                    Recent Events
                </div>
                <div className="mx_TradingDialog_eventPanel_wrap">
                    { tradingEvents.map((event) => (
                        <div className="mx_TradingDialog_eventPanel_event">
                            {event}
                        </div>
                    )) }
                </div>
            </div> */}
            <div className="mx_TradingDialog_result_button_wrap">
                <AccessibleButton 
                    className={`mx_TradingDialog_result_button common-btn shadow ${(selectedOpinion === true && tradingUserOpinion === true) ? "active" : ""}`}
                    onClick={checkAndSendItems}
                >
                    {
                        isTradingLoading
                        ?
                        <Spinner/>
                        :
                        "Continue"
                    }
                </AccessibleButton>
            </div>
            <div className="mx_TradingDialog_footer">
                <div className="mx_TradingDialog_footer_icon img-fill"></div>
                <div className="mx_TradingDialog_footer_content">It’s your responsibility to verify all digital goods before making a trade. Cafeteria.GG is not responsible for lack of due diligence</div>
            </div>
            { isLoading && <LoadingScreen label="Loading your NFTs..." loadingLottie={loadingLottie}/> }
        </BaseDialog>
    )
}
export default  TradingDialog 

