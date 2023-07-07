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

import React, { useState, FunctionComponent, ReactNode } from "react";

import { _t } from '../../../languageHandler';
import BaseDialog from "./BaseDialog";
import BaseAvatar from "../avatars/BaseAvatar";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import Lottie from "lottie-react";
import coinLottie from "../../../../res/img/lottie/points-tip-animations/receive.json";
import Spinner from "../elements/Spinner";
import AccessibleTooltipButton from "../../views/elements/AccessibleTooltipButton";
import AccessibleButton from "../elements/AccessibleButton";
import GmLottie from "../../../../res/img/lottie/Cafeteria-GM.json";
import { getLatestModal } from "../../../apis";
import dis from '../../../dispatcher/dispatcher';

interface IProps {
    onFinished(): void;
    userId: string;
}

const CongratulationDialog: FunctionComponent<IProps> = ({ onFinished, userId }) => {
    const[isGettingCredits, setIsGettingCredits] = useState(false);
    const[isShowLottie, setIsShowLottie] = useState(false);

    const showLatestModal = async() => {
        const {success, data} = await getLatestModal();
        if(!success || !data) return;
        dis.dispatch({
            action: "show_latestModal",
            data
        })
    }

    const getCredit = (): void => {
        const matrixClient = MatrixClientPeg.get();
        setIsGettingCredits(true);
        matrixClient.signUpDashboardApi(userId).then(function(result){
            console.log("signup points added successfully", result)
            setIsGettingCredits(false);
            setIsShowLottie(true);
            document.querySelector<HTMLAudioElement>("#pointsTipAudio").play();
            setTimeout(() => {
                onFinished();
                showLatestModal();
            }, 2500);
        }).catch(function(e){
            console.log("error occured while calling dashboard points api",e);
            onFinished();
            showLatestModal();
            setIsGettingCredits(false);
        });
    }

    const avatar: ReactNode = (
        <div className="mx_CongratulationDialog_avatar">
            <Lottie animationData={GmLottie} className="mx_CongratulationDialog_avatar_lottie"/>
        </div>
    )
    const statement1: ReactNode = (
        <div className="mx_CongratulationDialog_statement1">
            Welcome to Cafeteria!
        </div>
    );
    const statement2: ReactNode = (
        <div className="mx_CongratulationDialog_statement2">
            To kick things off, we’re loading you up with some FREE Cafeteria Credits! Use them to tip others or customize your experience!
        </div>
    )
    const award: ReactNode = (
        <div className="mx_CongratulationDialog_award">
            <div className="mx_CongratulationDialog_award_logo"></div>
            <div className="mx_CongratulationDialog_award_amount">100</div>
        </div>
    )
    const help: ReactNode = (
        <div className="mx_CongratulationDialog_help">
            <div className="mx_CongratulationDialog_help_title">Coming soon</div>
            <div className="mx_CongratulationDialog_help_icon"></div>
            <div className="mx_CongratulationDialog_help_content">
                Click here to learn more about Cafeteria Collectables!
            </div>
        </div>
    )
    const claimbutton: ReactNode = (
        <div className="mx_CongratulationDialog_claimButton">
            <AccessibleButton
                className="common-btn green-btn btn-hover-purple btn-large"
                onClick={() => getCredit()}
            >
                { isShowLottie && <Lottie animationData={coinLottie} loop={false} className="mx_CongratulationDialog_coinLottie"/> }
                {
                    isGettingCredits
                    ?
                    <Spinner/>
                    :
                    `Claim Cafeteria Credits`
                }            
            </AccessibleButton>
        </div>
    )

    return (
        <BaseDialog className="mx_CongratulationDialog" title={"Signup Complete"} onFinished={onFinished} hasCancel={false}>
            { avatar }
            { statement1 }
            { statement2 }
            { award }
            {/* { help }  */}
            { claimbutton }               
        </BaseDialog>
    )
}

export default CongratulationDialog
