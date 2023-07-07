import React, { useState, useEffect, createRef } from "react";
import { useMatrixContexts, setCanJoin } from "../../../contexts";
import Lottie from 'lottie-react';
import BarrierLottie from '../../../../res/img/data_v_2.json';
import Field from "../elements/Field";
import { checkPasswordForJoin } from "../../../hooks/commonFuncs";
import { useAlert } from 'react-alert'

interface IProps {
    children: any,
}

const Password = (props: IProps) => {
    const [controller, dispatch] = useMatrixContexts();
    const { canJoin } = controller
    const alert = useAlert()

    const PasswordDialog = () => {    
        const [password, setPassword] = useState("");
        const passwordRef = createRef<Field>();

        const doPasswordCheck = (input) => {
            let result = checkPasswordForJoin(input);
            if(result) {
                window.localStorage.setItem('p', input);
                alert.success("Success.")
                setPassword("");
                setCanJoin(dispatch, true);
            }
            else {
                passwordRef.current.focus();
                alert.error("Password is not correct.")
            }            
        }

        const checkPassword = (e = null) => {
            if(canJoin || !passwordRef.current?.input?.value) return;
            if(e === null || e?.keyCode === 13) {
                doPasswordCheck(passwordRef.current?.input?.value);
            }
        }
        
        window.onkeypress = checkPassword;

        useEffect(() => {
            passwordRef.current.focus();
            var p = window.localStorage.getItem('p');
            if (p) {
                doPasswordCheck(p);
            } else {
                setTimeout(() => {
                    var p = window.localStorage.getItem('p');
                    if (p) {
                        doPasswordCheck(p);
                    }
                }, 1000);
            }
        }, []);

        const head = (
            <div className="mx_PasswordDialog_Wrap_Header">
                <div className="mx_PasswordDialog_Wrap_title">
                    What's the Password?
                </div>
                <div className="mx_PasswordDialog_Wrap_subTitle">
                    To gain early access, please enter the password we provided you...
                </div>
            </div>
        )
        
        const background = (
            <div className="mx_PasswordDialog_Wrap_background">
                <Lottie animationData={BarrierLottie}/>
            </div>
        )
    
        return (
            <div className="mx_PasswordDialog">
                <div className="mx_PasswordDialog_Wrap">
                    { head }
                    { background }
                    <Field
                        ref={passwordRef}
                        label={'Password'}
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        className="mx_PasswordDialog_Wrap_passwordInput"
                        maxLength={200}
                    />
                    <button 
                        className="mx_PasswordDialog_Wrap_signButton"
                        onClick={() => checkPassword()}
                    >
                        Sign In
                    </button>
                </div>
            </div>
        )
    }

    return (
        canJoin
        ?
        props.children
        :
        <PasswordDialog/>
    )
    
}

export default Password;