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

import React, { useState, useEffect, FunctionComponent, useMemo } from "react";

import { _t } from "../../../languageHandler";
import BaseDialog from "./BaseDialog";
import dis from "../../../dispatcher/dispatcher";
import Lottie from "lottie-react";
import {
    getParsedNftAccountsByOwner,
    isValidSolanaAddress,
} from "@nfteyez/sol-rayz";
import classNames from "classnames";
import { sendSolTransaction } from "./SolInstruction/sendSolTransaction";
import {
    SystemProgram,
    Transaction,
    PublicKey,
    LAMPORTS_PER_SOL,
    Connection,
} from "@solana/web3.js";
import { ErrorType } from "../../../@types/error-type";
import { getUserPoints, sendPointsToCreator } from "../../../apis";
import { currenciesInfo, solanaCurrencyList, ethCurrencyList, maticCurrencyList, aptosCurrencyList } from "../../../@variables/currencies";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { solTransfer } from "../../../blockchain/solana/solTransfer.js";
import { sendSplToken } from "../../../blockchain/solana/spl-token-transfer"
import { titleString } from "../../../utils/strings";
import Moralis  from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';
import Web3 from 'web3';
import { BLOCKCHAINNETWORKS, ENSDOMAINCONTRACTADDRESS, PROVIDERNAMES } from "../../../@variables/common";
import AccessibleButton from "../elements/AccessibleButton";
import { useLocalStorageState } from "../../../hooks/useLocalStorageState";
import { AptosClient, BCS, TxnBuilderTypes, Types, HexString } from "aptos";
import { useAlert } from 'react-alert';
import { MESSAGES } from '../../../@types/error-type';

interface IProps {
  roomId: string;
  userId: string;
  wallet: any;
  wallets: any;
  connection: Connection | null;
  barrierInfo: any;
  accessToken: string;
  joinClick(): void;
  onFinished(): void;
  setIsLoading: (isLoading: boolean) => void;
  setShowConfirmation?: (value: boolean) => void;
}

const getAddrFromPublicKey = (pubKey) => {
    let key = HexString.ensure(pubKey).toUint8Array();
    pubKey = new TxnBuilderTypes.Ed25519PublicKey(key)
    const authKey = TxnBuilderTypes.AuthenticationKey.fromEd25519PublicKey(pubKey)
    console.log(authKey.derivedAddress());
    return authKey.derivedAddress();
}

