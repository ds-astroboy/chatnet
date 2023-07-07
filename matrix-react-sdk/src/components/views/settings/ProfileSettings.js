/*
Copyright 2019 New Vector Ltd

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

import React, { createRef } from 'react';
import { _t } from "../../../languageHandler";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import Field from "../elements/Field";
import { getHostingLink } from '../../../utils/HostingLink';
import * as sdk from "../../../index";
import { OwnProfileStore } from "../../../stores/OwnProfileStore";
import Modal from "../../../Modal";
import ErrorDialog from "../dialogs/ErrorDialog";
import { replaceableComponent } from "../../../utils/replaceableComponent";
import { mediaFromMxc } from "../../../customisations/Media";
import AdjustableAvatar from './AdjustableAvatar';
import ReactModal from 'react-modal';
import AvatarChangeContent from './AvatarChangeContent';
import axios from 'axios';
import LoadingScreen from '../rooms/LoadingScreen';
import loadingLottie from "../../../../res/img/cafeteria-loading-regular.json";
import { trimString, trimUserId } from "../../../hooks/trimString";
import dis from "../../../dispatcher/dispatcher";
import { getUserIdByUserName, putDomainNameFlag, putNftAvatarFlag } from '../../../apis';
const reduce = require('image-blob-reduce')();

@replaceableComponent("views.settings.ProfileSettings")
export default class ProfileSettings extends React.Component {
    constructor() {
        super();

        let avatarUrl = OwnProfileStore.instance.avatarMxc;
        if (avatarUrl) avatarUrl = mediaFromMxc(avatarUrl).getThumbnailOfSourceHttp(200, 200, "scale");
        this.state = {
            userId: "",
            originalDisplayName: trimString(OwnProfileStore.instance.displayName),
            displayName: trimString(OwnProfileStore.instance.displayName),
            originalAvatarUrl: avatarUrl,
            avatarUrl: avatarUrl,
            avatarFile: null,
            enableProfileSave: false,
            modalIsOpen: false,
            croppedImage: "",
            isWaitingNftAvatar: false,
            isWaitingSavingAvatar: false,
            isNft: false
        };

        this._avatarUpload = createRef();
    }

    componentDidMount() {
        const userData = JSON.parse(window.localStorage.getItem("mx_userData"));
        ;(async() => {
            let { success, userId } = await getUserIdByUserName(userData.username);
            if(success) {
                userId = `@${userId}`;
                this.setState({userId})
            }
        })();
    }

    _uploadAvatar = () => {
        this._avatarUpload.current.click();
    };

    _removeAvatar = () => {
        // clear file upload field so same file can be selected
        this._avatarUpload.current.value = "";
        this.setState({
            avatarUrl: null,
            avatarFile: null,
            enableProfileSave: true,
            croppedImage: null
        });
    };

    _cancelProfileChanges = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (!this.state.enableProfileSave) return;
        this.setState({
            enableProfileSave: false,
            displayName: this.state.originalDisplayName,
            avatarUrl: this.state.originalAvatarUrl,
            avatarFile: null,
        });
    };

    _saveProfile = async (e) => {
        e?.stopPropagation();
        e?.preventDefault();

        if (!this.state.enableProfileSave) return;
        this.setState({ enableProfileSave: false });

        const client = MatrixClientPeg.get();
        const accessToken = client.getAccessToken();
        const newState = {};

        const displayName = this.state.displayName.trim();
        try {
            if (this.state.originalDisplayName !== this.state.displayName) {
                await client.setDisplayName(displayName);
                await putDomainNameFlag(false, accessToken);
                newState.originalDisplayName = displayName;
                newState.displayName = displayName;
            }

            if (this.state.avatarFile) {
                this.setState({isWaitingSavingAvatar: true});
                console.log(
                    `Uploading new avatar, ${this.state.avatarFile.name} of type ${this.state.avatarFile.type},` +
                    ` (${this.state.avatarFile.size}) bytes`);
                const uri = await client.uploadContent(this.state.avatarFile);
                await client.setAvatarUrl(uri);
                await putNftAvatarFlag(this.state.isNft, accessToken);
                newState.avatarUrl = mediaFromMxc(uri).getThumbnailOfSourceHttp(200, 200, "scale");
                newState.originalAvatarUrl = newState.avatarUrl;
                newState.avatarFile = null;
                this.setState({isWaitingSavingAvatar: false});
            } else if (this.state.originalAvatarUrl !== this.state.avatarUrl) {
                await client.setAvatarUrl(""); // use empty string as Synapse 500s on undefined
            }
        } catch (err) {
            console.log("Failed to save profile", err);
            Modal.createTrackedDialog('Failed to save profile', '', ErrorDialog, {
                title: _t("Failed to save your profile"),
                description: ((err && err.message) ? err.message : _t("The operation could not be completed")),
            });
        }

        this.setState(newState);
    };

    _onDisplayNameChanged = (e) => {
        this.setState({
            displayName: e.target.value,
            enableProfileSave: true,
        });
    };

    _onAvatarChanged = (e) => {
        console.log("Avatar Changed");
        if(this.state.isNft) {
            this.setState({isNft: false});
        }
        if (!e.target.files || !e.target.files.length) {
            this.setState({
                avatarUrl: this.state.originalAvatarUrl,
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
            this.setAdjustableAvatar();
        };
        reader.readAsDataURL(file);        
    };
    clickCloseModal = () => {
        this.setState({modalIsOpen: false});
    }

    setCroppedImage = (croppedImage, ImgDate) => {
        this.setState({
            croppedImage,
            enableProfileSave: true,
            avatarFile: ImgDate
        }, () => {
            this._saveProfile();
        })
    }

    setAdjustableAvatar = () => {
        this.setState({modalIsOpen: true})
    }

    adjustableNftAvatar = async(img_url) => {
        this.setState({isWaitingNftAvatar: true})
        const config = { responseType: 'blob' };
        await axios.get(img_url, config).then(response => {
            this.setState({
                avatarUrl: img_url,
                avatarFile: response.data,
                enableProfileSave: true
            }, async() => {
                if(response.data.size > 10**7) {
                    await reduce
                    .toBlob(response.data, { max: 1000 })
                    .then(blob => { 
                        console.log("====", blob);
                        this.setState({avatarFile: blob});
                    });
                }
                this.setState({
                    isWaitingNftAvatar: false,
                    isNft: true
                })
                this._saveProfile();
            }) 
        })
        .catch((e) => {
            console.warn(e);
            this.setState({isWaitingNftAvatar: false})
        }) ;
    }

    saveDomainName = async(domainName) => {
        this.setState({ enableProfileSave: false });
        const client = MatrixClientPeg.get();
        const accessToken = client.getAccessToken();
        const newState = {};
        const displayName = domainName.trim();
        try {
            if (this.state.originalDisplayName !== displayName) {
                await client.setDisplayName(displayName);
                await putDomainNameFlag(true, accessToken);
                newState.originalDisplayName = displayName;
                newState.displayName = displayName;
            }
        } catch (err) {
            console.log("Failed to save profile", err);
            Modal.createTrackedDialog('Failed to save profile', '', ErrorDialog, {
                title: _t("Failed to save your profile"),
                description: ((err && err.message) ? err.message : _t("The operation could not be completed")),
            });
        }
        this.setState(newState);
    }
    
    showDomainNameDialog = () => {
        dis.dispatch({
            action: "show_domain_category_dialog",
            wallets: this.props.wallets,
            saveDomainName: this.saveDomainName
        })
    }

    render() {
        const hostingSignupLink = getHostingLink('user-settings');
        let hostingSignup = null;
        if (hostingSignupLink) {
            hostingSignup = <span className="mx_ProfileSettings_hostingSignup">
                { _t(
                    "<a>Upgrade</a> to your own domain", {},
                    {
                        a: sub => <a href={hostingSignupLink} target="_blank" rel="noreferrer noopener">{ sub }</a>,
                    },
                ) }
                <a href={hostingSignupLink} target="_blank" rel="noreferrer noopener">
                    <img src={require("../../../../res/img/external-link.svg")} width="11" height="10" alt='' />
                </a>
            </span>;
        }

        const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
        const AvatarSetting = sdk.getComponent('settings.AvatarSetting');

        const matrixUserId = MatrixClientPeg.get().getUserId();
        return (
            <form
                onSubmit={this._saveProfile}
                autoComplete="off"
                noValidate={true}
                className="mx_ProfileSettings_profileForm"
            >
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
                <input
                    type="file"
                    ref={this._avatarUpload} className="mx_ProfileSettings_avatarUpload"
                    onChange={this._onAvatarChanged}
                    accept="image/*"
                />
                <div className="mx_ProfileSettings_profile">    
                    <div className='mx_ProfileSettings_avatar_section'>
                        {/* <NftAvatarCheckContainer userId={matrixUserId}> */}
                            <AvatarSetting
                                avatarUrl={this.state.croppedImage ? this.state.croppedImage: this.state.avatarUrl}
                                avatarName={this.state.displayName || this.state.userId}
                                avatarAltText={_t("Profile picture")}
                                uploadAvatar={this._uploadAvatar}
                                removeAvatar={this._removeAvatar}
                                clickAdjustableButton={this.setAdjustableAvatar} 
                            />
                        {/* </NftAvatarCheckContainer> */}
                        <AvatarChangeContent 
                            uploadAvatar={this._uploadAvatar} 
                            wallets={this.props.wallets} 
                            adjustableNftAvatar= {this.adjustableNftAvatar}
                        />                        
                    </div>
                    <div className='mx_ProfileSettings_displayName_section d-flex align-items-start justify-content-center'>
                        <div className='mx_ProfileSettings_displayName_logo image-fill'>
                            <img src={require("../../../../res/img/display-name.png")}/>
                        </div>
                        <div className="mx_ProfileSettings_controls mt-2">
                            <span className="mx_SettingsTab_subheading">{ "Display Name" }</span>
                            <div className='position-relative mt-4'>
                                <Field
                                    label={_t("Display Name")}
                                    type="text" value={this.state.displayName}
                                    autoComplete="off"
                                    onChange={this._onDisplayNameChanged}
                                />
                                <div className='mx_ProfileSettings_Domain_Name_Content mt-4'>
                                    Or select a <span onClick={this.showDomainNameDialog}>domain(.sol or .eth) name</span> from your wallet
                                    {/* Or select a <span onClick={this.showDomainNameDialog}>Bonfida domain name</span> from your wallet */}
                                </div>
                                <p>
                                    { this.state.userId }
                                    { hostingSignup }
                                </p>
                            </div>
                            <div className="mx_ProfileSettings_buttons d-flex align-items-center mt-4">
                                <AccessibleButton
                                    onClick={this._cancelProfileChanges}
                                    kind="link"
                                    disabled={!this.state.enableProfileSave}
                                    className="common-btn small-shadow px-4 py-0"
                                >
                                    { _t("Cancel") }
                                </AccessibleButton>
                                <AccessibleButton
                                    onClick={this._saveProfile}
                                    kind="primary"
                                    disabled={!this.state.enableProfileSave}
                                    className="common-btn bg-green small-shadow px-4 py-0 mx-4"
                                >
                                    { _t("Save") }
                                </AccessibleButton>
                            </div>
                        </div>
                    </div>                
                </div>
                {
                    this.state.isWaitingNftAvatar?
                    <LoadingScreen label='Loading NFT Avatar...' loadingLottie={loadingLottie}/>
                    :
                    this.state.isWaitingSavingAvatar?
                    <LoadingScreen label='Saving New Avatar...' loadingLottie={loadingLottie}/>
                    :
                    false
                }
            </form>
        );
    }
}
