/*
Copyright 2015-2021 The Matrix.org Foundation C.I.C.

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

import React, { ReactNode, useEffect } from 'react';
import { MatrixError } from "matrix-js-sdk/src/http-api";

import { _t, _td } from '../../../languageHandler';
import Login, { ISSOFlow, LoginFlow } from '../../../Login';
import SdkConfig from '../../../SdkConfig';
import { messageForResourceLimitError } from '../../../utils/ErrorUtils';
import AutoDiscoveryUtils, { ValidatedServerConfig } from "../../../utils/AutoDiscoveryUtils";
import classNames from "classnames";
import AuthPage from "../../views/auth/AuthPage";
import PlatformPeg from '../../../PlatformPeg';
import SettingsStore from "../../../settings/SettingsStore";
import { UIFeature } from "../../../settings/UIFeature";
import CountlyAnalytics from "../../../CountlyAnalytics";
import { IMatrixClientCreds, MatrixClientPeg  } from "../../../MatrixClientPeg";
import PasswordLogin from "../../views/auth/PasswordLogin";
import InlineSpinner from "../../views/elements/InlineSpinner";
import Spinner from "../../views/elements/Spinner";
import SSOButtons from "../../views/elements/SSOButtons";
import { replaceableComponent } from "../../../utils/replaceableComponent";
import AuthBody from "../../views/auth/AuthBody";
import InteractiveAuth from "../InteractiveAuth";
import AccessibleButton from '../../views/elements/AccessibleButton';
import WalletSignupButtonGroup from './WalletSignUpButtonGroup';
import { signInWeb2Email } from '../../../apis';

// TODO
import { NightlyWallet } from "@nightlylabs/aptos-wallet-adapter-plugin";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { RiseWallet } from "@rise-wallet/wallet-adapter";
import { MSafeWalletAdapter } from "msafe-plugin-wallet-adapter";
import {
    AptosWalletAdapterProvider,
    NetworkName,
} from "@aptos-labs/wallet-adapter-react";

// These are used in several places, and come from the js-sdk's autodiscovery
// stuff. We define them here so that they'll be picked up by i18n.
_td("Invalid homeserver discovery response");
_td("Failed to get autodiscovery configuration from server");
_td("Invalid base_url for m.homeserver");
_td("Homeserver URL does not appear to be a valid Matrix homeserver");
_td("Invalid identity server discovery response");
_td("Invalid base_url for m.identity_server");
_td("Identity server URL does not appear to be a valid identity server");
_td("General failure");

interface IProps {
    serverConfig: ValidatedServerConfig;
    // If true, the component will consider itself busy.
    busy?: boolean;
    isSyncing?: boolean;
    // Secondary HS which we try to log into if the user is using
    // the default HS but login fails. Useful for migrating to a
    // different homeserver without confusing users.
    fallbackHsUrl?: string;
    defaultDeviceDisplayName?: string;
    fragmentAfterLogin?: string;
    defaultUsername?: string;

    // Called when the user has logged in. Params:
    // - The object returned by the login API
    // - The user's password, if applicable, (may be cached in memory for a
    //   short time so the user is not required to re-enter their password
    //   for operations like uploading cross-signing keys).
    onLoggedIn(data: IMatrixClientCreds, password: string): void;

    // login shouldn't know or care how registration, password recovery, etc is done.
    onRegisterClick(): void;
    onForgotPasswordClick?(): void;
    onServerConfigChange(config: ValidatedServerConfig): void;
    clientSecret?: string;
    sessionId?: string;
    idSid?: string;
    makeRegistrationUrl(params: {
        /* eslint-disable camelcase */
        client_secret: string;
        hs_url: string;
        is_url?: string;
        session_id: string;
        /* eslint-enable camelcase */
    }): string;
}

interface IState {
    busy: boolean;
    busyLoggingIn?: boolean;
    errorText?: ReactNode;
    loginIncorrect: boolean;
    // can we attempt to log in or are there validation errors?
    canTryLogin: boolean;

    flows?: LoginFlow[];

    // used for preserving form values when changing homeserver
    username: string;
    // phoneCountry?: string;
    // phoneNumber: string;
    loginType: string;

