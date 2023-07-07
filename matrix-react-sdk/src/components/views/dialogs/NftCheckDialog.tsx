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

import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import React, { useState, useEffect, FC } from "react";

import { _t } from '../../../languageHandler';
import BaseDialog from "../dialogs/BaseDialog";
import dis from "../../../dispatcher/dispatcher";
import { getParsedNftAccountsByOwner, isValidSolanaAddress } from "@nfteyez/sol-rayz";
import axios from "axios"
import LoadingScreen from "../rooms/LoadingScreen";
import AccessibleTooltipButton from "../elements/AccessibleTooltipButton";
import loadingLottie from "../../../../res/img/cafeteria-loading-regular.json";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import { checkVerifiedNFT } from "../../../apis";
import Moralis  from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';
import { BLOCKCHAINNETWORKS, ENSDOMAINCONTRACTADDRESS, PROVIDERNAMES } from "../../../@variables/common";
import { useLocalStorageState } from "../../../hooks/useLocalStorageState";
import { SolNetwork } from "@moralisweb3/common-sol-utils";

interface IProps {
    wallet?: any,
    onFinished(): void;
    adjustableNftAvatar?: (img_url: string) => void;
    getNftData?: (data: any) => void;
    searchCollectionAddress?: string;
    network: string;
}

interface NftCardProps {
    nft: any;
    clickNftAvatarSelectBtn: (url: string) => void;
    searchCollectionAddress?: string;
}

const NftCard: FC<NftCardProps> = (props) => {
    const [isShow, setIsShow] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string>(props.nft.image);

    useEffect(() => {
        let isShow = false;
        let collectionAddress = props.nft.updateAuthority || props.nft.tokenAddress;
        console.log({nft: props.nft})
        if (props.nft.isVerified) {
            isShow = true;
            if(props.searchCollectionAddress && props.searchCollectionAddress !== collectionAddress) {
                isShow = false;
            }
        }
        setIsShow(isShow);
        setImageUrl(imageUrl);
    }, [])

    return (
        <>
            { isShow && (
                <div className="mx_NftCheckDialog_Nft_Card">
                    <div className="mx_NftCheckDialog_Nft_header">
                        <div className="mx_NftCheckDialog_Nft_name">
                            {props.nft.name}
                        </div>
                        <AccessibleTooltipButton
                            title="Verified by Cafeteria"
                            onClick={null}
                        >
                            <div className="mx_NftCheckDialog_Nft_badge">
                            </div>
                        </AccessibleTooltipButton>
                    </div>
                    <div className="mx_NftCheckDialog_Nft_image">
                        <img src={imageUrl} />
                    </div>
                    <div className="mx_NftCheckDialog_Nft_button">
                        <button onClick={() => props.clickNftAvatarSelectBtn(props.nft.image)}>Select</button>
                    </div>
                </div>
                ) 
            }
        </>
    )
}

