/*
Copyright 2019, 2021 The Matrix.org Foundation C.I.C.

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

import React, { useEffect, useState } from "react";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Relations } from "matrix-js-sdk/src/models/relations";
import classNames from "classnames";
import { _t } from '../../../languageHandler';
import AccessibleTooltipButton from "../elements/AccessibleTooltipButton";
import { MatrixClientPeg } from '../../../MatrixClientPeg';
import BaseAvatar from "../avatars/BaseAvatar";
import { mediaFromMxc } from "../../../customisations/Media";
import { trimSolTokenAmount } from '../../../hooks/trimString';

interface Gifts {
    pointsGifts: Relations,
    cryptoGifts: Relations
}

interface IProps {
    // The event we're displaying reactions for
    mxEvent: MatrixEvent;
    // The Relations model from the JS SDK for reactions to `mxEvent`
    gifts?: Gifts;
}

const SendersList = ({avatarUrl, displayName, amount, time, type}) => {
    const imgUrl = avatarUrl? mediaFromMxc(avatarUrl).getThumbnailOfSourceHttp(18, 18, "scale") : null;
    const senderNameClassName = classNames("mx_GiftRow_Item_Tootip_sender_name");
    const getDate = () => {
        let hour, minutes;
        if(time.getHours() < 10) hour = `0${time.getHours()}`;
        else hour = time.getHours();
        if(time.getMinutes() < 10) minutes = `0${time.getMinutes()}`;
        else minutes = time.getMinutes();
        return `${hour}:${minutes}`;
    }
    let date = getDate();
    return (
        <div className="mx_GiftRow_Item_Tootip_sender">
            <div className="mx_GiftRow_Item_Tootip_sender_info">
                <div className="mx_GiftRow_Item_Tootip_sender_time">{date}</div>
                <div className="mx_GiftRow_Item_Tootip_sender_avatar">
                    <BaseAvatar
                        name={displayName}
                        url={imgUrl}
                        width={15}
                        height={15}
                    />
                </div>
                <div className={senderNameClassName}>
                    {displayName}
                </div>
            </div>
            <div className="mx_GiftRow_Item_Tootip_sender_gift">
                <div className={`mx_GiftRow_Item_Tootip_sender_gift_logo ${type}`}></div>
                <div className="mx_GiftRow_Item_Tootip_sender_gift_amount">
                    {trimSolTokenAmount(amount)}
               </div>
            </div>
        </div>
    )
}

const GiftsItem = ({amount, senders, type}) => {
    const [sendersList, setSendersList] = useState(null);   

    useEffect(() => {
        getSenderList();
    }, []);

    useEffect(() => {
        getSenderList();
    }, [senders]);

    const getSenderList = () => {
        let sendersInfo = (
            <div className="mx_GiftRow_Item_Tootip">
            {
                senders.map((sender, index) => {
                    const user = MatrixClientPeg.get().getUser(sender.senderId);
                    return(
                        <SendersList
                            avatarUrl={user.avatarUrl}
                            displayName={user.displayName}
                            amount={sender.amount}
                            time={sender.time}
                            type={type}
                            key={index}
                        />
                        
                    )            
                })
            }
            </div>
        )
        setSendersList(sendersInfo);
    }

    return (
        <AccessibleTooltipButton
            className="mx_GiftRow_Item"
            onClick={null}
            title={"Gift"}   
            tooltip={sendersList} 
        >
            <div className={`mx_GiftRow_Item_logo ${type}`}></div>
            <div className="mx_GiftRow_Item_amount">{trimSolTokenAmount(amount)}</div>
        </AccessibleTooltipButton>
    )
}

const GiftsRow = (props: IProps) => {
    const [pointsGiftsItem, setPointsGiftsItem] = useState(null);
    const [cryptoGiftsItem, setCryptoGiftsItem] = useState(null);
    const [isShowGift, setIsShowGift] = useState(false);

    useEffect(() => {    
        getItems();
        props.gifts?.pointsGifts?.on("Relations.add", getItems);
        props.gifts?.cryptoGifts?.on("Relations.add", getItems);
        return () => {
            props.gifts?.pointsGifts?.off("Relations.add", getItems);
            props.gifts?.cryptoGifts?.off("Relations.add", getItems);
        }
    }, [props.gifts]);
    
    const getItems = () => {
        if(!props.gifts?.pointsGifts && !props.gifts?.cryptoGifts) return;
        let pointsSenders = [];
        let pointsAmount = 0;
        let cryptos = [];
        props.gifts?.pointsGifts?.getRelations().map((event) => {
            let content = event.getContent(); 
            if(!content) return null;
            let amount =  parseFloat(content["m.relates_to"].key);
            let time = event.getDate();
            pointsAmount += amount;
            pointsSenders.push({senderId: event.getSender(), amount, time});
        });
        props.gifts?.cryptoGifts?.getRelations().map((event) => {
            let content = event.getContent(); 
            if(!content) return null;
            let amount = trimSolTokenAmount(parseFloat(content["m.relates_to"].key));
            let time = event.getDate();
            let index = cryptos.findIndex(crypto => crypto?.name === content["m.relates_to"].crypto_name);
            if(index !== -1) {
                cryptos[index].amount += amount;
                cryptos[index].cryptoSenders.push({senderId: event.getSender(), amount, time});
            }
            else {
                let cryptoGift = {
                    name: content["m.relates_to"].crypto_name,
                    amount: amount,
                    cryptoSenders: [{senderId: event.getSender(), amount, time}]
                }
                cryptos.push(cryptoGift);
            }
        });
        if(pointsAmount) {
            setIsShowGift(true);
            let pointsItem = (
                <GiftsItem
                    amount={pointsAmount}
                    senders={pointsSenders}
                    type="points"
                />
            )
            setPointsGiftsItem(pointsItem);
        }
        if(cryptos.length) {
            setIsShowGift(true);
            let cryptoItems = cryptos.map((crypto) => {
                return <GiftsItem
                    amount={crypto.amount}
                    senders={crypto.cryptoSenders}
                    type={crypto.name}
                />
            })
            setCryptoGiftsItem(cryptoItems);
        }                
    }

    return (
        isShowGift
        ?
        <div className="mx_GiftRow">
            {pointsGiftsItem}
            {cryptoGiftsItem}
        </div>
        :
        <React.Fragment></React.Fragment>
    )
}
export default GiftsRow

