import classNames from "classnames";
import React, { useState, useEffect, FC, useMemo } from "react"
import { getUserPoints } from "../../../apis";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import { objectClone } from "../../../utils/objects";
import BaseDialog from "./BaseDialog";
import Dropdown from "../../views/elements/Dropdown";
import 'vanilla-hcaptcha';
import axios from "axios";
import PropTypes from "prop-types";
import MatrixClientContext from "../../../contexts/MatrixClientContext";

interface IProps {
    onFinished: (success: boolean) => void;
    roomId: string;
    userId: string;
}

export default class UserVerificationDialog extends React.Component<IProps> {
    async verifyUser(e) {
        const verifyUser = await axios.post(
            `https://node-main.cafeteria.gg/v1/bots/humanVerificationBot/${this.props.roomId}/verifyUser/${this.props.userId}`,
            { token: e.token }
        )
        if (verifyUser.status == 201){
            this.props.onFinished(false);
        }
    }
    componentDidMount() {
        const verificationCaptcha = document.getElementById('verificationCaptcha');
        verificationCaptcha.addEventListener('verified', (e) => this.verifyUser(e));
    }
    render() {
        return (
            <BaseDialog title="User Verification" className="mx_UserVerificationDialog" hasCancel={true} onFinished={this.props.onFinished}>
                <h3 className="mx_UserVerificationDialog_modalNotice">This group requires users to prove they're human before participating</h3>
                <div className="mx_UserVerificationDialog_header">
                    <div className="mx_UserVerificationDialog_taps">
                        <h-captcha id="verificationCaptcha"
                                   site-key="da5da1ab-6d94-472a-b034-5b98bff8e6b7"
                                   size="normal"
                                   theme="light">
                        </h-captcha>
                    </div>
                </div>
            </BaseDialog>
        );
    }
}