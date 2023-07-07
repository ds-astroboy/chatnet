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
import React, { useState, useEffect, ChangeEvent, FunctionComponent } from "react";

import { _t } from '../../../languageHandler';
import BaseDialog from "../dialogs/BaseDialog";
import AccessibleButton from "../elements/AccessibleButton";
import Dropdown from "../../views/elements/Dropdown";
import Field from "../elements/Field";
import AccessibleTooltipButton from "../elements/AccessibleTooltipButton";
import { currenciesInfo, currencyList } from "../../../@variables/currencies";

interface IProps {
    onFinished: any;
    itemIndex: number;
    userId: string;
    tradeUserId: string;
    userItems: any;
    sendItems: any;
    nftsTokenData: any;
    nftsData: any;
}

const NFTCard = props => {
    const [isAdded, setIsAdded] = useState(false);
    const [nftClickButtonName, setNftClickButtonName] = useState("Select");

    const selectNFT = () => {
        if(isAdded) return;
        props.selectNft(props.index)
    }

    useEffect(() => {
        props.userItems?.map((item) => {
            if(item?.optionIndex === 2) {
                if(item.nftData.value.data.image === props.nft.value.data.image) {
                    setIsAdded(true);
                    setNftClickButtonName("Added")
                }
            }
        })
    }, [])
    return (
        <div className="mx_SelectItemDialog_Nft_Card" key={props.nft.value.data.image}>
            <div className="mx_SelectItemDialog_Nft_header">
                <div className="mx_SelectItemDialog_Nft_name">
                    {props.nft.value.data.name}
                </div>
                <AccessibleTooltipButton
                    title="Verified by Cafeteria"
                    onClick={null}
                >
                    <div className="mx_SelectItemDialog_Nft_badge">
                        <img src={require("../../../../res/img/verified.svg")}/>
                    </div>
                </AccessibleTooltipButton>
            </div>
            <div className="mx_SelectItemDialog_Nft_image">
                <img src={props.nft.value.data.image}/>
            </div>
            <div className={`mx_SelectItemDialog_Nft_button ${isAdded? "selected": ""}`}>
                <button onClick={selectNFT}>{nftClickButtonName}</button>
            </div>
        </div>
    )
}

