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

import React, { ChangeEvent, createRef, InputHTMLAttributes, KeyboardEvent, SyntheticEvent } from "react";
import { Room } from "matrix-js-sdk/src/models/room";

import SdkConfig from '../../../SdkConfig';
import withValidation, { IFieldState } from '../elements/Validation';
import { _t } from '../../../languageHandler';
import { MatrixClientPeg } from '../../../MatrixClientPeg';
import { Key } from "../../../Keyboard";
import { IOpts, privateShouldBeEncrypted } from "../../../createRoom";
import { CommunityPrototypeStore } from "../../../stores/CommunityPrototypeStore";
import { replaceableComponent } from "../../../utils/replaceableComponent";
import Field from "../elements/Field";
import RoomAliasField from "../elements/RoomAliasField";
import LabelledToggleSwitch from "../elements/LabelledToggleSwitch";
import Dropdown from "../elements/Dropdown";
import BaseDialog from "./BaseDialog";
import { Preset, Visibility } from "matrix-js-sdk/src/@types/partials";
import * as sdk from "../../../index";
import AvatarChangeContent from '../settings/AvatarChangeContent';
import axios, { AxiosRequestConfig, ResponseType } from "axios"
import LoadingScreen from "../rooms/LoadingScreen";
import loadingLottie from "../../../../res/img/cafeteria-loading-regular.json";
import dis from "../../../dispatcher/dispatcher";
import AdjustableAvatar from '../settings/AdjustableAvatar';
import ReactModal from 'react-modal';
import { createGroup, getAllCategories, setBarrierToRoom, setCategoryToRoom } from "../../../apis";
import { currenciesInfo, cafeteriaCurrencyList, ethCurrencyList, maticCurrencyList, solanaCurrencyList, aptosCurrencyList } from "../../../@variables/currencies";
import AccessibleButton from "../elements/AccessibleButton";
import { BLOCKCHAINNETWORKS, PROVIDERNAMES } from "../../../@variables/common";
import Modal from "../../../Modal";
import Spinner from "../elements/Spinner";
import { objectClone } from "../../../utils/objects";
import { getProtocol } from "../../../hooks/commonFuncs";

interface IProps {
    defaultPublic?: boolean;
    defaultName?: string;
    parentSpace?: Room;
    onFinished(proceed: boolean, opts?: IOpts, room_uri?: any, barrierObj?: any, categoryName?: string): void;
    wallets: any;
}

interface IState {
    isPrivate: boolean;
    isEncrypted: boolean;
    name: string;
    topic: string;
    alias: string;
    detailsOpen: boolean;
    noFederate: boolean;
    nameIsValid: boolean;
    canChangeEncryption: boolean;
    categoryValue: string;
    isPointBarrier: boolean;
    isCryptoNFTBarrier: boolean;
    avatarUrl: string | ArrayBuffer,
    avatarFile: File,
    enableProfileSave: boolean,
    password: string;
    confirmPassword: string;
    pointBarrierSelectValue: string;
    pointBarrierAmount: string;
    cryptoBarrierSelectValue: string;
    cryptoBarrierAmount: string;
    isWaitingNftAvatar: boolean;
    optionIndex: number;
    barrierRuleIndex: number;
    NFTBarrierInfo: any;
    modalIsOpen: boolean;
    croppedImage: any;
    categories: string[];
    isRoomCreating: boolean;
    currencyList: string[];
    isEmptyCategory: boolean;
}

const points = [
    {
        logo: require("../../../../res/img/cafeteria-point.png"),
        name: "Cafeteria Credits"
    }
]

@replaceableComponent("views.dialogs.CreateRoomDialog")
export default class CreateRoomDialog extends React.Component<IProps, IState> {
    private nameField = createRef<Field>();
    private aliasField = createRef<RoomAliasField>();
    private dropdownField = createRef<Dropdown>();
    private avatarUpload = createRef<HTMLInputElement>();
    private provider = JSON.parse(window.localStorage.getItem("mx_provider"));

    constructor(props) {
        super(props);

        const config = SdkConfig.get();
        this.state = {
            isPrivate: false,
            // isEncrypted: privateShouldBeEncrypted(),
            isEncrypted: false,
            name: this.props.defaultName || "",
            topic: "",
            alias: "",
            detailsOpen: false,
            noFederate: config.default_federate === false,
            nameIsValid: false,
            canChangeEncryption: true,
            categoryValue: "Category",
            isPointBarrier: false,
            isCryptoNFTBarrier: false,
            avatarUrl: "",
            avatarFile: null,
            enableProfileSave: false,
            password: "",
            confirmPassword: "",
            pointBarrierSelectValue: currenciesInfo[cafeteriaCurrencyList[0]].name,
            cryptoBarrierSelectValue: "",
            cryptoBarrierAmount: "50",
            pointBarrierAmount: "50",
            isWaitingNftAvatar: false,
            optionIndex: null,
            barrierRuleIndex: null,
            NFTBarrierInfo: null,
            modalIsOpen: false,
            croppedImage: null,
            categories: ['Category'],
            isRoomCreating: false,
            currencyList: [],
            isEmptyCategory: false,
        };

        MatrixClientPeg.get().doesServerForceEncryptionForPreset(Preset.PrivateChat)
            .then(isForced => this.setState({ canChangeEncryption: !isForced }));
    }