const NftCheckDialog: FC<IProps> = (props: IProps) => {
    const wallet = props.wallet;
    // console.log("NFTCheckDialog: ", wallet);
    const network = props.network;
    const [nftsData, setNftsData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if(!wallet || !network) return;
        switch(network) {
            case BLOCKCHAINNETWORKS.Solana:
                getNftTokenData();
                break;
            case BLOCKCHAINNETWORKS.Aptos:
                getNftAptosData();
                break;
            case BLOCKCHAINNETWORKS.Ethereum:
            case BLOCKCHAINNETWORKS.Polygon:
                getNfts();
                break;
        }
    }, [wallet, network])

    const getNfts = async() => {
        setIsLoading(true);
        let nfts = await fetchNFTsFromWallet(wallet.account, network);
        validateNfts(nfts);
        // console.log("nfts: ", nfts)
        setNftsData(nfts);    
        setIsLoading(false);
    }

    const validateNfts = (nfts) => {
        nfts.forEach(nft => {
            let imageUrl = nft.image;
            if (!imageUrl.includes("https://")) {
                imageUrl = `https://${imageUrl}`
            }
            if (imageUrl.includes("ipfs://")) {
                imageUrl = imageUrl.replace("ipfs://", "ipfs.io/ipfs/");
            }
            nft.image = imageUrl;
        })
    }

    const getChain = (network) => {
        switch(network) {
            case BLOCKCHAINNETWORKS.Ethereum:
                return EvmChain.ETHEREUM;
            case BLOCKCHAINNETWORKS.Polygon:
                return EvmChain.POLYGON
        }
    }

    const getAddressKey = (network) => {
        switch(network) {
            case BLOCKCHAINNETWORKS.Solana:
                return "updateAuthority";
            case BLOCKCHAINNETWORKS.Ethereum:
            case BLOCKCHAINNETWORKS.Polygon:
                return "token_address";
            case BLOCKCHAINNETWORKS.Aptos:
                return "tokenDataIdHash"
        }
    }

    const getVerifiedList = async(nfts, network) => {
        let arr = [];
        let addressKey = getAddressKey(network);
        
        const accessToken = MatrixClientPeg.get().getAccessToken();
        try {
            arr = await new Promise(async (resolve, reject) => {
                let arr = [];
                for (let i = 0; i < nfts.length; i++) {
                    if(!nfts[i] || !nfts[i][addressKey]) continue;
                    let val = checkVerifiedNFT(accessToken, nfts[i][addressKey]);
                    // console.log("value = ", val);
                    arr.push(val);
                }
                try {
                    Promise.allSettled(arr).then((data) => {
                        resolve(data);
                    })
                }
                catch (e) {
                    console.error(e);
                    reject(e);
                }
            })
        }
        catch(e) {
            console.error(e);
        }
        return arr;
    }

    // TODO I modified this
    const fetchNFTsFromWallet = async(address: string, network: string) => {
        let nfts  = [];
        try{
            await Moralis.start({
                apiKey: 'rFywCJ2pezZfXHPveFslGNKw2fGkZx1GrgTxJ2Q3fYf8D1arR8XvqC9irMA7EeyF',
            });
        }
        catch {}
        try {
            const chain = getChain(network);
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
                            // console.log(metadata.image);
                            metadata.isVerified = true;
                            metadata.token_address = item.token_address;
                            nfts.push(metadata);
                        }
                    }
                })
            }

            const verifiedList = await getVerifiedList(nfts, network);
            
            nfts.forEach((nft, index) => {
                nft.isVerified = (verifiedList[index] && verifiedList[index].value);
            });
        }
        catch(e) {
            console.error(e);
        }
        return nfts
    }

    const fetchAptosNFTsFromWallet = async(address: string, network: string) => {
        let nfts  = [];
        const limit = 20;
        try {
            await Moralis.start({
                apiKey: 'rFywCJ2pezZfXHPveFslGNKw2fGkZx1GrgTxJ2Q3fYf8D1arR8XvqC9irMA7EeyF',
            });
        } catch {
        }
        try {
            let response = await Moralis.AptosApi.wallets.getNFTByOwners({
                "limit": limit,
                "network": "mainnet",
                ownerAddresses: [address]
            })
            // console.log("NFT APTOS response: ", response);
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
            const verifiedList = await getVerifiedList(nfts, network);
            nfts.forEach((nft, index) => {
                nft.isVerified = true;
            });
        }
        catch(e) {
            console.error(e);
        }
        // console.log("nfts = ", nfts);
        return nfts
    }

    const getAllNftData = async () => {
        let nfts = [];
        try {
            let owner = wallet.publicKey.toBase58();
            nfts = await getParsedNftAccountsByOwner({
                publicAddress: owner,
                connection: wallet.connection
            });
            // console.log("nfts: ", nfts);
        }
        catch (error) {
            console.log(error);
        }
        return nfts;
    }

    const getNftTokenData = async () => {
        setIsLoading(true);
        try {
            let nftData = await getAllNftData();
            let data = Object.keys(nftData).map((key) => nftData[key]);
            let nftsData = [];
            data.forEach(nft => {
                let uri = nft?.data?.uri;
                if(uri && !nft?.data?.name?.includes("Raydium")) {
                    nftsData.push(nft);
                }
            })
            let arr1 = [];
            try {
                arr1 = await new Promise(async (resolve, reject) => {
                    let arr = [];
                    for (let i = 0; i < nftsData.length; i++) {
                        let uri = nftsData[i]?.data?.uri;
                        if (!uri.includes("https://")) {
                            uri = `https://${uri}`;
                        }
                        let val = axios.get(uri).then();
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
            }
            catch(e) {
                console.error(e);
            }
            let nfts = [];
            arr1?.map((item, index) => {
                if (item?.value) {
                    let nft = nftsData.find((value) => value.data.name === item.value.data.name);
                    let metadata = {
                        name: item.value.data.name,
                        image: item.value.data.image,
                        // isVerified: (verifiedList[index] && verifiedList[index].value),
                        isVerified: true,
                        updateAuthority: nft?.updateAuthority
                    }
                    nfts.push(metadata)
                }
            });
            validateNfts(nfts);
            setNftsData(nfts);
        } catch (error) {
            console.warn(error);
        }
        setIsLoading(false);
    }

    // TODO
    const getNftAptosData = async () => {
        setIsLoading(true);
        try {
            let nftData = await fetchAptosNFTsFromWallet(wallet?.account?.address?.toString(), network);
            let nfts = []
            nftData.forEach(nft => {
                nfts.push({
                    name: nft.name,
                    isVerified: nft.isVerified,
                    image: nft.metadataUri,
                    tokenDataIdHash: nft.tokenDataIdHash
                })
            })
            validateNfts(nfts);
            setNftsData(nfts);
        } catch (error) {
            console.warn(error);
        }
        setIsLoading(false);
    }

    const clickNftAvatarSelectBtn = (img_url) => {
        let index;
        nftsData.map((nft, i) => {
            if (nft.image == img_url) {
                index = i;
            }
        })
        if (props.getNftData) {
            let addressKey = getAddressKey(network);
            let data = {
                name: nftsData[index].name,
                img: img_url,
                updateAuthority: nftsData[index][addressKey],
                protocol: network
            }
            props.getNftData(data);
            props.onFinished();
            return;
        }
        props.adjustableNftAvatar(img_url);
        props.onFinished();
    }

    return (
        <BaseDialog className="mx_NftCheckDialog" title={<div>&nbsp;</div>} onFinished={props.onFinished} hasCancel={true}>
            <div className="mx_NftCheckDialog_header">My Verified NFTs</div>
            <div className="mx_NftCheckDialog_Nft_container">
                {true && (
                    nftsData.map((nft, index) => {
                        nft.isVerified = true;
                        return <NftCard key={index} nft={nft} clickNftAvatarSelectBtn={clickNftAvatarSelectBtn} searchCollectionAddress={props.searchCollectionAddress}/>;
                    })
                )}
            </div>
            {isLoading && <LoadingScreen label="Loading your NFTs..." loadingLottie={loadingLottie} />}
        </BaseDialog>
    )
}
export default NftCheckDialog 