    // We perform liveliness checks later, but for now suppress the errors.
    // We also track the server dead errors independently of the regular errors so
    // that we can render it differently, and override any other error the user may
    // be seeing.
    serverIsAlive: boolean;
    serverErrorIsFatal: boolean;
    serverDeadError?: ReactNode;
    showInteractiveAuth: boolean;
    formVals: Record<string, string>;
    walletLoginErrorSection?: ReactNode;
    verifyResult: number;
    newUser: boolean;
    isVerifying: boolean;
}

enum LoginField {
    Email = "login_field_email",
    MatrixId = "login_field_mxid",
    // Phone = "login_field_phone",
    Password = "login_field_password",  
}

/*
 * A wire component which glues together login UI components and Login logic
 */
@replaceableComponent("structures.auth.LoginComponent")
export default class LoginComponent extends React.PureComponent<IProps, IState> {
    private unmounted = false;
    private loginLogic: Login;

    private readonly stepRendererMap: Record<string, () => ReactNode>;

    constructor(props) {
        super(props);

        this.state = {
            busy: false,
            busyLoggingIn: null,
            errorText: null,
            loginIncorrect: false,
            canTryLogin: true,
            loginType: "login_field_mxid",

            flows: null,

            username: props.defaultUsername? props.defaultUsername: '',
            // phoneCountry: null,
            // phoneNumber: "",

            serverIsAlive: true,
            serverErrorIsFatal: false,
            serverDeadError: "",
            showInteractiveAuth: false,
            formVals: {},
            walletLoginErrorSection: "",
            verifyResult: null,
            newUser: false,
            isVerifying: false,
        };

        // map from login step type to a function which will render a control
        // letting you do that login type
        this.stepRendererMap = {
            'm.login.password': this.renderPasswordStep,

            // CAS and SSO are the same thing, modulo the url we link to
            'm.login.cas': () => this.renderSsoStep("cas"),
            'm.login.sso': () => this.renderSsoStep("sso"),
        };

        CountlyAnalytics.instance.track("onboarding_login_begin");
        this.setVerifyResult = this.setVerifyResult.bind(this);
        this.setIsVerifying = this.setIsVerifying.bind(this);
    }

    // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
    // eslint-disable-next-line
    UNSAFE_componentWillMount() {
        this.initLoginLogic(this.props.serverConfig);
    }

    componentWillUnmount() {
        this.unmounted = true;
    }

    // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
    // eslint-disable-next-line
    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.serverConfig.hsUrl === this.props.serverConfig.hsUrl &&
            newProps.serverConfig.isUrl === this.props.serverConfig.isUrl) return;

        // Ensure that we end up actually logging in to the right place
        this.initLoginLogic(newProps.serverConfig);
    }

    isBusy = () => this.state.busy || this.props.busy;

    setVerifyResult = (result) => {
        this.setState({verifyResult: result.responseCode});
    }

    setIsVerifying = (value: boolean) => {
        this.setState({isVerifying: value});
    }

    signInViaMail = async(token: string) => {
        this.setState({ busy: true });
        const {success, userData} = await signInWeb2Email(token);

        if(!success) {
            this.setState({ busy: false });
            return;
        }

        const formVals = {
            username: userData.username,
            password: userData.password
        }

        window.localStorage.setItem("mx_userData", JSON.stringify(formVals));

        this.setState({
            formVals,
            showInteractiveAuth: true,
            newUser: userData.newUser
        })       
    }

    onPasswordLogin = async (username: string, password: string) => {
        if (!this.state.serverIsAlive) {
            this.setState({ busy: true });
            // Do a quick liveliness check on the URLs
            let aliveAgain = true;
            try {
                await AutoDiscoveryUtils.validateServerConfigWithStaticUrls(
                    this.props.serverConfig.hsUrl,
                    this.props.serverConfig.isUrl,
                );
                this.setState({ serverIsAlive: true, errorText: "" });
            } catch (e) {
                const componentState = AutoDiscoveryUtils.authComponentStateForError(e);
                this.setState({
                    busy: false,
                    busyLoggingIn: false,
                    ...componentState,
                });
                aliveAgain = !componentState.serverErrorIsFatal;
            }

            // Prevent people from submitting their password when something isn't right.
            if (!aliveAgain) {
                return;
            }
        }

        this.setState({
            busy: true,
            busyLoggingIn: true,
            errorText: null,
            loginIncorrect: false,
        });

        this.loginLogic.loginViaPassword(
            username, password,
        ).then((data) => {
            this.setState({ serverIsAlive: true }); // it must be, we logged in.
            this.props.onLoggedIn(data, password).then(() =>{
                const currentTime = +new Date();
                const matrixClient = MatrixClientPeg.get();
                if(this.state.newUser) {
                    MatrixClientPeg.setJustRegisteredUserId(data.userId);
                }
                matrixClient.loginDashboardApi(data.userId,currentTime).then(function(result){
                    console.log("login points added successfully", result)
                }).catch(function(e){
                    console.log("error occured while calling dashboard points api",e)
                });
            })
        }, (error) => {
            if (this.unmounted) {
                return;
            }
            let errorText;

            // Some error strings only apply for logging in
            const usingEmail = username.indexOf("@") > 0;
            if (error.httpStatus === 400 && usingEmail) {
                errorText = _t('This homeserver does not support login using email address.');
            } else if (error.errcode === 'M_RESOURCE_LIMIT_EXCEEDED') {
                const errorTop = messageForResourceLimitError(
                    error.data.limit_type,
                    error.data.admin_contact,
                    {
                        'monthly_active_user': _td(
                            "This homeserver has hit its Monthly Active User limit.",
                        ),
                        'hs_blocked': _td(
                            "This homeserver has been blocked by it's administrator.",
                        ),
                        '': _td(
                            "This homeserver has exceeded one of its resource limits.",
                        ),
                    },
                );
                const errorDetail = messageForResourceLimitError(
                    error.data.limit_type,
                    error.data.admin_contact,
                    {
                        '': _td("Please <a>contact your service administrator</a> to continue using this service."),
                    },
                );
                errorText = (
                    <div>
                        <div>{ errorTop }</div>
                        <div className="mx_Login_smallError">{ errorDetail }</div>
                    </div>
                );
            } else if (error.httpStatus === 401 || error.httpStatus === 403) {
                if (error.errcode === 'M_USER_DEACTIVATED') {
                    errorText = _t('This account has been deactivated.');
                } else if (SdkConfig.get()['disable_custom_urls']) {
                    let errMsg = "";
                    switch (this.state.loginType) {
                        case LoginField.Email:
                            errMsg = _t('Incorrect email and/or password.');
                            break;
                        case LoginField.MatrixId:
                            errMsg = _t('Incorrect username and/or password.');
                            break;
                        // case LoginField.Phone:
                        //     errMsg = _t('Incorrect phone country/number and/or password.');
                        //     break;
                    }
                    errorText = (
                        <div>
                            <div>{ errMsg }</div>
                            <div className="mx_Login_smallError">
                                { _t(
                                    'Please note you are logging into the %(hs)s server, not matrix.org.',
                                    { hs: this.props.serverConfig.hsName },
                                ) }
                            </div>
                        </div>
                    );
                } else {
                    switch (this.state.loginType) {
                        case LoginField.Email:
                            errorText = _t('Incorrect email and/or password.');
                            break;
                        case LoginField.MatrixId:
                            errorText = _t('Incorrect username and/or password.');
                            break;
                        // case LoginField.Phone:
                        //     errorText = _t('Incorrect phone country/number and/or password.');
                        //     break;
                    }
                }
            } else {
                // other errors, not specific to doing a password login
                errorText = this.errorTextFromError(error);
            }

            this.setState({
                busy: false,
                busyLoggingIn: false,
                errorText: errorText,
                // 401 would be the sensible status code for 'incorrect password'
                // but the login API gives a 403 https://matrix.org/jira/browse/SYN-744
                // mentions this (although the bug is for UI auth which is not this)
                // We treat both as an incorrect password
                loginIncorrect: error.httpStatus === 401 || error.httpStatus === 403,
            });
        });
    };

    getLoginTypeFunc = type => {
        this.setState({loginType: type});
    }

    onUsernameChanged = username => {
        this.setState({ username: username });
    };

    onUsernameBlur = async username => {
        const doWellknownLookup = username[0] === "@";
        this.setState({
            username: username,
            busy: doWellknownLookup,
            errorText: null,
            canTryLogin: true,
        });
        if (doWellknownLookup) {
            const serverName = username.split(':').slice(1).join(':');
            try {
                const result = await AutoDiscoveryUtils.validateServerName(serverName);
                this.props.onServerConfigChange(result);
                // We'd like to rely on new props coming in via `onServerConfigChange`
                // so that we know the servers have definitely updated before clearing
                // the busy state. In the case of a full MXID that resolves to the same
                // HS as Element's default HS though, there may not be any server change.
                // To avoid this trap, we clear busy here. For cases where the server
                // actually has changed, `initLoginLogic` will be called and manages
                // busy state for its own liveness check.
                this.setState({
                    busy: false,
                });
            } catch (e) {
                console.error("Problem parsing URL or unhandled error doing .well-known discovery:", e);

                let message = _t("Failed to perform homeserver discovery");
                if (e.translatedMessage) {
                    message = e.translatedMessage;
                }

                let errorText: ReactNode = message;
                let discoveryState = {};
                if (AutoDiscoveryUtils.isLivelinessError(e)) {
                    errorText = this.state.errorText;
                    discoveryState = AutoDiscoveryUtils.authComponentStateForError(e);
                }

                this.setState({
                    busy: false,
                    errorText,
                    ...discoveryState,
                });
            }
        }
    };

    // onPhoneCountryChanged = phoneCountry => {
    //     this.setState({ phoneCountry: phoneCountry });
    // };

    // onPhoneNumberChanged = phoneNumber => {
    //     this.setState({
    //         phoneNumber: phoneNumber,
    //     });
    // };

    onRegisterClick = ev => {
        ev.preventDefault();
        ev.stopPropagation();
        this.props.onRegisterClick();
    };

    onTryRegisterClick = ev => {
        const hasPasswordFlow = this.state.flows?.find(flow => flow.type === "m.login.password");
        const ssoFlow = this.state.flows?.find(flow => flow.type === "m.login.sso" || flow.type === "m.login.cas");
        // If has no password flow but an SSO flow guess that the user wants to register with SSO.
        // TODO: instead hide the Register button if registration is disabled by checking with the server,
        // has no specific errCode currently and uses M_FORBIDDEN.
        if (ssoFlow && !hasPasswordFlow) {
            ev.preventDefault();
            ev.stopPropagation();
            const ssoKind = ssoFlow.type === 'm.login.sso' ? 'sso' : 'cas';
            PlatformPeg.get().startSingleSignOn(this.loginLogic.createTemporaryClient(), ssoKind,
                this.props.fragmentAfterLogin);
        } else {
            // Don't intercept - just go through to the register page
            this.onRegisterClick(ev);
        }
    };

    private async initLoginLogic({ hsUrl, isUrl }: ValidatedServerConfig) {
        let isDefaultServer = false;
        if (this.props.serverConfig.isDefault
            && hsUrl === this.props.serverConfig.hsUrl
            && isUrl === this.props.serverConfig.isUrl) {
            isDefaultServer = true;
        }

        const fallbackHsUrl = isDefaultServer ? this.props.fallbackHsUrl : null;

        const loginLogic = new Login(hsUrl, isUrl, fallbackHsUrl, {
            defaultDeviceDisplayName: this.props.defaultDeviceDisplayName,
        });
        this.loginLogic = loginLogic;

        this.setState({
            busy: true,
            loginIncorrect: false,
        });

        // Do a quick liveliness check on the URLs
        try {
            const { warning } =
                await AutoDiscoveryUtils.validateServerConfigWithStaticUrls(hsUrl, isUrl);
            if (warning) {
                this.setState({
                    ...AutoDiscoveryUtils.authComponentStateForError(warning),
                    errorText: "",
                });
            } else {
                this.setState({
                    serverIsAlive: true,
                    errorText: "",
                });
            }
        } catch (e) {
            this.setState({
                busy: false,
                ...AutoDiscoveryUtils.authComponentStateForError(e),
            });
        }

        loginLogic.getFlows().then((flows) => {
            // look for a flow where we understand all of the steps.
            const supportedFlows = flows.filter(this.isSupportedFlow);

            if (supportedFlows.length > 0) {
                this.setState({
                    flows: supportedFlows,
                });
                return;
            }

            // we got to the end of the list without finding a suitable flow.
            this.setState({
                errorText: _t("This homeserver doesn't offer any login flows which are supported by this client."),
            });
        }, (err) => {
            this.setState({
                errorText: this.errorTextFromError(err),
                loginIncorrect: false,
                canTryLogin: false,
            });
        }).finally(() => {
            this.setState({
                busy: false,
            });
        });
    }

    private isSupportedFlow = (flow: LoginFlow): boolean => {
        // technically the flow can have multiple steps, but no one does this
        // for login and loginLogic doesn't support it so we can ignore it.
        if (!this.stepRendererMap[flow.type]) {
            console.log("Skipping flow", flow, "due to unsupported login type", flow.type);
            return false;
        }
        return true;
    };

    private errorTextFromError(err: MatrixError): ReactNode {
        let errCode = err.errcode;
        if (!errCode && err.httpStatus) {
            errCode = "HTTP " + err.httpStatus;
        }

        let errorText: ReactNode = _t("There was a problem communicating with the homeserver, " +
            "please try again later.") + (errCode ? " (" + errCode + ")" : "");

        if (err.cors === 'rejected') {
            if (window.location.protocol === 'https:' &&
                (this.props.serverConfig.hsUrl.startsWith("http:") ||
                 !this.props.serverConfig.hsUrl.startsWith("http"))
            ) {
                errorText = <span>
                    { _t("Can't connect to homeserver via HTTP when an HTTPS URL is in your browser bar. " +
                        "Either use HTTPS or <a>enable unsafe scripts</a>.", {},
                    {
                        'a': (sub) => {
                            return <a target="_blank" rel="noreferrer noopener"
                                href="https://www.google.com/search?&q=enable%20unsafe%20scripts"
                            >
                                { sub }
                            </a>;
                        },
                    }) }
                </span>;
            } else {
                errorText = <span>
                    { _t("Can't connect to homeserver - please check your connectivity, ensure your " +
                        "<a>homeserver's SSL certificate</a> is trusted, and that a browser extension " +
                        "is not blocking requests.", {},
                    {
                        'a': (sub) =>
                            <a target="_blank" rel="noreferrer noopener" href={this.props.serverConfig.hsUrl}>
                                { sub }
                            </a>,
                    }) }
                </span>;
            }
        }

        return errorText;
    }

    private makeRegisterRequest = auth => {
        const matrixClient = this.loginLogic.createTemporaryClient()
        // We inhibit login if we're trying to register with an email address: this
        // avoids a lot of complex race conditions that can occur if we try to log
        // the user in one one or both of the tabs they might end up with after
        // clicking the email link.
        let inhibitLogin = Boolean(this.state.formVals.email);

        // Only send inhibitLogin if we're sending username / pw params
        // (Since we need to send no params at all to use the ones saved in the
        // session).
        if (!this.state.formVals.password) inhibitLogin = null;

        const registerParams = {
            username: this.state.formVals.username,
            password: this.state.formVals.password,
            initial_device_display_name: this.props.defaultDeviceDisplayName,
            auth: undefined,
            inhibit_login: undefined,
        };
        if (auth) registerParams.auth = auth;
        if (inhibitLogin !== undefined && inhibitLogin !== null) registerParams.inhibit_login = inhibitLogin;
        return matrixClient.registerRequest(registerParams);
    };
    
    private onUIAuthFinished = async (success: boolean, response: any) => {
        if(!success) {
            this.onPasswordLogin(this.state.formVals.username, this.state.formVals.password)
            return;
        }
        MatrixClientPeg.setJustRegisteredUserId(response.user_id);
        const matrixClient = this.loginLogic.createTemporaryClient()
        if (response.access_token) {
            await this.props.onLoggedIn({
                userId: response.user_id,
                deviceId: response.device_id,
                homeserverUrl: matrixClient.getHomeserverUrl(),
                identityServerUrl: matrixClient.getIdentityServerUrl(),
                accessToken: response.access_token,
            }, this.state.formVals.password);
        }
    };

    private getUIAuthInputs() {
        return {
            emailAddress: this.state.formVals.email,
            phoneCountry: this.state.formVals.phoneCountry,
            phoneNumber: this.state.formVals.phoneNumber,
        };
    }

    private requestEmailToken = (emailAddress, clientSecret, sendAttempt, sessionId) => {
        return MatrixClientPeg.get().requestRegisterEmailToken(
            emailAddress,
            clientSecret,
            sendAttempt,
            this.props.makeRegistrationUrl({
                client_secret: clientSecret,
                hs_url: MatrixClientPeg.get().getHomeserverUrl(),
                is_url: MatrixClientPeg.get().getIdentityServerUrl(),
                session_id: sessionId,
            }),
        );
    };

    renderLoginComponentForFlows() {
        if (!this.state.flows) return null;
        // this is the ideal order we want to show the flows in
        const order = [
            "m.login.password",
            "m.login.sso",
        ];
        const matrixClient = this.loginLogic.createTemporaryClient()
        if(this.state.showInteractiveAuth) {
            return (
                <div className='mx_Login_wrap'>
                    <InteractiveAuth
                        matrixClient={matrixClient}
                        makeRequest={this.makeRegisterRequest}
                        onAuthFinished={this.onUIAuthFinished}
                        inputs={this.getUIAuthInputs()}
                        requestEmailToken={this.requestEmailToken}
                        sessionId={this.props.sessionId}
                        clientSecret={this.props.clientSecret}
                        emailSid={this.props.idSid}
                        poll={true}
                        setIsVerifying={this.setIsVerifying}
                    />
                </div>
            )
        }

        const flows = order.map(type => this.state.flows.find(flow => flow.type === type)).filter(Boolean);
        return <React.Fragment>
            { flows.map(flow => {
                const stepRenderer = this.stepRendererMap[flow.type];
                return <React.Fragment key={flow.type}>{ stepRenderer() }</React.Fragment>;
            }) }
        </React.Fragment>;
    }

    private getUserInfo = (user) => {
        let formVals = {
            username: user.username,
            password: user.password
        }
        this.setState({
            formVals,
            showInteractiveAuth: true,
            newUser: user.newUser
        })
    }

    private renderPasswordStep = () => {
        return (
            <div>
                {/* <AptosWalletAdapterProvider plugins={[new PetraWallet(), new MSafeWalletAdapter(), new NightlyWallet(), new RiseWallet()]}> */}
                <WalletSignupButtonGroup getUserInfo={this.getUserInfo} setVerifyResult={this.setVerifyResult}/>
                {/* </AptosWalletAdapterProvider> */}
                <div className='mx_Login_Legacy_badge common-badge bg-light-purple'>
                    Legacy
                </div>
                <PasswordLogin
                    setVerifyResult={this.setVerifyResult}
                    onSubmit={this.signInViaMail}
                    username={this.state.username}
                    // phoneCountry={this.state.phoneCountry}
                    // phoneNumber={this.state.phoneNumber}
                    onUsernameChanged={this.onUsernameChanged}
                    onUsernameBlur={this.onUsernameBlur}
                    // onPhoneCountryChanged={this.onPhoneCountryChanged}
                    // onPhoneNumberChanged={this.onPhoneNumberChanged}
                    onForgotPasswordClick={this.props.onForgotPasswordClick}
                    loginIncorrect={this.state.loginIncorrect}
                    serverConfig={this.props.serverConfig}
                    getLoginTypeFunc={this.getLoginTypeFunc}
                    disableSubmit={this.isBusy()}
                    busy={this.props.isSyncing || this.state.busyLoggingIn}
                    isSyncing={this.props.isSyncing}
                    busyLoggingIn={this.state.busyLoggingIn}
                    onTryRegisterClick={this.onTryRegisterClick}
                />
            </div>
        );
    };

    private renderSsoStep = loginType => {
        const flow = this.state.flows.find(flow => flow.type === "m.login." + loginType) as ISSOFlow;

        return (
            <SSOButtons
                matrixClient={this.loginLogic.createTemporaryClient()}
                flow={flow}
                loginType={loginType}
                fragmentAfterLogin={this.props.fragmentAfterLogin}
                primary={!this.state.flows.find(flow => flow.type === "m.login.password")}
            />
        );
    };

    render() {
        const loader = this.isBusy() && !this.state.busyLoggingIn ?
            <div className="mx_Login_loader"><Spinner /></div> : null;

        const errorText = this.state.errorText;

        const descriptionSection = (
            <div className='mx_Login_description grey bold my-4 px-4'>
                {
                    this.state.isVerifying
                    ?
                    <>
                        Thanks for verifying! Signing you in, please wait...
                    </>
                    :
                    <>
                        Join with one of your favourite wallets using <span className='t-purple bold'>Web3</span>. Don't have a crypto wallet? Use  <span className='light-purple bold'>Legacy</span>...
                    </>
                }
            </div>
        )

        let resultSection;
        switch(this.state.verifyResult) {
            case 200: 
                resultSection = (
                    <div className='mx_Login_mailSent bold grey t-center'>
                        <p>
                            ✉ We've sent a login link to your email. Please check your inbox!
                        </p>
                        <p className='mt-4'>
                            Can't see it? It might have landed in your junk folder...  
                        </p>
                    </div>
                )
            break;
            case 429:
                resultSection = (
                    <div className='mx_Login_mailSent bold grey t-center'>
                        <p>
                            Oops! All of our early BETA spots have been taken for today! Please try again tomorrow...🙏
                        </p>
                    </div>
                )
                break;
            default:
                if(this.state.verifyResult) {
                    resultSection = (
                        <div className='mx_Login_mailSent bold grey t-center'>
                            <p>
                                Something went wrong, please try again. 🙏
                            </p>
                        </div>
                    )
                }
            break;
        }
        
        let errorTextSection;
        if (errorText) {
            errorTextSection = (
                <div className="mx_Login_error">
                    { errorText }
                </div>
            );
        }

        let serverDeadSection;
        if (!this.state.serverIsAlive) {
            const classes = classNames({
                "mx_Login_error": true,
                "mx_Login_serverError": true,
                "mx_Login_serverErrorNonFatal": !this.state.serverErrorIsFatal,
            });
            serverDeadSection = (
                <div className={classes}>
                    { this.state.serverDeadError }
                </div>
            );
        }

        let walletLoginErrorSection = this.state.walletLoginErrorSection

        let footer;
        if (this.props.isSyncing || this.state.busyLoggingIn) {
            footer = <div className="mx_AuthBody_paddedFooter">
                <div className="mx_AuthBody_paddedFooter_title">
                    <InlineSpinner w={20} h={20} />
                    { this.props.isSyncing ? _t("Syncing...") : _t("Signing In...") }
                </div>
                { this.props.isSyncing && <div className="mx_AuthBody_paddedFooter_subtitle">
                    { _t("If you've joined lots of rooms, this might take a while") }
                </div> }
            </div>;
        } else if (SettingsStore.getValue(UIFeature.Registration)) {
            footer = (
                <span className="mx_AuthBody_changeFlow">
                    { _t("New? <a>Create account</a>", {}, {
                        a: sub => <a onClick={this.onTryRegisterClick} href="#">{ sub }</a>,
                    }) }
                </span>
            );
        }

        return (
            <AuthPage>
                {/* <AuthHeader disableLanguageSelector={this.props.isSyncing || this.state.busyLoggingIn} /> */}
                <AuthBody>
                    <div className='mx_AuthBody_container pb-4'>
                        <h2 className='py-4 t-white'>
                            { "Sign In/Up" }
                        </h2>
                        <div className='mx_AuthBody_main_wrap'>
                            { loader }
                            { !this.state.verifyResult && descriptionSection }
                            { errorTextSection }
                            { serverDeadSection }
                            { walletLoginErrorSection }
                            {/* <ServerPicker
                                serverConfig={this.props.serverConfig}
                                onServerConfigChange={this.props.onServerConfigChange}
                            /> */}
                            { !this.state.verifyResult && this.renderLoginComponentForFlows() }
                            { resultSection }
                        </div>
                    </div>
                </AuthBody>
            </AuthPage>
        );
    }
}