    private roomCreateOptions = () => {
        const opts: IOpts = {};
        const createOpts: IOpts["createOpts"] = opts.createOpts = {};
        createOpts.name = this.state.name;

        if (!this.state.isPrivate) {
            createOpts.visibility = Visibility.Public;
            createOpts.preset = Preset.PublicChat;
            opts.guestAccess = false;
            const { alias } = this.state;
            createOpts.room_alias_name = alias.substr(1, alias.indexOf(":") - 1);
        }
        if (this.state.topic) {
            createOpts.topic = this.state.topic;
        }
        if (this.state.noFederate) {
            createOpts.creation_content = { 'm.federate': false };
        }

        if (this.state.isPrivate) {
            if (this.state.canChangeEncryption) {
                opts.encryption = this.state.isEncrypted;
            } else {
                // the server should automatically do this for us, but for safety
                // we'll demand it too.
                opts.encryption = true;
            }
        }

        if (CommunityPrototypeStore.instance.getSelectedCommunityId()) {
            opts.associatedWithCommunity = CommunityPrototypeStore.instance.getSelectedCommunityId();
        }

        if (this.props.parentSpace) {
            opts.parentSpace = this.props.parentSpace;
        }

        return createOpts;
    }

    componentDidMount() {
        // move focus to first field when showing dialog
        this.nameField.current.focus();
        this.getInitialData();

        const solanaWallet = this.props.wallets.find(wallet => wallet.type === "solana");
        const aptosWallet = this.props.wallets.find(wallet => wallet.type === "aptos");
        const ethWallet = this.props.wallets.find(wallet => wallet.type === "ethereum");
        let currencyList = objectClone(this.state.currencyList);
        if(solanaWallet) {
            currencyList = [...currencyList, ...solanaCurrencyList];
        }
        if(aptosWallet) {
            currencyList = [...currencyList, ...aptosCurrencyList];
        }
        if(ethWallet) {
            currencyList = [...currencyList, ...ethCurrencyList, ...maticCurrencyList];
        }
        console.log("currencyList = ", currencyList);

        this.setState({
            currencyList: currencyList,
        })
        if(currencyList.length) {
            this.setState({
                cryptoBarrierSelectValue: currenciesInfo[currencyList[0]].name
            })
        }
    }

    componentWillUnmount() {
    }

    private getInitialData = async() => {
        let categories = [];
        categories = await getAllCategories();
        this.setState({categories: ["Category", ...categories]});
    }
    private onKeyDown = (event: KeyboardEvent) => {
        if (event.key === Key.ENTER) {
            this.onOk();
            event.preventDefault();
            event.stopPropagation();
        }
    };

    // TODO I modified - need to check
    private getBarrierInfo = () => {
        const solanaWallet = this.props.wallets.find(wallet => wallet.type === "solana");
        const aptosWallet = this.props.wallets.find(wallet => wallet.type === "aptos");
        const ethWallet = this.props.wallets.find(wallet => wallet.type === "ethereum");
        let obj;
        let barrierRule;
        let protocol = getProtocol(this.state.cryptoBarrierSelectValue);
        let wallet = ethWallet;
        if(protocol === BLOCKCHAINNETWORKS.Solana) {
            wallet = solanaWallet;
        }
        if(protocol === BLOCKCHAINNETWORKS.Aptos) {
            wallet = aptosWallet;
        }
        switch (this.state.optionIndex) {
            case 0:
                barrierRule = "points.check"
                if (this.state.barrierRuleIndex) {
                    barrierRule = "points.pay"
                }
                obj = {
                    "type": barrierRule,
                    "currency_type": "cafeteria.points",
                    "amount": parseFloat(this.state.pointBarrierAmount),
                    "creator": MatrixClientPeg.get().getUserId()
                }
                break;
            case 1:
                barrierRule = "wallet.check"
                if (this.state.barrierRuleIndex) {
                    barrierRule = "wallet.pay"
                }
                let creator;
                if (wallet?.account?.publicKey?.toString()) creator = wallet?.account?.publicKey?.toString();
                else creator = wallet?.account || wallet?.publicKey?.toBase58();
                obj = {
                    "type": barrierRule,
                    "currency_type": this.state.cryptoBarrierSelectValue,
                    "amount": parseFloat(this.state.cryptoBarrierAmount),
                    "creator": creator, 
                    "protocol": protocol
                }
                break;
            case 2:
                obj = {
                    "type": "nft.check",
                    "nft_update_auth_addr": this.state.NFTBarrierInfo.updateAuthority,
                    "uri": this.state.NFTBarrierInfo.img,
                    "protocol": this.state.NFTBarrierInfo.protocol,
                    "hard_barrier": !!this.state.barrierRuleIndex
                }
                break;
        }
        console.log("Barrier Object = ", obj, this.state.NFTBarrierInfo);
        return obj;
    }