const SelectItemDialog: FunctionComponent<IProps> = (props: IProps) => {  
    const [selectedCurrency, setSelectedCurrency] = useState(currenciesInfo["Solana"]);
    const [selectedPoint, setSelectedPoint] = useState(currenciesInfo["Cafeteria Credits"]);
    const [currencyAmount, setCurrencyAmount] = useState("");
    const [pointAmount, setPointAmount] = useState("");
    const [optionsInfo, setOptionsInfo] = useState({
        index: 1,
        name: "crypto"
    });
    const [nftsData, setNftsData] = useState([]);    
    const [nftsTokenData, setNftsTokenData] = useState([]);    
    const [selectedNftInfo, setSelectedNftInfo] = useState(null)

    const onCurrencySelectChange = (currency: string) => {
        if(selectedCurrency.name === currency) return;
        let index = 0;
        currencyList.map((name: string, i: number) => {
            if(name == currency) {
                index = i;
            }
        })
        setSelectedCurrency(currenciesInfo[currencyList[index]]);
    }

    const onPointSelectChange = (point: string) => {
        if(selectedCurrency.name === point) return;
        let index = 0;
        currencyList.map((name: string, i: number) => {
            if(name == point) {
                index = i;
            }
        })
        setSelectedPoint(currenciesInfo[currencyList[index]]);
    }

    const onCurrencyAmountChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setCurrencyAmount(ev.target.value)
    }

    const onPointAmountChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setPointAmount(ev.target.value)
    }

    const currencyOptions: JSX.Element[] = [];
    const pointOptions: JSX.Element[] = [];
    currencyList.map((currency: string, index: number) => {
        if(index) {
            currencyOptions.push(
                <div key={currenciesInfo[currency].name} className="mx_SelectItemDialog_currencyOption">
                    <div className="mx_SelectItemDialog_currencyLogo">
                        <img src={currenciesInfo[currency].logo}/>
                    </div>
                    <div className="mx_SelectItemDialog_currencyName">
                        {currenciesInfo[currency].name}
                    </div>
                </div>
            )
        }
        else {
            pointOptions.push(
                <div key={currenciesInfo[currency].name} className="mx_SelectItemDialog_currencyOption">
                    <div className="mx_SelectItemDialog_currencyLogo">
                        <img src={currenciesInfo[currency].logo}/>
                    </div>
                    <div className="mx_SelectItemDialog_currencyName">
                        {currenciesInfo[currency].name}
                    </div>
                </div>
            )
        }
    })

    const changeOption = (index: number, name: string) => {
        setOptionsInfo({...optionsInfo, index, name});
    }

    const selectNft = (index: number) => {
        setSelectedNftInfo({
            index,
            nftData: nftsData[index],
            nftTokenData: nftsTokenData[index]
        });
    }

    const clickTradeButton = () => {
        let itemInfo = {};
        let items = JSON.parse(JSON.stringify(props.userItems));
        switch(optionsInfo.index) {
            case 0:
                if(!pointAmount) return;
                itemInfo = { ...selectedPoint, amount: pointAmount, optionIndex: 0 }
                break;
            case 1:
                if(!currencyAmount) return;
                itemInfo = { ...selectedCurrency, amount: currencyAmount, optionIndex: 1 }
                break;
            case 2:
                if(!selectedNftInfo) return;
                itemInfo = { ...selectedNftInfo, optionIndex: 2, }
                break;
        }
        items[props.itemIndex] = itemInfo;
        props.sendItems(items);
        props.onFinished();
    }
    
    useEffect(() => {
        setNftsData(props.nftsData);
        setNftsTokenData(props.nftsTokenData);
    }, [])

    useEffect(() => {
        if(selectedNftInfo) {
            clickTradeButton();
        }
    }, [selectedNftInfo])

    return (
        <BaseDialog className="mx_SelectItemDialog" title={`Choose item to trade`} onFinished={props.onFinished} hasCancel={true}>
            <div className="mx_SelectItemDialog_wrap">
                {/* <div className="mx_SelectItemDialog_option">
                    <div className="mx_SelectItemDialog_option_header">
                        <div className={`mx_SelectItemDialog_radio_button ${optionsInfo.index == 0? "active": ""}`} onClick={() => changeOption(0, "point")}></div>
                        <div className="mx_SelectItemDialog_option_content">
                            Cafeteria Credits
                        </div>
                    </div>
                    {
                        optionsInfo.index == 0
                        ?
                        <div className="mx_SelectItemDialog_option_body">
                            <div className="mx_SelectItemDialog_currency_wrap">
                                <div className="mx_SelectItemDialog_currenyDropdown">
                                    <Dropdown
                                        id="mx_SelectItemDialog_currenyDropdown"
                                        onOptionChange={onPointSelectChange}
                                        searchEnabled={false}
                                        value={selectedPoint.name}
                                        label={"Category Dropdown"}>
                                        { pointOptions }
                                    </Dropdown>
                                </div>
                                <div className="mx_SelectItemDialog_CurrencyAmountInput">                        
                                    <Field
                                        onChange={onPointAmountChange}
                                        value={pointAmount}
                                        type="number"
                                    />
                                </div>
                            </div>
                        </div>
                        :
                        false
                    }
                </div> */}
                <div className="mx_SelectItemDialog_option">
                    <div className="mx_SelectItemDialog_option_header">
                        <div className={`mx_SelectItemDialog_radio_button ${optionsInfo.index == 1? "active": ""}`} onClick={() => changeOption(1, "crypto")}></div>
                        <div className="mx_SelectItemDialog_option_content">
                            Crypto Currency
                        </div>
                    </div>
                    {
                        optionsInfo.index == 1
                        ?
                        <div className="mx_SelectItemDialog_option_body">
                            <div className="mx_SelectItemDialog_currency_wrap">
                                <div className="mx_SelectItemDialog_currenyDropdown">
                                    <Dropdown
                                        id="mx_SelectItemDialog_currenyDropdown"
                                        onOptionChange={onCurrencySelectChange}
                                        searchEnabled={false}
                                        value={selectedCurrency.name}
                                        label={"Category Dropdown"}>
                                        { currencyOptions }
                                    </Dropdown>
                                </div>
                                <div className="mx_SelectItemDialog_CurrencyAmountInput">                        
                                    <Field
                                        onChange={onCurrencyAmountChange}
                                        value={currencyAmount}
                                        type="number"
                                    />
                                </div>
                            </div>
                        </div>
                        :
                        false
                    }
                </div>
                <div className="mx_SelectItemDialog_option">
                    <div className="mx_SelectItemDialog_option_header">
                        <div className={`mx_SelectItemDialog_radio_button ${optionsInfo.index == 2? "active": ""}`} onClick={() => changeOption(2, "nft")}></div>
                        <div className="mx_SelectItemDialog_option_content">
                            Verified NFT
                        </div>
                    </div>
                    {
                        nftsData.length && optionsInfo.index == 2
                        ?
                        <div className="mx_SelectItemDialog_Nfts_body">
                        {
                            nftsData.length
                            ?
                            nftsData.map((nft, index) => {
                                if(nft.value?.data.isVerified) {
                                    return  (
                                        <NFTCard 
                                            nft={nft} 
                                            index={index} 
                                            selectNft={selectNft}
                                            userItems={props.userItems}
                                        />  
                                    )
                                }                      
                            })
                            :
                            false
                        }
                    </div>
                    :
                    false
                    }
                </div>
                <AccessibleButton 
                    className={`mx_SelectItemDialog_trade_button ${optionsInfo.index == 2? "hidden": ""}`}
                    onClick={clickTradeButton}
                >
                    Add to trade
                </AccessibleButton>
            </div>
        </BaseDialog>
    )
}
export default  SelectItemDialog 

