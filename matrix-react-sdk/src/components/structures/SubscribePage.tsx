import React, { ChangeEvent, FC, useState } from "react";
import { _t } from "../../languageHandler";
import AccessibleButton from "../views/elements/AccessibleButton";
import Field from "../views/elements/Field";
import withValidation from "../views/elements/Validation";
import * as Email from "../../email";
import axios from "axios";
import { useAlert } from "react-alert";
import { emailSubscription } from "../../apis";

interface IProps {
    onLoginClick(): void;
}

const SubscribePage: FC<IProps> = (props) => {
    const [email, setEmail] = useState("");
    const alert = useAlert();

    const onEmailChanged = (ev: ChangeEvent<HTMLInputElement>) => {
        setEmail(ev.target.value);
    };

    const validateEmailRules = withValidation({
        rules: [
            {
                key: "required",
                test({ value, allowEmpty }) {
                    return allowEmpty || !!value;
                },
                invalid: () => _t("Enter email address"),
            }, {
                key: "email",
                test: ({ value }) => !value || Email.looksValid(value),
                invalid: () => _t("Doesn't look like a valid email address"),
            },
        ],
    });

    const onEmailValidate = async (fieldState) => {
        const result = await validateEmailRules(fieldState);
        return result;
    };

    const showLoginPage = () => {
        console.log("====");
        props.onLoginClick()
    }
    
    const onSubmit = async() => {
        if(!email) return;
        const {success, message} = await emailSubscription(email);
        if(success) {
            alert.success(message);
        }
        else {
            alert.error(message);
        }
    }

    return (
        <div className="mx_SubscribePage">
            <div className="mx_SubscribePage_header">
                <a href="https://twitter.com/cafeteriagg" target="_blank"  className="mx_SubscribePage_twitter d-flex justify-content-center align-items-center">
                    <div className="mx_SubscribePage_twitter_logo mr-4"></div>
                    <div className="mx_SubscribePage_twitter_content t-white bold">
                        Follow us on Twitter!
                    </div>
                </a>
                <AccessibleButton
                    className="mx_SubscribePage_enterButton"
                    onClick={showLoginPage}
                />
            </div>
            <div className="mx_SubscribePage_body">
                <div className="mx_SubscribePage_cafeteriaLogo">
                    <img src={require("../../../res/img/cafeteria-logo-slogan.png")}/>
                </div>
                <div className="mx_SubscribePage_description t-white bold t-center">
                    <p>
                        Cafeteria.gg is an innovative chat platform natively infused with the latest crypto-tech to bring a new and exciting community driven experience.
                    </p>
                    <p className="mt-4">
                        Subscribe to our newsletter and put yourself on our beta waitlist...
                    </p>
                </div>
                <form 

                    className="mx_SubscribePage_form d-flex justify-content-center align-items-center"
                >
                    <Field
                        className={`mx_SubscribePage_form_input dark bold ${email? "filled" : ""}`}
                        name="EMAIL" // make it a little easier for browser's remember-password
                        key="email_input"
                        type="text"
                        label="Enter your email..."
                        placeholder="joe@example.com"
                        value={email}
                        onChange={onEmailChanged}
                        onValidate={onEmailValidate}
                    />
                    <AccessibleButton
                        onClick={onSubmit}
                        className="mx_SubscribePage_form_button common-btn green-btn btn-hover-purple btn-large"
                    >
                        Subscribe
                    </AccessibleButton>
                </form>
            </div>  
            <div className="mx_SubscribePage_footer">
                <div className="d-flex justify-content-center align-items-center h-100">
                    <p className="t-white bold">@2022 Cafeteria.GG LTD. All rights reserved.</p>
                    <div className="verified-badge"></div>
                </div>
            </div>          
        </div >
    )
}

export default SubscribePage;