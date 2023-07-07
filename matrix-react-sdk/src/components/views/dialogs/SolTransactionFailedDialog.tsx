import React, { useState, useEffect, FunctionComponent } from "react";

import { _t } from '../../../languageHandler';
import BaseDialog from "../dialogs/BaseDialog";
import AccessibleButton from "../elements/AccessibleButton";
import Lottie from "lottie-react";
import cancelLottie from "../../../../res/img/lottie/close-animation.json"

interface IProps {
    onFinished(): void;
}

const SolTransactionFailedDialog: FunctionComponent<IProps> = ({ 
    onFinished,
}) => {
    const [waitingSecond, setWaitingSecond] = useState(30); 

    const countTime = () => {
        if(waitingSecond == 0) {
            onFinished();
            return;
        }
        setWaitingSecond(waitingSecond - 1);
    }    

    const lottieAnimation = (
        <Lottie animationData={cancelLottie} loop={false} className="mx_ResultDialog_lottie_animation_item"/>
    );
    const statement = (
        <div className="mx_ResultDialog_statement">
            Your Crypto Tip Transaction has failed due to Blockchain congestio. please try again later
        </div>
    );
    const buttonsGroup = (
        <div className="mx_ResultDialog_Buttons_Group cancel">
            <AccessibleButton
                className="mx_ResultDialog_Button close"
                onClick={onFinished}
            >
                close
            </AccessibleButton>
        </div>
    );

    const subStatement = (
        <div className="mx_ResultDialog_subStatement">
            This window will close automatically in {waitingSecond} seconds
        </div>
    );

    useEffect(() => {
        setTimeout(countTime, 1000)
    }, [waitingSecond]);
   
    return (
        <BaseDialog className="mx_ResultDialog" title={"Transaction Failed"} onFinished={onFinished}>
            <div className="mx_ResultDialog_lottie_animation">
                { lottieAnimation }
            </div>
            <div className="mx_ResultDialog_discription">
                { statement }
                { subStatement }
            </div>
            { buttonsGroup }
        </BaseDialog>
    )
    
}
export default  SolTransactionFailedDialog 