const BarrierCheckDialog: FunctionComponent<IProps> = (props: IProps) => {
  const [barrierType, setBarrierType] = useState("");
  const [notAllowCheck, setNotAllowCheck] = useState(false);
  const [currencyList, setCurrencyList] = useState(solanaCurrencyList);
  const aptosClient = new AptosClient("https://fullnode.mainnet.aptoslabs.com/v1", {
    WITH_CREDENTIALS: false,
  });
  const wallets = props.wallets;
  // console.log("view_barriercheck_dialog: wallets = ", wallets);
  // console.log("BarrierCheckDialog: ", props.barrierInfo);
  const connection = props.connection;
  let wallet;
  if (props.barrierInfo.protocol){
    if (props.barrierInfo.protocol === BLOCKCHAINNETWORKS.Solana) wallet = wallets.solana;
    else if(props.barrierInfo.protocol === BLOCKCHAINNETWORKS.Aptos) wallet = wallets.aptos;
    else wallet = wallets.ethereum;
  }
  else if (props.barrierInfo.r_protocol) {
    if (props.barrierInfo.r_protocol === BLOCKCHAINNETWORKS.Solana) wallet = wallets.solana;
    else if(props.barrierInfo.r_protocol === BLOCKCHAINNETWORKS.Aptos) wallet = wallets.aptos;
    else wallet = wallets.ethereum;
  }
  // console.log("BarrierCheckDialog: wallet = ", wallet);
  const web3 = useMemo(() => { 
    return wallets.ethereum?.active ? new Web3(wallets.ethereum?.library.provider) : null;
  }, [wallets]);

  useEffect(() => {
    if(props.barrierInfo.type === "nft.check" && !props.barrierInfo["hard_barrier"]) {
      props.onFinished();
      console.log("view_barriercheck_dialog: Barrier Info", {
        barrier: props.barrierInfo
      })
      props.joinClick();
    }
  }, [props.barrierInfo])

  useEffect(() => {
    setBarrierType(props.barrierInfo.type);
    let walletResult =
      (props.barrierInfo.type === ErrorType.NftCheck ||
        props.barrierInfo.type === ErrorType.WalletCheck ||
        barrierType === ErrorType.WalletPay) &&
      (!wallets.solana?.publicKey && !wallets.ethereum?.active && !wallets.aptos?.account);
    setNotAllowCheck(walletResult);
    if(props.barrierInfo.r_protocol === BLOCKCHAINNETWORKS.Solana) {
      setCurrencyList(solanaCurrencyList);
    }
    else if(props.barrierInfo.r_protocol === BLOCKCHAINNETWORKS.Aptos) {
      setCurrencyList(aptosCurrencyList);
    }
    else {
      setCurrencyList([...ethCurrencyList, ...maticCurrencyList]);
    }
  }, []);

  useEffect(() => {
    let walletResult =
        (props.barrierInfo.type === props.barrierInfo.type.NftCheck ||
          props.barrierInfo.type === ErrorType.WalletCheck ||
          barrierType === ErrorType.WalletPay) &&
        (!wallet?.publicKey && !wallet?.active && !wallet.account);
      setNotAllowCheck(walletResult);
  }, [wallet, connection]);

  // const fetchNFTsFromWallet = async(address: string) => {
  //   let nfts  = [];
  //   try {
  //       await Moralis.start({
  //           apiKey: 'pUgcpsAH4jAR8Jq5Fkx9pjHLTxf1MwD6gn7qQmkyRUqZD70hxyksgajX2EZJ0kP3',
  //       });
  //       let response = await Moralis.EvmApi.nft.getWalletNFTs({
  //           address,
  //           chain,
  //       });
  //       let nftData = response.toJSON();
  //       if(nftData.length) {
  //           nftData.forEach((item) => {
  //               if(item && item?.tokenAddress !== ENSDOMAINCONTRACTADDRESS) {
  //                   let metadata = item.metadata;
  //                   metadata.tokenAddress = item.tokenAddress;
  //                   nfts.push(metadata);
  //               }
  //           })
  //       }
  //   }
  //   catch(e) {
  //       console.error(e);
  //   }
  //   return nfts
  // }
  
  // TODO Modified function
  const fetchNFTsFromWallet = async(address: string) => {
    let nfts  = [];
    try{
        await Moralis.start({
            apiKey: 'pUgcpsAH4jAR8Jq5Fkx9pjHLTxf1MwD6gn7qQmkyRUqZD70hxyksgajX2EZJ0kP3',
        });
    }
    catch {}
    try {
      const chain = EvmChain.ETHEREUM;
      let response = await Moralis.EvmApi.nft.getWalletNFTs({
        address: address,
        chain,
      });
      let nftData = response.toJSON().result;
      if(nftData.length) {
        nftData.forEach((item) => {
          if(item && item?.token_address !== ENSDOMAINCONTRACTADDRESS) {
            let metadata = JSON.parse(item.metadata);
            if (metadata?.image) {
              metadata.isVerified = true;
              metadata.token_address = item.token_address;
              nfts.push(metadata);
            }
          }
        })
      }
    }
    catch(e) {
        console.error(e);
    }
    return nfts
}

  const showHomePage = (): void => {
    dis.dispatch({ action: "view_home_page" });
    props.onFinished();
  };

  const sendApt = async (target, amount, wal) => {
    const targetAddr = getAddrFromPublicKey(target);
    const token = new TxnBuilderTypes.TypeTagStruct(
      TxnBuilderTypes.StructTag.fromString("0x1::aptos_coin::AptosCoin")
    );
    const entryFunctionBCSPayload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
      TxnBuilderTypes.EntryFunction.natural(
        "0x1::coin",
        "transfer",
        [token],
        [
          BCS.bcsToBytes(
            TxnBuilderTypes.AccountAddress.fromHex(targetAddr)
          ),
          BCS.bcsSerializeUint64(amount * (10**8)),
        ]
      )
    );

    try {
      const response = await wal.signAndSubmitBCSTransaction(
        entryFunctionBCSPayload
      );
      await aptosClient.waitForTransaction(response?.hash || "");
      return true;
    } catch (error: any) {
      console.log("error", error);
      return false;
    }
  }


  const showErrorModal = (type): void => {
    dis.dispatch({
      action: "view_common_error_dialog",
      type,
    });
  };

  const getAllNftData = async () => {
    // const wallets = JSON.parse(window.localStorage.getItem("GlobalWallets"));
    // const wallet = wallets.solana;
    try {
      let ownerToken = wallet.publicKey.toBase58();
      const result = isValidSolanaAddress(ownerToken);
      if(result) {
          const nfts = await getParsedNftAccountsByOwner({
            publicAddress: ownerToken,
            connection,
          });
          return nfts;
      }
      else return []
    } catch (error) {
      console.warn(error);
      return [];
    }
  };

  // TODO GetAllAptosNFTData
  const fetchAptosNFTsFromWallet = async () => {
    let address = wallet.account.address.toString();
    let nfts  = [];
    try{
        await Moralis.start({
            apiKey: 'rFywCJ2pezZfXHPveFslGNKw2fGkZx1GrgTxJ2Q3fYf8D1arR8XvqC9irMA7EeyF',
        });
    }
    catch {}
    try {
      let response = await Moralis.AptosApi.wallets.getNFTByOwners({
        "limit": 20,
        "network": "mainnet",
        ownerAddresses: [address]
      });
      let nftData = response.result;
      if(nftData.length) {
        let ids = []
        nftData.forEach(item => {
          ids.push(item.tokenDataIdHash);
        })
        nfts = await Moralis.AptosApi.nfts.getNFTsByIds({
          tokenIds: ids
        })
      }
      nfts.forEach((nft, index) => {
        nft.isVerified = true;
      });
    }
    catch(e) {
      console.error(e);
    }
    // console.log("aptos nfts = ", nfts);
    return nfts
  };

  const checkSolanaNFT = async() => {
    // console.log("Check Solana NFT = ", wallet);
    let isExist = false;
    try {
      const nftsData = await getAllNftData();
      if (nftsData?.length) {
        nftsData.map((item) => {
          if (item.updateAuthority === props.barrierInfo.nft_update_auth_addr) {
            isExist = true;
          }
        });
      }
    } catch (e) {
      console.warn(e);
    }
    return isExist;
  }

  //TODO Need to Check
  const checkAptosNFT = async() => {
    let isExist = false;
    try {
      const nftsData = await fetchAptosNFTsFromWallet();
      nftsData.map((item) => {
        if (item.tokenDataIdHash === props.barrierInfo.nft_update_auth_addr) {
          isExist = true;
        }
      });
    }
    catch(e) {
      console.warn(e);
    }
    return isExist;
  }

  const checkEthNFT = async() => {
    let isExist = false;
    // console.log("CheckETHNFT = ", wallet);
    try {
      const nftsData = await fetchNFTsFromWallet(wallet.account);
      nftsData.map((item) => {
        if (item.token_address === props.barrierInfo.nft_update_auth_addr) {
          isExist = true;
        }
      });
    }
    catch(e) {
      console.warn(e);
    }
    return isExist;
  }

  const checkNftInWallet = async () => {
    // console.log("CheckNftInWallet, wallet = ", wallet);
    let result = false;
    if(props.barrierInfo.protocol === BLOCKCHAINNETWORKS.Solana) {
      result = await checkSolanaNFT()
    }
    else if(props.barrierInfo.protocol === BLOCKCHAINNETWORKS.Aptos){
      result = await checkAptosNFT()
    }
    else {
      result = await checkEthNFT();
    }
    return result    
  };

  const checkSolInWallet = async() => {
    try {
      let balance = await connection.getBalance(wallet.publicKey);
      let totalSol = balance / LAMPORTS_PER_SOL;
      if (props.barrierInfo.amount <= totalSol) {
        return true;
      } else return false;
    } catch (e) {
      console.warn(e);
      return false;
    }
  }

  // TODO Modify File
  const checkAptInWallet = async() => {
    let result = false;
    try{
      await Moralis.start({
        apiKey: "pUgcpsAH4jAR8Jq5Fkx9pjHLTxf1MwD6gn7qQmkyRUqZD70hxyksgajX2EZJ0kP3"
      });
    }
    catch{};
    try {
      const response = await Moralis.AptosApi.wallets.getCoinBalancesByWallets({
        limit: 20,
        ownerAddresses: [wallet.account.address.toString()]
      });
      let amount = parseFloat(response.result[0].amount.aptos);
      if (props.barrierInfo.amount <= amount) {
        result = true;
      }
    } catch (e) {
      console.error(e);
    }
    return result;
  }

  const getAllSplTokens = async() => {
    try {
      const accounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
        programId: TOKEN_PROGRAM_ID
      })
      if(accounts && accounts.value) {
        return accounts.value;
      }
      else {
        return null
      }       
    }
    catch(e) {
      return null
    }
  }

  const checkSplTokenInWallet = async() => {
    let result = false;
    try {
      const splTokenAccounts = await getAllSplTokens();
      let mintAddress = currenciesInfo[props.barrierInfo.currency_type].mintAddress;
      if(splTokenAccounts && splTokenAccounts.length) {
        splTokenAccounts.map((account) => {
          if(account.account.data.parsed?.info?.mint === mintAddress && account.account.data.parsed?.info?.tokenAmount?.uiAmount >= props.barrierInfo.amount) {
            result = true;
          }
        })
      }
    } catch (e) {
      console.warn(e);
    }
    return result;
  }

  const checkEthInWallet = async(chain) => {
    let result = false;
    try {
      await Moralis.start({
        apiKey: 'pUgcpsAH4jAR8Jq5Fkx9pjHLTxf1MwD6gn7qQmkyRUqZD70hxyksgajX2EZJ0kP3',
      });
      const response = await Moralis.EvmApi.balance.getNativeBalance({
        address: wallet?.account,
        chain,
      })
      const balance = parseInt(response?.raw.balance) / 10**18;
      if (props.barrierInfo.amount <= balance) {
        result = true;
      } 
    }
    catch(e) {
      console.warn(e);
    }
    return result;
  }

  // const checkEthCurrencies = async() => {
  //   console.log("wallet===============", wallet);
  //   await Moralis.start({
  //     apiKey: 'pUgcpsAH4jAR8Jq5Fkx9pjHLTxf1MwD6gn7qQmkyRUqZD70hxyksgajX2EZJ0kP3',
  //   });
  //   const balances = await Moralis.EvmApi.token.getWalletTokenBalances({
  //     address: wallet?.account,
  //     chain,
  //   });
  //   console.log("balances==================", balances);
  // }

  const checkCryptoInWallet = async () => {
    let result = false;
    if(props.barrierInfo.r_protocol === BLOCKCHAINNETWORKS.Solana) {
      if(props.barrierInfo.currency_type === currencyList[0]) {
        return await checkSolInWallet();
      }
      else {
        return await checkSplTokenInWallet();
      }
    }
    else if(props.barrierInfo.r_protocol === BLOCKCHAINNETWORKS.Aptos) {
      return await checkAptInWallet();
    }
    else {
      let chain = EvmChain.ETHEREUM
      if(props.barrierInfo.currency_type === "Matic") {
        chain = EvmChain.MUMBAI;
      }
      return await checkEthInWallet(chain);
    }
  };
  
  const erc20Transfer = async () => {
    try  {
      await web3.eth.sendTransaction({
        from: props.wallet?.account,
        to: props.barrierInfo?.creator,
        value: (props.barrierInfo.amount * 10**18),
      })
      return true
    }
    catch(e) {
      console.warn(e);
      return false
    }
  }

  const sendCryptoToCreator = async () => {
    // const wallets = JSON.parse(window.localStorage.getItem("GlobalWallets"));
    // const wallet = wallets.solana;
    let payResult = false;
    if(props.barrierInfo.currency_type === "Solana") {
      payResult = await solTransfer(
        wallet.publicKey, 
        props.barrierInfo.creator, 
        props.barrierInfo.amount,
        wallet,
        connection,
        null,
        null,
        props.setShowConfirmation
      )
    }
    else if(props.barrierInfo.currency_type === "Aptos") {
      // const wallets = JSON.parse(window.localStorage.getItem("GlobalWallets"));
      // const wallet = wallets.solana;
      payResult = await sendApt(
        props.barrierInfo.creator,
        props.barrierInfo.amount,
        wallet,
      )
    }
    else {
      const { result, error } = await sendSplToken(
        wallet.publicKey,
        props.barrierInfo.creator,
        wallet.publicKey,
        currenciesInfo[props.barrierInfo.currency_type].mintAddress,
        props.barrierInfo.amount,
        connection,
        wallet,
        null,
        null,
        props.setShowConfirmation
      )
      payResult = result;
    }
    // }
    // else {
    //   payResult = await erc20Transfer();
    // }
    return payResult
  };

  const payCryptoInWallet = async () => {
    try {
      let isValidAmount = await checkCryptoInWallet();
      if (!isValidAmount) return false;
      let sendResult = await sendCryptoToCreator();
      if (sendResult) {
        return true;
      }
      else {
        return false;
      }
    } catch (e) {
      console.warn(e);
      return false;
    }
  };

  const checkPointsAmount = async () => {
    let result = false;
    try {
      if (props.accessToken) {
        let userPoints = await getUserPoints(props.accessToken, props.userId);
        if (userPoints >= props.barrierInfo.amount) result = true;
      }
    } catch (e) {
      console.warn(e);
    }
    return result;
  };

  const sendPoints = async () => {
    let result = sendPointsToCreator(
      props.userId,
      props.roomId,
      props.barrierInfo.amount,
      props.accessToken
    );
    return result;
  };

  const payPointsAmount = async () => {
    try {
      let isValidAmount = await checkPointsAmount();
      if (!isValidAmount) return false;
      let sendResult = await sendPoints();
      return sendResult;
    } catch (e) {
      console.warn(e);
      return false;
    }
  };

  // TODO I have to modify
  const walletCheck = async () => {
    if (notAllowCheck) {
      showErrorModal(ErrorType.WalletConnect);
      return;
    }
    let result = false;
    props.onFinished();
    props.setIsLoading(true);
    // console.log("BarrierType = ", barrierType);
    switch (barrierType) {
      case "nft.check":
        result = await checkNftInWallet();
        break;
      case "wallet.check":
        result = await checkCryptoInWallet();
        break;
      case "wallet.pay":
        result = await payCryptoInWallet();
        break;
      case "points.check":
        result = await checkPointsAmount();
        break;
      case "points.pay":
        result = await payPointsAmount();
        break;
    }
    props.setIsLoading(false);
    if (result) {
      props.joinClick();
    } else {
      showErrorModal(barrierType);
    }
  };

  let lottieBackground = (
    <div className="mx_CurrencyBarrierWalletCheck_bg">
      <Lottie animationData={require("../../../../res/img/data_v_2.json")} />
    </div>
  );

  let statement;
  let barrierContainer;
  let enterButtonContent;
  switch (barrierType) {
    case "wallet.check":
      statement = (
        <div className="mx_CurrencyBarrierWalletCheck_statement">
          <div className="mx_CurrencyBarrierWalletCheck_statement1">
            <span>{currenciesInfo[props.barrierInfo.currency_type]?.symbol?.toUpperCase()}</span> balance check required
          </div>
        </div>
      );
      enterButtonContent = `Check Balance`;
    case "wallet.pay":
      if (barrierType == "wallet.pay") {
        statement = (
          <div className="mx_CurrencyBarrierWalletCheck_statement">
            <div className="mx_CurrencyBarrierWalletCheck_statement1">
              <span>{currenciesInfo[props.barrierInfo.currency_type]?.symbol?.toUpperCase()}</span> pay required
            </div>
          </div>
        );
        enterButtonContent = `Pay to Enter`;
      }
      barrierContainer = (
        <div className="mx_CurrencyBarrierWalletCheck_currencyBarrier">
          <div className="mx_CurrencyBarrierWalletCheck_barrierInfo">
            <div className="mx_CurrencyBarrierWalletCheck_requireSol">
              {props.barrierInfo.amount}
            </div>
            <div className="mx_CurrencyBarrierWalletCheck_CurrencyInfo">
              <div className="mx_CurrencyBarrierWalletCheck_currency_Logo">
                <img src={currenciesInfo[props.barrierInfo.currency_type]?.logo} />
              </div>
              <div className="mx_CurrencyBarrierWalletCheck_currency_NameAndSymbol">
                {`${titleString(currenciesInfo[props.barrierInfo.currency_type]?.symbol)}`}
              </div>
            </div>
            
          </div>
        </div>
      );
      break;
    case "points.check":
      statement = (
        <div className="mx_CurrencyBarrierWalletCheck_statement">
          <div className="mx_CurrencyBarrierWalletCheck_statement1">
            <span>Cafeteria Credits</span> balance check required
          </div>
        </div>
      );
      enterButtonContent = `Check Balance`;
    case "points.pay":
      if (barrierType == "points.pay") {
        statement = (
          <div className="mx_CurrencyBarrierWalletCheck_statement">
            <div className="mx_CurrencyBarrierWalletCheck_statement1">
              <span>Cafeteria Credits</span> pay required
            </div>
          </div>
        );
        enterButtonContent = `Pay to Enter`;
      }
      barrierContainer = (
        <div className="mx_CurrencyBarrierWalletCheck_currencyBarrier">
          <div className="mx_CurrencyBarrierWalletCheck_barrierInfo">
            <div className="mx_CurrencyBarrierWalletCheck_requireSol">
              {props.barrierInfo.amount}
            </div>
            <div className="mx_CurrencyBarrierWalletCheck_CurrencyInfo">
              <div className="mx_CurrencyBarrierWalletCheck_currency_Logo">
                <img src={require("../../../../res/img/cafeteria-point.png")} />
              </div>
              <div className="mx_CurrencyBarrierWalletCheck_currency_NameAndSymbol">
                {`Cafeteria Credits`}
              </div>
            </div>
          </div>
        </div>
      );
      break;
    case "nft.check":
      statement = (
        <div className="mx_CurrencyBarrierWalletCheck_statement">
          <div className="mx_CurrencyBarrierWalletCheck_statement1">
            <span>NFT</span> ownership verification required
          </div>
        </div>
      );
      barrierContainer = (
        <div className="mx_CurrencyBarrierWalletCheck_currencyBarrier">
          <div className="mx_CurrencyBarrierWalletCheck_barrierInfo nft_barrier">
            <div className="mx_CurrencyBarrierWalletCheck_barrierInfo_item">
              <img src={props.barrierInfo.uri} />
            </div>
          </div>
        </div>
      );
      enterButtonContent = `Verify Ownership`;
      break;
    case "domain.check":
      statement = (
        <div className="mx_CurrencyBarrierWalletCheck_statement">
          <div className="mx_CurrencyBarrierWalletCheck_statement1">
            {`This room requires chatters to hodl a bonfida .SOL Domain to enter`}
          </div>
          <div className="mx_CurrencyBarrierWalletCheck_statement2">
            To learn more about .SOL domains, check out <a href="https://naming.bonfida.org/">https://naming.bonfida.org/</a>
          </div>
        </div>
      );
      enterButtonContent = `Verify Ownership`;
      break;
  }

  const barrierCheckButtonClassName = classNames(
    "mx_CurrencyBarrierWalletCheck_bt",
    "wallet_check_button",
    "common-btn",
    "bg-green",
    "btn-hover-purple",
    "px-4"
  );

  let buttonGroup = (
    <div className="mx_CurrencyBarrierWalletCheck_button_group">
      <AccessibleButton 
        className="mx_CurrencyBarrierWalletCheck_bt preview_button common-btn bg-grey disabled px-4"
        disabled
        onClick={null}
      >
        Preview Room
      </AccessibleButton>
      <AccessibleButton 
        className={barrierCheckButtonClassName}
        onClick={walletCheck}
      >
        {enterButtonContent}
      </AccessibleButton>
    </div>
  );

  const dialogClassName = classNames("mx_CurrencyBarrierWalletCheck");
  
  return (
    <BaseDialog
      className={dialogClassName}
      title="Exclusive Group"
      onFinished={showHomePage}
    >
      {lottieBackground}
      {statement}
      {barrierContainer}
      {buttonGroup}
    </BaseDialog>
  );
};
export default BarrierCheckDialog;
