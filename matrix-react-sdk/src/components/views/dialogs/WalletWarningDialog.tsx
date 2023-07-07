import React, { FC } from 'react';
import AccessibleButton from '../elements/AccessibleButton';
import BaseDialog from "./BaseDialog";

interface IProps {
    onFinished: () => void;
}
const WalletWarningDialog: FC<IProps> = (props: IProps) => {
    const herderImg = require("../../../../res/img/search.png");
    const warningImg = require("../../../../res/img/warning1.svg");
    
    return (
        <BaseDialog className="mx_WalletWarningDialog" title={"Important Tip"} onFinished={props.onFinished} headerImage={herderImg}>
            {<div className='mx_WalletWarningDialog_image'><img src={warningImg} /></div>}

            <div
                className='mx_WalletWarningDialog_title dark bold'
            >
                Please Read Before Adding a Second Wallet
            </div>
            <div
                className='mx_WalletWarningDialog_content dark'
            >
                Please be advised that if you try to connect an already in-use Primary Wallet (a wallet that has been used on another account as the  primary sign in using web3), you could lose access to that account enitrely. We are working on adding extra safety measures to ensure this does not happen in the future, but for now it's up to you.
            </div>
            <AccessibleButton
                className='mx_WalletWarningDialog_button common-btn btn-hover-purple green-btn btn-lg px-4'
                onClick={props.onFinished}
            >
                I Understand
            </AccessibleButton>
        </BaseDialog>
    )
}

export default WalletWarningDialog