    private onOk = async () => {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
            activeElement.blur();
        }
        await this.nameField.current.validate({ allowEmpty: false });
        // if (this.aliasField.current) {
        //     await this.aliasField.current.validate({ allowEmpty: false });
        // }
        if(this.state.categoryValue === "Category") {
            this.setState({
                isEmptyCategory: true
            });
        }
        // Validation and state updates are async, so we need to wait for them to complete
        // first. Queue a `setState` callback and wait for it to resolve.
        await new Promise<void>(resolve => this.setState({}, resolve));
        // if (this.state.nameIsValid && (!this.aliasField.current || this.aliasField.current.isValid) && this.state.categoryValue !== "Category") {
        if (this.state.nameIsValid && this.state.categoryValue !== "Category") {
            let room_uri;
            let barrierObj = this.getBarrierInfo();
            this.setState({isRoomCreating: true})
            if (this.state.avatarFile) {
                room_uri = await MatrixClientPeg.get().uploadContent(this.state.avatarFile, {onlyContentUri: true});
            }
            this.setState({isRoomCreating: false});
            const roomOptions = {
                "room_name": this.state.name,
                "room_topic": this.state.topic
            }

            this.props.onFinished(false);

            const auth = JSON.parse(window.localStorage.getItem("mx_userData"));
            if(auth) {
                let modal = Modal.createDialog(Spinner, null, 'mx_Dialog_spinner');
                const {success, data} = await createGroup(auth, roomOptions);
                modal.close();
                if(success) {
                    if(room_uri) {
                        await MatrixClientPeg.get().sendStateEvent(data.room_id, 'm.room.avatar', { url: room_uri }, '');
                    }
                    const accessToken = MatrixClientPeg.get().getAccessToken();
                    if(this.state.categoryValue) {
                        setCategoryToRoom(accessToken, this.state.categoryValue, data.room_id);
                    }            
                    if(barrierObj) {
                        setBarrierToRoom(accessToken, data.room_id, barrierObj)
                    }
                    dis.dispatch({
                        action: 'view_room',
                        room_id: data.room_id,
                        should_peek: false,
                        // Creating a room will have joined us to the room,
                        // so we are expecting the room to come down the sync
                        // stream, if it hasn't already.
                        joining: true,
                    });
                }
            }

            

            // if(this.state.categoryValue === "Category") {
            //     this.props.onFinished(true, this.roomCreateOptions(), room_uri, barrierObj, '');
            // }
            // else {
            //     this.props.onFinished(true, this.roomCreateOptions(), room_uri, barrierObj, this.state.categoryValue);
            // }
        } else {
            let field;
            if (!this.state.nameIsValid) {
                field = this.nameField.current;
            } else if (this.aliasField.current && !this.aliasField.current.isValid) {
                field = this.aliasField.current;
            }
            if (field) {
                field.focus();
                field?.validate({ allowEmpty: false, focused: true });
            }
        }
    };

    private onNameChange = (ev: ChangeEvent<HTMLInputElement>) => {
        this.setState({ name: ev.target.value });
    };

    private onTopicChange = (ev: ChangeEvent<HTMLInputElement>) => {
        this.setState({ topic: ev.target.value });
    };

    private onCategoryChange = (category: string) => {
        if(category === "Category") {
            this.setState({
                isEmptyCategory: true
            });
        } 
        else {
            this.setState({
                isEmptyCategory: false
            });
        }
        if (this.state.categoryValue === category) return;

        this.setState({ categoryValue: category });
    }

    private onPointBarrierSelectChange = (currency: string) => {
        if (this.state.pointBarrierSelectValue === currency) return;
        this.setState({ pointBarrierSelectValue: currency });
    }

    private onCryptoBarrierSelectChange = (currency: string) => {
        if (!this.props.wallets?.length) return;
        if (this.state.cryptoBarrierSelectValue === currency) return;
        this.setState({ cryptoBarrierSelectValue: currency });
    }

    private onPointBarrierAmountChange = (ev: ChangeEvent<HTMLInputElement>) => {
        this.setState({ pointBarrierAmount: ev.target.value });
    }

    private onCryptoBarrierAmountChange = (ev: ChangeEvent<HTMLInputElement>) => {
        if (!this.props.wallets?.length) return;
        this.setState({ cryptoBarrierAmount: ev.target.value });
    }

    private onPrivateChange = (isPrivate: boolean) => {
        this.setState({ isPrivate });
    };

    private onPointBarrierChange = (isPointBarrier: boolean) => {
        if (isPointBarrier && this.state.isCryptoNFTBarrier) {
            this.setState({ optionIndex: 0, isCryptoNFTBarrier: false, barrierRuleIndex: 0 })
        }
        else if (isPointBarrier) {
            this.setState({ optionIndex: 0, barrierRuleIndex: 0 });
        }
        else {
            this.setState({ optionIndex: null, barrierRuleIndex: null })
        }
        this.setState({ isPointBarrier });
    }

    private onCryptoNFTBarrierChange = (isCryptoNFTBarrier: boolean) => {
        if (isCryptoNFTBarrier && this.state.isPointBarrier) {
            this.setState({ optionIndex: 1, isPointBarrier: false, barrierRuleIndex: 0 })
        }
        else if (isCryptoNFTBarrier) {
            this.setState({ optionIndex: 1, barrierRuleIndex: 0 });
        }
        else {
            this.setState({ optionIndex: null, barrierRuleIndex: null })
        }
        this.setState({ isCryptoNFTBarrier })
    }

    private onEncryptedChange = (isEncrypted: boolean) => {
        this.setState({ isEncrypted });
    };

    private onAliasChange = (alias: string) => {
        this.setState({ alias });
    };

    private onNameValidate = async (fieldState: IFieldState) => {
        const result = await CreateRoomDialog.validateRoomName(fieldState);
        this.setState({ nameIsValid: result.valid });
        return result;
    };
    private onPasswordChange = (ev: ChangeEvent<HTMLInputElement>) => {
        this.setState({ password: ev.target.value });
    };
    private onConfirmPasswordChange = (ev: ChangeEvent<HTMLInputElement>) => {
        this.setState({ confirmPassword: ev.target.value });
    };


    private static validateRoomName = withValidation({
        rules: [
            {
                key: "required",
                test: async ({ value }) => !!value,
                invalid: () => _t("Please enter a name for the room"),
            },
        ],
    });

    _uploadAvatar = () => {
        this.avatarUpload.current.click();
    };

    _removeAvatar = () => {
        // clear file upload field so same file can be selected
        this.avatarUpload.current.value = "";
        this.setState({
            avatarUrl: null,
            avatarFile: null,
            enableProfileSave: true,
        });
    };
    _onAvatarChanged = (e) => {
        if (!e.target.files || !e.target.files.length) {
            this.setState({
                avatarUrl: null,
                avatarFile: null,
                enableProfileSave: false,
            });
            return;
        }

        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            this.setState({
                avatarUrl: ev.target.result,
                avatarFile: file,
                enableProfileSave: true,
            });
        };
        reader.readAsDataURL(file);
    };


    adjustableNftAvatar = async (img_url: string) => {
        this.setState({ isWaitingNftAvatar: true })
        await axios.get(img_url, { responseType: 'blob' })
            .then(response => {
                this.setState({
                    avatarUrl: img_url,
                    avatarFile: response.data,
                    enableProfileSave: true
                })
            });
        this.setState({ isWaitingNftAvatar: false })
    }
    clickCloseModal = () => {
        this.setState({ modalIsOpen: false });
    }

    setCroppedImage = (croppedImage, ImgDate) => {
        this.setState({
            croppedImage,
            enableProfileSave: true,
            avatarFile: ImgDate
        })
    }

    setAdjustableAvatar = () => {
        this.setState({ modalIsOpen: true })
    }

    render() {
        const isWalletConnected = (this.props.wallets?.length);
        let aliasField;
        const domain = MatrixClientPeg.get().getDomain();
        if (!this.state.isPrivate) {
            aliasField = (
                <div className="mx_CreateRoomDialog_aliasContainer">
                    <RoomAliasField
                        ref={this.aliasField}
                        onChange={this.onAliasChange}
                        domain={domain}
                        value={this.state.alias}
                    />
                </div>
            );
        }
        else {
            aliasField = (
                <div className="mx_CreateRoomDialog_PasswordContainer">
                    <Field
                        label={_t("Password")}
                        onChange={this.onPasswordChange}
                        value={this.state.password}
                        className="mx_CreateRoomDialog_Password mt-4"
                        minLength={6}
                    />
                    <Field
                        label={_t('Confirm Password')}
                        onChange={this.onConfirmPasswordChange}
                        value={this.state.confirmPassword}
                        className="mx_CreateRoomDialog_ConfirmPassword mt-4"
                    />
                </div>
            )
        }

        let publicPrivateLabel = <p>
            "Private groups can be found and joined by invitation only. Public groups can be found and joined by anyone."
        </p>;

        let pointBarrierLabel = <p>{
            "Users will be required to have a minimum amount of admin specified Cafeteria Credits in their wallet to join your group. The minimum amount entered can be changed later."
        }</p>;

        let cryptoNFTBarrierLabel = <p>
            {
                "Users will be required to have a minimum amount of admin specified crypto in their wallet to join your group. The minimum amount entered can be changed later."
            }</p>;

        const changeOptionIndex = (index) => {
            if (!isWalletConnected && index) return;
            this.setState({ optionIndex: index })
        }

        const changeBarrierRule = (index) => {
            this.setState({ barrierRuleIndex: index });
        }

        const currencyOptions = [];
        this.state.currencyList.map(currency => {
            if(currency !== "Cafeteria Credits") {
                currencyOptions.push((
                        <div key={currenciesInfo[currency].name} className="mx_CreateRoomDialog_currencyOption">
                            <div className="mx_CreateRoomDialog_currencyLogo">
                                <img src={currenciesInfo[currency].logo} />
                            </div>
                            <div className="mx_CreateRoomDialog_currencyName">
                                {currenciesInfo[currency].name}
                            </div>
                        </div>
                    )
                )
            }
        })

        const pointOptions = cafeteriaCurrencyList.map(currency => {
            return (
                <div key={currenciesInfo[currency].name} className="mx_CreateRoomDialog_currencyOption">
                    <div className="mx_CreateRoomDialog_currencyLogo">
                        <img src={currenciesInfo[currency].logo} />
                    </div>
                    <div className="mx_CreateRoomDialog_currencyName">
                        {currenciesInfo[currency].name}
                    </div>
                </div>
            )
        })

        const getNftData = (data) => {
            this.setState({ NFTBarrierInfo: data });
        }

        const showNftCategoryDialog = () => {
            console.log("Is this right?");
            dis.dispatch({
                action: "show_nft_category_dialog",
                wallets: this.props.wallets,
                getNftData
            })
        }

        const clickWalletConnectButton = () => {
            this.props.onFinished(false);
            document.getElementById("wallet-connect-button").click();
        }

        const CreditBarrierBody = (
            <div className="mx_CreateRoomDialog_option_body">
                <div className="mx_CreateRoomDialog_currency_wrap mt-4">
                    <div className="mx_CreateRoomDialog_Dropdown">
                        <Dropdown
                            id="mx_PointBarrierDropdown"
                            onOptionChange={this.onPointBarrierSelectChange}
                            searchEnabled={false}
                            value={this.state.pointBarrierSelectValue}
                            label={"Credits Dropdown"}>
                            {pointOptions}
                        </Dropdown>
                    </div>
                    <div className="mx_CreateRoomDialog_AmountInput">
                        <Field
                            onChange={this.onPointBarrierAmountChange}
                            value={this.state.pointBarrierAmount}
                            type="number"
                        />
                    </div>
                </div>
                <div className="mx_CreateRoomDialog_joinConditions mt-4">
                    <div className="mx_CreateRoomDialog_joinCondition">
                        <div className={`mx_CreateRoomDialog_radio_button ${this.state.barrierRuleIndex == 0 ? "active" : ""}`} onClick={() => changeBarrierRule(0)}></div>
                        <div className="mx_CreateRoomDialog_joinCondition_content">
                            Balance Check
                        </div>
                    </div>
                    <div className="mx_CreateRoomDialog_joinCondition">
                        <div className={`mx_CreateRoomDialog_radio_button ${this.state.barrierRuleIndex == 1 ? "active" : ""}`} onClick={() => changeBarrierRule(1)}></div>
                        <div className="mx_CreateRoomDialog_joinCondition_content">
                            Pay-to-enter
                        </div>
                    </div>
                </div>
            </div>
        )

        const CryptoBarrierBody = (
            <div className="mx_CreateRoomDialog_option_body">
                <div className="mx_CreateRoomDialog_currency_wrap mt-4">
                    <div className="mx_CreateRoomDialog_Dropdown">
                        <Dropdown
                            id="mx_CryptoBarrierDropdown"
                            onOptionChange={this.onCryptoBarrierSelectChange}
                            searchEnabled={false}
                            value={this.state.cryptoBarrierSelectValue}
                            disabled={isWalletConnected ? false : true}
                            label={"Crypto Dropdown"}>

                            {currencyOptions}
                        </Dropdown>
                    </div>
                    <div className="mx_CreateRoomDialog_AmountInput">
                        <Field
                            onChange={this.onCryptoBarrierAmountChange}
                            value={this.state.cryptoBarrierAmount}
                            disabled={isWalletConnected ? false : true}
                            type="number"
                        />
                    </div>
                </div>
                <div className="mx_CreateRoomDialog_joinConditions mt-4">
                    <div className="mx_CreateRoomDialog_joinCondition">
                        <div className={`mx_CreateRoomDialog_radio_button ${this.state.barrierRuleIndex == 0 ? "active" : ""}`} onClick={() => changeBarrierRule(0)}></div>
                        <div className="mx_CreateRoomDialog_joinCondition_content">
                            Balance Check
                        </div>
                    </div>
                    <div className="mx_CreateRoomDialog_joinCondition">
                        <div className={`mx_CreateRoomDialog_radio_button ${this.state.barrierRuleIndex == 1 ? "active" : ""}`} onClick={() => changeBarrierRule(1)}></div>
                        <div className="mx_CreateRoomDialog_joinCondition_content">
                            Pay-to-enter
                        </div>
                    </div>
                </div>
            </div>
        )

        const DomainBarrierBody = (
            <div className="mx_CreateRoomDialog_option_body mt-4">
                <div className="mx_CreateRoomDialog_option_description">
                    Require users to have crypto specific official domains such as .sol from Bonfida, This may help in the verification of users.
                </div>
                <div className="mx_CreateRoomDialog_joinConditions">
                    <div className="mx_CreateRoomDialog_joinCondition">
                        <div className={`mx_CreateRoomDialog_radio_button active`}></div>
                        <div className="mx_CreateRoomDialog_joinCondition_content">
                            Bonfida .sol domains
                        </div>
                    </div>
                </div>
            </div>
        )

        const nftBarrierLabel = this.state.barrierRuleIndex?
        "Select a Verified NFT from your wallet to only allow users with the select NFT collection to enter your group. Users will be prompted for a wallet check before being allowed to enter."
        :
        "Select a Verified NFT from your wallet if you want to allow anyone to join your group, but give holders of this NFT an option to prove their ownership for more exclusive perks in the future."

        const NftBarrierBody = (
            <div className="mx_CreateRoomDialog_option_body">
                <div className="mx_CreateRoomDialog_option_description">
                    {nftBarrierLabel}
                </div>
                <div className="mx_CreateRoomDialog_option_select_item">
                    <div className={`mx_CreateRoomDialog_option_item ${this.state.NFTBarrierInfo ? "item" : ""}`} onClick={showNftCategoryDialog}>
                        <div className="mx_CreateRoomDialog_option_bg"></div>
                        { !!this.state.NFTBarrierInfo && <img src={this.state.NFTBarrierInfo.img} /> }
                    </div>
                    {
                        !!this.state.NFTBarrierInfo && (
                            <div className="mx_CreateRoomDialog_option_item_info">
                                <div className="mx_CreateRoomDialog_option_item_name">
                                    <p>{this.state.NFTBarrierInfo.name}</p>
                                    <img src={require("../../../../res/img/verify.png")} />
                                </div>
                                <div className="mx_CreateRoomDialog_option_item_content">
                                    Selected Verified NFT Collection.
                                </div>
                            </div>
                        )
                    }
                </div>
                <div className="mx_CreateRoomDialog_joinConditions mt-4">
                    <div className="mx_CreateRoomDialog_joinCondition">
                        <div className={`mx_CreateRoomDialog_radio_button ${this.state.barrierRuleIndex == 0 ? "active" : ""}`} onClick={() => changeBarrierRule(0)}></div>
                        <div className="mx_CreateRoomDialog_joinCondition_content">
                            NFT Optional
                        </div>
                    </div>
                    <div className="mx_CreateRoomDialog_joinCondition">
                        <div className={`mx_CreateRoomDialog_radio_button ${this.state.barrierRuleIndex == 1 ? "active" : ""}`} onClick={() => changeBarrierRule(1)}></div>
                        <div className="mx_CreateRoomDialog_joinCondition_content">
                            NFT Required
                        </div>
                    </div>
                </div>
            </div>
        )

        let pointBarrierField;
        if (this.state.isPointBarrier) {
            pointBarrierField = (
                <>
                    <div className="mx_CreateRoomDialog_wrap">
                        <div className="mx_CreateRoomDialog_option">
                            <div className="mx_CreateRoomDialog_option_header">
                                <div className={`mx_CreateRoomDialog_radio_button ${!this.state.optionIndex ? "active" : ""}`} onClick={() => changeOptionIndex(0)}></div>
                                <div className="mx_CreateRoomDialog_option_content">
                                    Cafeteria Credits
                                </div>
                            </div>
                            { this.state.optionIndex == 0 && CreditBarrierBody }
                        </div>
                    </div>
                    <div className={`mx_CreateRoomDialog_wrap ${isWalletConnected ? "" : "disable"}`}>
                        <div className="mx_CreateRoomDialog_option">
                            <div className="mx_CreateRoomDialog_option_header">
                                <div className={`mx_CreateRoomDialog_radio_button ${this.state.optionIndex == 1 ? "active" : ""}`} onClick={() => changeOptionIndex(1)}></div>
                                <div className="mx_CreateRoomDialog_option_content">
                                    Cryptocurrency
                                </div>
                            </div>
                            { this.state.optionIndex == 1 && CryptoBarrierBody }
                        </div>
                        {/* <div className="mx_CreateRoomDialog_option">
                            <div className="mx_CreateRoomDialog_option_header">
                                <div className={`mx_CreateRoomDialog_radio_button ${this.state.optionIndex == 3 ? "active" : ""}`} onClick={() => changeOptionIndex(3)}></div>
                                <div className="mx_CreateRoomDialog_option_content">
                                    Crypto Domains
                                </div>
                            </div>
                            { this.state.optionIndex == 3 && DomainBarrierBody }
                        </div> */}
                        <div className="mx_CreateRoomDialog_option">
                            <div className="mx_CreateRoomDialog_option_header">
                                <div className={`mx_CreateRoomDialog_radio_button ${this.state.optionIndex == 2 ? "active" : ""}`} onClick={() => changeOptionIndex(2)}></div>
                                <div className="mx_CreateRoomDialog_option_content">
                                    Verified NFT
                                </div>
                            </div>
                            { this.state.optionIndex == 2 && NftBarrierBody}
                        </div>
                        {
                            !isWalletConnected && (
                                <div className="mx_CreateRoomDialog_wallet_connect_button" onClick={clickWalletConnectButton}>
                                    <p>Connect wallet to unlock crypto features.</p>
                                </div>
                            )                                
                        }
                    </div>
                </>
            )
        }

        if (CommunityPrototypeStore.instance.getSelectedCommunityId()) {
            publicPrivateLabel = <p>{_t(
                "Private rooms can be found and joined by invitation only. Public rooms can be " +
                "found and joined by anyone in this community.",
            )}</p>;
        }

        let e2eeSection;
        if (this.state.isPrivate) {
            let microcopy;
            if (privateShouldBeEncrypted()) {
                if (this.state.canChangeEncryption) {
                    microcopy = _t("You can’t disable this later. Bridges & most bots won’t work yet.");
                } else {
                    microcopy = _t("Your server requires encryption to be enabled in private rooms.");
                }
            } else {
                microcopy = _t("Your server admin has disabled end-to-end encryption by default " +
                    "in private rooms & Direct Messages.");
            }
            e2eeSection = <React.Fragment>
                <LabelledToggleSwitch
                    label={_t("Enable end-to-end encryption")}
                    onChange={this.onEncryptedChange}
                    value={this.state.isEncrypted}
                    className='mx_CreateRoomDialog_e2eSwitch' // for end-to-end tests
                    disabled={!this.state.canChangeEncryption}
                />
                <p>{microcopy}</p>
            </React.Fragment>;
        }

        let federateLabel = _t(
            "You might enable this if the room will only be used for collaborating with internal " +
            "teams on your homeserver. This cannot be changed later.",
        );
        if (SdkConfig.get().default_federate === false) {
            // We only change the label if the default setting is different to avoid jarring text changes to the
            // user. They will have read the implications of turning this off/on, so no need to rephrase for them.
            federateLabel = _t(
                "You might disable this if the room will be used for collaborating with external " +
                "teams who have their own homeserver. This cannot be changed later.",
            );
        }
        //need to impement multipul language.
        let title = "Create a Group";
        if (CommunityPrototypeStore.instance.getSelectedCommunityId()) {
            const name = CommunityPrototypeStore.instance.getSelectedCommunityName();
            title = _t("Create a room in %(communityName)s", { communityName: name });
        }

        let value = this.state.categoryValue;
        const categoryOptions = this.state.categories.map((category) => {
            return <div key={category}>
                {category}
            </div>
        });


        const AvatarSetting = sdk.getComponent('settings.AvatarSetting');




        return (
            <BaseDialog className="mx_CreateRoomDialog" onFinished={this.props.onFinished}
                title={title}
            >
                <form onSubmit={this.onOk} onKeyDown={this.onKeyDown}>
                    <ReactModal
                        isOpen={this.state.modalIsOpen}
                        onRequestClose={this.clickCloseModal}
                        contentLabel="Example Modal"
                    >
                        <AdjustableAvatar
                            url={this.state.avatarUrl}
                            clickCloseModal={this.clickCloseModal}
                            setCroppedImage={this.setCroppedImage}
                        />
                    </ReactModal>
                    <div className="mx_Dialog_content">
                        <div className="mx_CreateRoomAvatar_Upload">
                            <input
                                type="file"
                                className="mx_ProfileSettings_avatarUpload"
                                onChange={this._onAvatarChanged}
                                accept="image/*"
                                ref={this.avatarUpload}
                            />
                            <AvatarSetting
                                avatarUrl={this.state.croppedImage ? this.state.croppedImage : this.state.avatarUrl}
                                avatarAltText={_t("Room avatar")}
                                uploadAvatar={this._uploadAvatar}
                                removeAvatar={this._removeAvatar}
                                clickAdjustableButton={this.setAdjustableAvatar}
                            />
                            <AvatarChangeContent
                                uploadAvatar={this._uploadAvatar}
                                wallets={this.props.wallets}
                                adjustableNftAvatar={this.adjustableNftAvatar}
                            />
                        </div>
                        <div className="mx_Dialog_item">
                            <div className="mx_Dialog_item_logo"></div>
                            <div className="mx_Dialog_item_body">
                                <div className="mx_Dialog_item_title dark">
                                    Group Info
                                </div>
                                <Field
                                    ref={this.nameField}
                                    label={"Group Name"}
                                    onChange={this.onNameChange}
                                    onValidate={this.onNameValidate}
                                    value={this.state.name}
                                    className="mx_CreateRoomDialog_name mt-4"
                                    placeholder="(e.g. Ted's group)"
                                    maxLength={30}
                                />
                                <Field
                                    label={'Group Bio (Optional)'}
                                    onChange={this.onTopicChange}
                                    value={this.state.topic}
                                    className="mx_CreateRoomDialog_topic mt-4"
                                    maxLength={200}
                                />
                                {/* <div className="mx_CreateRoomDialog_aliasContainer mt-4">
                                    <RoomAliasField
                                        ref={this.aliasField}
                                        onChange={this.onAliasChange}
                                        domain={domain}
                                        value={this.state.alias}
                                    />
                                </div> */}
                            </div>
                        </div>
                        <div className="mx_Dialog_item">
                            <div className="mx_Dialog_item_logo">
                                <img src={require("../../../../res/img/category-hashtag-bubble.png")}/>
                            </div>
                            <div className="mx_Dialog_item_body d-flex justify-content-between align-items-center">
                                <div className="mx_Dialog_item_title">Category</div>
                                <Dropdown
                                    id="mx_CategoryDropdown"
                                    onOptionChange={this.onCategoryChange}
                                    searchEnabled={false}
                                    value={value}
                                    label={"Category Dropdown"}
                                    className={`mx_CategoryDropdown ${this.state.isEmptyCategory? "empty" : ""}`}
                                >
                                    {categoryOptions}
                                </Dropdown>
                            </div>
                        </div>

                        {/* <div className="mx_Dialog_item">
                            <div className="mx_Dialog_item_logo">
                                <img src={require("../../../../res/img/private-group+password+encrypted-messages.png")}/>
                            </div>
                            <div className="mx_Dialog_item_body">
                                <LabelledToggleSwitch
                                    label={this.state.isPrivate ? _t("Switch Group to Public") : _t("Switch Group to Private")}
                                    onChange={this.onPrivateChange}
                                    value={this.state.isPrivate}
                                />       */}
                                    {/* {publicPrivateLabel} */}
                                    {/* { e2eeSection } */}
                                    {/* {aliasField}        
                            </div>
                        </div> */}

                        <div className="mx_Dialog_item">
                            <div className="mx_Dialog_item_logo">
                                <img src={require("../../../../res/img/group-barrier.png")}/>
                            </div>
                            <div className="mx_Dialog_item_body">
                                <LabelledToggleSwitch
                                    label={"Set Group Barrier"}
                                    onChange={this.onPointBarrierChange}
                                    value={this.state.isPointBarrier}
                                />
                                {/* {pointBarrierLabel} */}
                                {pointBarrierField}
                            </div>
                        </div>

                        {/* <div className="mx_Dialog_item">
                            <div className="mx_Dialog_item_logo">
                                <img src={require("../../../../res/img/group-barrier.png")}/>
                            </div>
                            <div className="mx_Dialog_item_body">
                                <LabelledToggleSwitch
                                    label={"Set Crypto or NFT Barrier"}
                                    onChange={this.onCryptoNFTBarrierChange}
                                    value={this.state.isCryptoNFTBarrier}
                                />
                                {cryptoNFTBarrierLabel}
                                {cryptoNFTBarrierField}
                            </div>
                        </div> */}
                    </div>
                </form>
                <div className="mx_CreateRoomButton">
                    <AccessibleButton className="w-100 common-btn bg-green py-2" onClick={this.onOk}>{_t('Create')}</AccessibleButton>
                </div>
                {
                    this.state.isWaitingNftAvatar
                        ?
                        <LoadingScreen label='Loading NFT Avatar...' loadingLottie={loadingLottie} />
                        :
                        this.state.isRoomCreating
                        ?
                        <LoadingScreen label='Creating Room...' loadingLottie={loadingLottie} />
                        :
                        false
                }
            </BaseDialog>
        );
    }
}
