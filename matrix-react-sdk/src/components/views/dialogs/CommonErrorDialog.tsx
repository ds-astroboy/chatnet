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

import React, {  } from "react";

import { _t } from '../../../languageHandler';
import { replaceableComponent } from "../../../utils/replaceableComponent";
import BaseDialog from "./BaseDialog";
import dis from "../../../dispatcher/dispatcher";
import { ErrorText, ErrorType } from "../../../@types/error-type";
import classNames from "classnames";

interface IState {
    isloading: boolean;
}

interface IProps {
    onFinished(): void;
    type: string;
}

@replaceableComponent("views.dialogs.CommonErrorDialog")
export default class CommonErrorDialog extends React.Component<IProps, IState> {    
    constructor(props) {
        super(props);
        this.state = {
            isloading: false,
        };
    }        

    private showHomePage = (): void => {
        dis.dispatch({action: "view_home_page"});
        this.props.onFinished();
    }  

    render(): React.ReactNode {
        const labels = [];
        switch(this.props.type) {
            case ErrorType.NftCheck:
                labels.push(ErrorText.NftRequirement);
                labels.push(ErrorText.NftBuyContent);
                break
            case ErrorType.WalletCheck:
            case ErrorType.WalletPay:
                labels.push(ErrorText.CryptoRequirement);
                labels.push(ErrorText.SolDepositeContent);
                break
            case ErrorType.PointsCheck:
            case ErrorType.PointsPay:
                labels.push(ErrorText.PointsRequirement);
                labels.push(ErrorText.PointsGetContent);
                break     
            case ErrorType.WalletConnect:
                labels.push(ErrorText.WalletConnectRequirement)         
                labels.push(ErrorText.WalletConnectContent)  
                break;       
        }         
        
        let dialogTitle = "Insufficient balance";
        let dialogClassName = classNames("mx_CryptoNotEnoughDialog");
        let dialogBg = (
            <div className="mx_CryptoNotEnoughDialog_bg">
                <img src={require("../../../../res/img/sorry-imoji.png")}/>
            </div>
        )
        let errorStatement = (
            <div className="mx_CryptoNotEnoughDialog_statement">
                <div className="mx_CryptoNotEnoughDialog_statement1">
                    {labels[0]}
                </div>
                <div className="mx_CryptoNotEnoughDialog_statement2">
                    {labels[1]}
                </div>
            </div>
        )
        let buttonsGroup = (
            <div className="mx_CryptoNotEnoughDialog_Button">
                <button onClick={this.showHomePage}>OK</button>
            </div>
        )

        return (
            <BaseDialog className={dialogClassName} title={dialogTitle} onFinished={this.showHomePage}>
                { dialogBg }
                { errorStatement }
                { buttonsGroup }
            </BaseDialog>
        );
    }
}
