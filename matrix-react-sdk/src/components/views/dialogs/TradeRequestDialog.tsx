

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
import React, { useState, useEffect, FunctionComponent } from "react";

import { _t } from '../../../languageHandler';
import BaseDialog from "../dialogs/BaseDialog";
import dis from "../../../dispatcher/dispatcher";
import AccessibleButton from "../elements/AccessibleButton";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import Lottie from "lottie-react";
import TradingRequestBg from "../../../../res/img/trading/trading_request_bg.json";

interface IProps {
    tradeUserId: string;
    type: string;
    notification_id: string;
    onFinished(): void;
    webSocket?: any;
    tradingWebSocket?: any;
}


const TradeRequestDialog: FunctionComponent<IProps> = (props: IProps) => {
    
    const cli = MatrixClientPeg.get()
    const [tradeUser, setTradeUser] = useState(null);
    const [statement, setStatement] = useState("");
    const clickAcceptButton = () => { 
        props.webSocket.send(JSON.stringify({
            event: 'accept_trade_request',
            data:{
                notification_id: props.notification_id,
            }
        }));
        dis.dispatch({
            action: "show_trading_dialog",
            tradeUserId: props.tradeUserId,
            notification_id: props.notification_id,
            userId: cli.getUserId(),
            tradingWebSocket: props.tradingWebSocket
        })
        props.onFinished();   
    }

    const clickDenyButton = () => {
        props.webSocket.send(JSON.stringify({
            event: 'deny_trade_request',
            data:{
                notification_id: props.notification_id
            }
        }));
        props.onFinished();
    }

    const clickCancelButton = () => {
        props.webSocket.send(JSON.stringify({
            event: 'cancel_trade_request',
            data:{
                notification_id: props.notification_id
            }
        }));
        props.onFinished();
    }

    const getButtonGroups = () => {
        let buttonGroups;
        if(props.type == "waiting") {
            buttonGroups = (
                <div className="mx_TradeRequestDialog_button_group">                
                    <AccessibleButton className="mx_TradeRequestDialog_button cancel" onClick={clickCancelButton}>
                        Cancel
                    </AccessibleButton>
                </div>
            )
        }            
        else {
            buttonGroups = (
                <div className="mx_TradeRequestDialog_button_group">  
                    <AccessibleButton className="mx_TradeRequestDialog_button deny" onClick={clickDenyButton}>
                        Deny
                    </AccessibleButton>
                    <AccessibleButton className="mx_TradeRequestDialog_button accept" onClick={clickAcceptButton}>
                        Accept
                    </AccessibleButton>    
                </div>    
            )
        }
        return buttonGroups
    }

    const showTradingFinishModal = () => {
        let eventType = "cancel_trade_request";
        if(props.type !== "waiting") {
            eventType = "deny_trade_request";
        }
        props.webSocket.send(JSON.stringify({
            event: eventType,
            data:{
                notification_id: props.notification_id
            }
        }));
        props.onFinished();
    }

    useEffect(() => {     
        getInitilaState();
        document.getElementById("mx_Dialog_cancelButton").addEventListener("click", showTradingFinishModal);
    }, [])

    const getInitilaState = async() => {
        let userId: string = props.tradeUserId;
        if(userId) {
            let arr: string[] = userId.split(".");
            if(arr.length === 4) {
                userId = userId.replace(".", ":");
            }
            if(userId.charAt(0) !== "@") {
                userId = `@${userId}`;
            }
        }
        const otherUser = await cli.getProfileInfo(userId);
        setTradeUser(otherUser);
        let content
        if(props.type === "waiting") {
            content = `Waiting for ${otherUser?.displayname} to accept your trade invitation`;
        }
        else {
            content = `${otherUser?.displayname} wants to start a trade`;            
        }
        setStatement(content);
    }
   
    return (
        <BaseDialog className="mx_TradeRequestDialog" title={"Trade Request"} onFinished={props.onFinished} hasCancel={true}>
            <div className="mx_TradeRequestDialog_bg">
                <Lottie animationData={TradingRequestBg} className="mx_TradeRequestDialog_bg_lottie"/>
            </div>
            <div className={`mx_TradeRequestDialog_statement ${props.type === "waiting" ? "waiting" : ""}`}>
                { statement } 
                <div className="mx_TradeRequestDialog_subStatement">
                    Cafeteria is not responsible for user negligence, trade safe!
                </div>
            </div>
            { getButtonGroups() }
        </BaseDialog>
    )
    
}
export default  TradeRequestDialog 

