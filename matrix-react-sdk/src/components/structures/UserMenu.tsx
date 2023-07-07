/*
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

import React, { createRef, FC } from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import classNames from "classnames";
import * as fbEmitter from "fbemitter";

import { MatrixClientPeg } from "../../MatrixClientPeg";
import defaultDispatcher from "../../dispatcher/dispatcher";
import dis from "../../dispatcher/dispatcher";
import { ActionPayload } from "../../dispatcher/payloads";
import { Action } from "../../dispatcher/actions";
import { _t } from "../../languageHandler";
import { ContextMenuButton } from "./ContextMenu";
import { UserTab } from "../views/dialogs/UserSettingsDialog";
import { OpenToTabPayload } from "../../dispatcher/payloads/OpenToTabPayload";
import FeedbackDialog from "../views/dialogs/FeedbackDialog";
import Modal from "../../Modal";
import SettingsStore from "../../settings/SettingsStore";
import { getCustomTheme } from "../../theme";
import AccessibleButton, { ButtonEvent } from "../views/elements/AccessibleButton";
import SdkConfig from "../../SdkConfig";
import { getHomePageUrl } from "../../utils/pages";
import { OwnProfileStore } from "../../stores/OwnProfileStore";
import { UPDATE_EVENT } from "../../stores/AsyncStore";
import BaseAvatar from '../views/avatars/BaseAvatar';
import { SettingLevel } from "../../settings/SettingLevel";
import IconizedContextMenu, {
    IconizedContextMenuOption,
    IconizedContextMenuOptionList,
} from "../views/context_menus/IconizedContextMenu";
import { CommunityPrototypeStore } from "../../stores/CommunityPrototypeStore";
import GroupFilterOrderStore from "../../stores/GroupFilterOrderStore";
import { showCommunityInviteDialog } from "../../RoomInvite";
import { RightPanelPhases } from "../../stores/RightPanelStorePhases";
import ErrorDialog from "../views/dialogs/ErrorDialog";
import EditCommunityPrototypeDialog from "../views/dialogs/EditCommunityPrototypeDialog";
import { UIFeature } from "../../settings/UIFeature";
import HostSignupAction from "./HostSignupAction";
import { IHostSignupConfig } from "../views/dialogs/HostSignupDialogTypes";
import SpaceStore, { UPDATE_SELECTED_SPACE } from "../../stores/SpaceStore";
import RoomName from "../views/elements/RoomName";
import { replaceableComponent } from "../../utils/replaceableComponent";
import InlineSpinner from "../views/elements/InlineSpinner";
import TooltipButton from "../views/elements/TooltipButton";
import ConnectButton from "./ConnectButton";
import { trimCreditsAmount, trimString } from "../../hooks/trimString";
import { getUserPoints } from "../../apis";
import CustomStatus from "./CustomStatus";
import Lottie from "lottie-react";
import nightLottie from "../../../res/img/lottie/night-animation.json"
import { checkVerifiedUserOrRoom } from "../../hooks/commonFuncs";
import BaseDialog from "../views/dialogs/BaseDialog";
import WalletCategoryDialog from "../views/dialogs/WalletCategoryDialog";
import WalletControlDialog from "../views/dialogs/WalletControlDialog";
import NftAvatarCheckContainer from "./NftAvatarCheckContainer";
import DomainNameCheckContainer from "./DomainNameCheckContainer";
import VerifiedCheckContainer from "./VerifiedCheckContainer";
import { connect } from "react-redux";
import { MenuItem } from "../structures/ContextMenu";
import Dropdown from "../views/elements/Dropdown";


interface IProps {
    isMinimized: boolean;
    showWalletButton?: boolean;
    alert?: any;
    wallets?: any;
}

type PartialDOMRect = Pick<DOMRect, "width" | "left" | "top" | "height">;

interface IState {
    contextMenuPosition: PartialDOMRect;
    isDarkTheme: boolean;
    selectedSpace?: Room;
    pendingRoomJoin: Set<string>;
    userPoints: number;
    userStatus: string;
    ethereumWalletsModalShow: boolean;
}

@replaceableComponent("structures.UserMenu")
class UserMenu extends React.Component<IProps, IState> {
    private dispatcherRef: string;
    private themeWatcherRef: string;
    private dndWatcherRef: string;
    private buttonRef: React.RefObject<HTMLButtonElement> = createRef();
    private tagStoreRef: fbEmitter.EventSubscription;

    constructor(props: IProps) {
        super(props);

        this.state = {
            contextMenuPosition: null,
            isDarkTheme: this.isUserOnDarkTheme(),
            pendingRoomJoin: new Set<string>(),
            userPoints: 0,
            userStatus: "",
            ethereumWalletsModalShow: false,
        };

        OwnProfileStore.instance.on(UPDATE_EVENT, this.onProfileUpdate);
        if (SpaceStore.spacesEnabled) {
            SpaceStore.instance.on(UPDATE_SELECTED_SPACE, this.onSelectedSpaceUpdate);
        }

        // Force update is the easiest way to trigger the UI update (we don't store state for this)
        this.dndWatcherRef = SettingsStore.watchSetting("doNotDisturb", null, () => this.forceUpdate());
        this.handleEthereumWalletsModal = this.handleEthereumWalletsModal.bind(this);
    }

    private get hasHomePage(): boolean {
        return !!getHomePageUrl(SdkConfig.get());
    }

    public componentDidMount() {
        this.dispatcherRef = defaultDispatcher.register(this.onAction);
        this.themeWatcherRef = SettingsStore.watchSetting("theme", null, this.onThemeChanged);
        this.tagStoreRef = GroupFilterOrderStore.addListener(this.onTagStoreUpdate);
        if(MatrixClientPeg.get()) {        
            MatrixClientPeg.get().on("Room", this.onRoom);            
            this.getPoints();
        }
    }

    // shouldComponentUpdate(nextProps: Readonly<IProps>, nextState: Readonly<IState>, nextContext: any): boolean {
    //     return true;
    // }

    private getPoints = async () => {
        const accessToken = MatrixClientPeg.get().getAccessToken();
        const userId = MatrixClientPeg.get().getUserId();
        let userPoints = await getUserPoints(accessToken, userId);
        this.setState({userPoints});
    }
    public componentWillUnmount() {
        if (this.themeWatcherRef) SettingsStore.unwatchSetting(this.themeWatcherRef);
        if (this.dndWatcherRef) SettingsStore.unwatchSetting(this.dndWatcherRef);
        if (this.dispatcherRef) defaultDispatcher.unregister(this.dispatcherRef);
        OwnProfileStore.instance.off(UPDATE_EVENT, this.onProfileUpdate);
        this.tagStoreRef.remove();
        if (SpaceStore.spacesEnabled) {
            SpaceStore.instance.off(UPDATE_SELECTED_SPACE, this.onSelectedSpaceUpdate);
        }
        if(MatrixClientPeg.get()) {  
            MatrixClientPeg.get().removeListener("Room", this.onRoom);
        }
    }

    private onRoom = (room: Room): void => {
        this.removePendingJoinRoom(room.roomId);
    };

    private onTagStoreUpdate = () => {
        this.forceUpdate(); // we don't have anything useful in state to update
    };

    private isUserOnDarkTheme(): boolean {
        if (SettingsStore.getValue("use_system_theme")) {
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        } else {
            const theme = SettingsStore.getValue("theme");
            if (theme.startsWith("custom-")) {
                return getCustomTheme(theme.substring("custom-".length)).is_dark;
            }
            return theme === "dark";
        }
    }

    private onProfileUpdate = async () => {
        // the store triggered an update, so force a layout update. We don't
        // have any state to store here for that to magically happen.
        this.forceUpdate();
    };

    private onSelectedSpaceUpdate = async (selectedSpace?: Room) => {
        this.setState({ selectedSpace });
    };

    private onThemeChanged = () => {
        this.setState({ isDarkTheme: this.isUserOnDarkTheme() });
    };

    private onAction = (ev: ActionPayload) => {
        switch (ev.action) {
            case Action.ToggleUserMenu:
                if (this.state.contextMenuPosition) {
                    this.setState({ contextMenuPosition: null });
                } else {
                    if (this.buttonRef.current) this.buttonRef.current.click();
                }
                break;
            case Action.JoinRoom:
                this.addPendingJoinRoom(ev.roomId);
                break;
            case Action.JoinRoomReady:
            case Action.JoinRoomError:
                this.removePendingJoinRoom(ev.roomId);
                break;
        }
    };

    private addPendingJoinRoom(roomId: string): void {
        this.setState({
            pendingRoomJoin: new Set<string>(this.state.pendingRoomJoin)
                .add(roomId),
        });
    }

    private removePendingJoinRoom(roomId: string): void {
        if (this.state.pendingRoomJoin.delete(roomId)) {
            this.setState({
                pendingRoomJoin: new Set<string>(this.state.pendingRoomJoin),
            });
        }
    }

    private onOpenMenuClick = (ev: React.MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        const target = ev.target as HTMLButtonElement;
        this.getPoints();
        this.setState({ contextMenuPosition: target.getBoundingClientRect() }); // getBoundingClientRect(): get width, height, position(T,B,R,L) of DOM Element
    };

    private onContextMenu = (ev: React.MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.setState({
            contextMenuPosition: {
                left: ev.clientX,
                top: ev.clientY,
                width: 20,
                height: 0,
            },
        });
    };

    private onCloseMenu = () => {
        this.setState({ contextMenuPosition: null });
    };

    private onSwitchThemeClick = (ev: React.MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();

        // Disable system theme matching if the user hits this button
        SettingsStore.setValue("use_system_theme", null, SettingLevel.DEVICE, false);

        const newTheme = this.state.isDarkTheme ? "light" : "dark";
        SettingsStore.setValue("theme", null, SettingLevel.DEVICE, newTheme); // set at same level as Appearance tab
    };

    private onSettingsOpen = (ev: ButtonEvent, tabId: string) => {
        ev.preventDefault();
        ev.stopPropagation();

        const payload: OpenToTabPayload = { action: Action.ViewUserSettings, initialTabId: tabId, wallets: this.props.wallets};
        defaultDispatcher.dispatch(payload);
        this.setState({ contextMenuPosition: null }); // also close the menu
    };

    private onTransactionOpen = (ev: ButtonEvent, tabId: string) => {
        ev.preventDefault();
        ev.stopPropagation();

        const payload: OpenToTabPayload = { action: Action.ViewTransactions, initialTabId: tabId };
        defaultDispatcher.dispatch(payload);
        this.setState({ contextMenuPosition: null }); // also close the menu
    };

    private onShowArchived = (ev: ButtonEvent) => {
        ev.preventDefault();
        ev.stopPropagation();

        // TODO: Archived room view: https://github.com/vector-im/element-web/issues/14038
        // Note: You'll need to uncomment the button too.
        console.log("TODO: Show archived rooms");
    };

    private onProvideFeedback = (ev: ButtonEvent) => {
        ev.preventDefault();
        ev.stopPropagation();

        Modal.createTrackedDialog('Feedback Dialog', '', FeedbackDialog, { alert: this.props.alert });
        this.setState({ contextMenuPosition: null }); // also close the menu
    };

    private onSignOutClick = async (ev: ButtonEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        document.getElementById('wallet-disconnect-button').click();
        const cli = MatrixClientPeg.get();

        dis.dispatch({ action: 'logout' });

        this.setState({ contextMenuPosition: null }); // also close the menu
    };

    private onSignInClick = () => {
        dis.dispatch({ action: 'start_login' });
        this.setState({ contextMenuPosition: null }); // also close the menu
    };

    private onRegisterClick = () => {
        dis.dispatch({ action: 'start_registration' });
        this.setState({ contextMenuPosition: null }); // also close the menu
    };

    private onHomeClick = (ev: ButtonEvent) => {
        ev.preventDefault();
        ev.stopPropagation();

        defaultDispatcher.dispatch({ action: 'view_home_page' });
        this.setState({ contextMenuPosition: null }); // also close the menu
    };

    private onCommunitySettingsClick = (ev: ButtonEvent) => {
        ev.preventDefault();
        ev.stopPropagation();

        Modal.createTrackedDialog('Edit Community', '', EditCommunityPrototypeDialog, {
            communityId: CommunityPrototypeStore.instance.getSelectedCommunityId(),
        });
        this.setState({ contextMenuPosition: null }); // also close the menu
    };

    private onCommunityMembersClick = (ev: ButtonEvent) => {
        ev.preventDefault();
        ev.stopPropagation();

        // We'd ideally just pop open a right panel with the member list, but the current
        // way the right panel is structured makes this exceedingly difficult. Instead, we'll
        // switch to the general room and open the member list there as it should be in sync
        // anyways.
        const chat = CommunityPrototypeStore.instance.getSelectedCommunityGeneralChat();
        if (chat) {
            dis.dispatch({
                action: 'view_room',
                room_id: chat.roomId,
            }, true);
            dis.dispatch({ action: Action.SetRightPanelPhase, phase: RightPanelPhases.RoomMemberList });
        } else {
            // "This should never happen" clauses go here for the prototype.
            Modal.createTrackedDialog('Failed to find general chat', '', ErrorDialog, {
                title: _t('Failed to find the general chat for this community'),
                description: _t("Failed to find the general chat for this community"),
            });
        }
        this.setState({ contextMenuPosition: null }); // also close the menu
    };

    private onCommunityInviteClick = (ev: ButtonEvent) => {
        ev.preventDefault();
        ev.stopPropagation();

        showCommunityInviteDialog(CommunityPrototypeStore.instance.getSelectedCommunityId());
        this.setState({ contextMenuPosition: null }); // also close the menu
    };

    private onDndToggle = (ev) => {
        ev.stopPropagation();
        const current = SettingsStore.getValue("doNotDisturb");
        SettingsStore.setValue("doNotDisturb", null, SettingLevel.DEVICE, !current);
    };

    private handleEthereumWalletsModal = (value: boolean) => {
        this.setState({ethereumWalletsModalShow: value});
    }

    private clickWalletAddButton = () => {
        Modal.createTrackedDialog(
          "Wallet Dialog",
          "",
          WalletCategoryDialog,
          {
            handleEthereumWalletsModal: this.handleEthereumWalletsModal,
            wallets: this.props.wallets
          },
          null,
          false,
          true
        )
    }

    private controlWallet = (wallet) => {
        Modal.createTrackedDialog(
            "Wallet Control Dialog",
            "",
            WalletControlDialog,
            {
                wallet,
                alert: this.props.alert
            }
        )
      }

    private getWalletDropdownOptions = (): React.ReactNode[] => {
        console.log("Connect wallet in UserMenu");
        let options = [];
        let walletButtonLabel = _t("Connect Wallet");
        console.log("UserMenu/Wallets = ", this.props.wallets);
        if(this.props.wallets?.length) {
        if(this.props.wallets?.length === 1) {
            walletButtonLabel = `${this.props.wallets?.length} wallet connected`
            
        }
        else {
            walletButtonLabel = `${this.props.wallets?.length} wallets connected`
        }
        }
        const connectStatus = (
        <div className="mx_UserMenu_walletButton_dropdown_option" key="connected-wallets">
            <span className={classNames("mx_IconizedContextMenu_icon", "mx_UserMenu_walletConnect_button")} />
            <span className="mx_IconizedContextMenu_label">{ walletButtonLabel }</span>
        </div>
        );
        options.push(connectStatus);
        this.props.wallets?.forEach((wallet, index) => {
        let temp;
        if (wallet?.account?.publicKey?.toString()) temp = wallet?.account?.publicKey?.toString();
        else temp = wallet?.account || wallet?.publicKey?.toBase58();
        const trimPK = trimString(temp);
        let logoUrl;
        if(wallet?.wallet?.icon) {
            logoUrl = wallet?.wallet?.icon;
        }
        else {
            logoUrl = require(`../../../res/img/wallets/metamask.svg`);
        }
        let option = (
            <div className="mx_UserMenu_walletButton_dropdown_option mx_Wallet_Info" key={index} onClick={() => {
                console.log("I am confused!!!!!");
                this.controlWallet(wallet);
                }}>
            <div className="mx_Wallet_logo">
                <img src={logoUrl}/>
            </div>
            <div>
                <div className="mx_Wallet_PK">{trimPK}</div>
                <div className="mx_Wallet_Name">
                <div className="mx_Wallet_State"></div>
                <div>{wallet.type}</div>
                </div>
            </div>
            </div>
        )
        options.push(option)
        })

        let addOption = (
        <div className="mx_UserMenu_walletButton_dropdown_option add-option" key="add-option" onClick={this.clickWalletAddButton}>
            <div className="add-icon"></div>
            <div>Add Wallet</div>
        </div>
        )
        options.push(addOption);
        return options
    }

    private renderContextMenu = (): React.ReactNode => {
        if (!this.state.contextMenuPosition) return null;
        if (!MatrixClientPeg.get()) return null
        let userPoints = trimCreditsAmount(this.state.userPoints);

        const prototypeCommunityName = CommunityPrototypeStore.instance.getSelectedCommunityName();

        let topSection;
        const hostSignupConfig: IHostSignupConfig = SdkConfig.get().hostSignup;
        if (MatrixClientPeg.get()) {
            if (MatrixClientPeg.get().isGuest()) {
                topSection = (
                    <div className="mx_UserMenu_contextMenu_header mx_UserMenu_contextMenu_guestPrompts">
                        {_t("Got an account? <a>Sign in</a>", {}, {
                            a: sub => (
                                <AccessibleButton kind="link" onClick={this.onSignInClick}>
                                    {sub}
                                </AccessibleButton>
                            ),
                        })}
                        {_t("New here? <a>Create an account</a>", {}, {
                            a: sub => (
                                <AccessibleButton kind="link" onClick={this.onRegisterClick}>
                                    {sub}
                                </AccessibleButton>
                            ),
                        })}
                    </div>
                );
            } else if (hostSignupConfig) {
                if (hostSignupConfig && hostSignupConfig.url) {
                    // If hostSignup.domains is set to a non-empty array, only show
                    // dialog if the user is on the domain or a subdomain.
                    const hostSignupDomains = hostSignupConfig.domains || [];
                    const mxDomain = MatrixClientPeg.get().getDomain();
                    const validDomains = hostSignupDomains.filter(d => (d === mxDomain || mxDomain.endsWith(`.${d}`)));
                    if (!hostSignupConfig.domains || validDomains.length > 0) {
                        topSection = <HostSignupAction onClick={this.onCloseMenu} />;
                    }
                }
            }
        }

        let homeButton = null;
        if (this.hasHomePage) {
            homeButton = (
                <IconizedContextMenuOption
                    iconClassName="mx_UserMenu_iconHome"
                    label={_t("Home")}
                    onClick={this.onHomeClick}
                />
            );
        }

        let feedbackButton;
        if (SettingsStore.getValue(UIFeature.Feedback)) {
            feedbackButton = <IconizedContextMenuOption
                className="mx_UserMenu_Feedback"
                iconClassName="mx_UserMenu_iconFeedback"
                label={_t("Feedback")}
                onClick={this.onProvideFeedback}
            />;
        }

        let rewardButton = <IconizedContextMenuOption
            className="mx_UserMenu_Reward"
            iconClassName="mx_UserMenu_iconReward"
            label={"Rewards"}
            onClick={(e) => this.onSettingsOpen(e, UserTab.Rewards)}
        />;

        let displayName = OwnProfileStore.instance.displayName;
        displayName = trimString(displayName);
        const displayNameClassName = classNames("mx_UserMenu_contextMenu_displayName")
        let userId = MatrixClientPeg.get()?.getUserId();
        const isVerified = checkVerifiedUserOrRoom(userId, displayName);
        // let verifiedBadge;
        // if(isVerified) {
        //     verifiedBadge = (
        //         <div className="mx_User_verified"></div>
        //     )
        // }
        let primaryHeader = (
            <div className="mx_UserMenu_contextMenu_Info">
                <div className="mx_UserMenu_contextMenu_name">
                    <VerifiedCheckContainer isUser={true} className={displayNameClassName} id={userId}>
                        <span>
                            { displayName }
                        </span>
                        {/* { verifiedBadge } */}
                    </VerifiedCheckContainer>
                </div>
                <div className="mx_UserMenu_contextMenu_point">
                    <div className="mx_UserMenu_contextMenu_point_logo">
                        <img src={require("../../../res/img/cafeteria-point.png")} />
                    </div>
                    <div className="mx_UserMenu_contextMenu_point_amount">
                        {userPoints}
                    </div>
                </div>
            </div>
        );

        let userCustomStatus = (
            <CustomStatus/>
        )

        let lottie = (
            <Lottie animationData={nightLottie} loop={false} className="mx_UserMenu_contextMenu_header_lottie"/>
        )

        const walletsDropdownOptions = this.getWalletDropdownOptions();

        let showWalletButton;
        let connectButton;
        if (this.props.showWalletButton) {
            showWalletButton = (
                <MenuItem
                    role="menuitem" tabIndex={-1}
                    className="mx_UserMenu_walletmenu_item"
                    onClick={null}
                >
                    <Dropdown
                        id="mx_WalletsDropdown"
                        className="mx_UserMenu_walletButton_dropdown"
                        onOptionChange={(option) => {return;}}
                        searchEnabled={false}
                        value={"connected-wallets"}
                        label={"Credits Dropdown"}
                    >
                        {walletsDropdownOptions}
                    </Dropdown>
                
                </MenuItem>
            )
            connectButton = (
                <div className="mx_UserMenu_walletConnect_Container">
                    <ConnectButton ethereumWalletsModalShow={this.state.ethereumWalletsModalShow} handleEthereumWalletsModal={this.handleEthereumWalletsModal}/>
                </div>
            )
        }
        let primaryOptionList = (
            <React.Fragment>
                <IconizedContextMenuOptionList>
                    {homeButton}
                    <IconizedContextMenuOption
                        iconClassName="mx_UserMenu_iconSettings"
                        label={"All Settings"}
                        onClick={(e) => this.onSettingsOpen(e, UserTab.General)}
                    />
                    {/* <IconizedContextMenuOption
                        iconClassName="mx_UserMenu_iconBell"
                        label={_t("Notification settings")}
                        onClick={(e) => this.onSettingsOpen(e, UserTab.Notifications)}
                    /> */}
                    <IconizedContextMenuOption
                        iconClassName="mx_UserMenu_iconLock"
                        label={"Security & Privacy"}
                        onClick={(e) => this.onSettingsOpen(e, UserTab.Security)}
                    />
                    {/* <IconizedContextMenuOption
                        iconClassName="mx_UserMenu_iconTransactions"
                        label={"My Transactions"}
                        onClick={(e) => this.onTransactionOpen(e, null)}
                    /> */}
                    {showWalletButton}
                    {connectButton}
                    { /* <IconizedContextMenuOption
                        iconClassName="mx_UserMenu_iconArchive"
                        label={_t("Archived rooms")}
                        onClick={this.onShowArchived}
                    /> */ }
                    { rewardButton }
                    { feedbackButton }
                </IconizedContextMenuOptionList>
                <IconizedContextMenuOptionList red>
                    <IconizedContextMenuOption
                        iconClassName="mx_UserMenu_iconSignOut"
                        label={"Sign Out"}
                        onClick={this.onSignOutClick}
                    />
                </IconizedContextMenuOptionList>
            </React.Fragment>
        );
        let secondarySection = null;

        if (prototypeCommunityName) {
            const communityId = CommunityPrototypeStore.instance.getSelectedCommunityId();
            primaryHeader = (
                <div className="mx_UserMenu_contextMenu_name">
                    <span className="mx_UserMenu_contextMenu_displayName">
                        {prototypeCommunityName}
                    </span>
                </div>
            );
            let settingsOption;
            let inviteOption;
            if (CommunityPrototypeStore.instance.canInviteTo(communityId)) {
                inviteOption = (
                    <IconizedContextMenuOption
                        iconClassName="mx_UserMenu_iconInvite"
                        label={"Invite"}
                        onClick={this.onCommunityInviteClick}
                    />
                );
            }
            if (CommunityPrototypeStore.instance.isAdminOf(communityId)) {
                settingsOption = (
                    <IconizedContextMenuOption
                        iconClassName="mx_UserMenu_iconSettings"
                        label={"Settings"}
                        aria-label={"Community Settings"}
                        onClick={this.onCommunitySettingsClick}
                    />
                );
            }
            primaryOptionList = (
                <IconizedContextMenuOptionList>
                    {settingsOption}
                    <IconizedContextMenuOption
                        iconClassName="mx_UserMenu_iconMembers"
                        label={"Members"}
                        onClick={this.onCommunityMembersClick}
                    />
                    {inviteOption}
                </IconizedContextMenuOptionList>
            );
            secondarySection = (
                <React.Fragment>
                    <hr />
                    <div className="mx_UserMenu_contextMenu_header">
                        <div className="mx_UserMenu_contextMenu_name">
                            <span className="mx_UserMenu_contextMenu_displayName">
                                {OwnProfileStore.instance.displayName}
                            </span>
                            <span className="mx_UserMenu_contextMenu_userId">

                                {MatrixClientPeg.get() ? MatrixClientPeg.get().getUserId() : false}
                            </span>
                        </div>
                    </div>
                    <IconizedContextMenuOptionList>
                        <IconizedContextMenuOption
                            iconClassName="mx_UserMenu_iconSettings"
                            label={"Settings"}
                            aria-label={"User Settings"}
                            onClick={(e) => this.onSettingsOpen(e, null)}
                        />
                        {/* {feedbackButton} */}
                        { rewardButton }
                    </IconizedContextMenuOptionList>
                    <IconizedContextMenuOptionList red>
                        <IconizedContextMenuOption
                            iconClassName="mx_UserMenu_iconSignOut"
                            label={"Sign Out"}
                            onClick={this.onSignOutClick}
                        />
                    </IconizedContextMenuOptionList>
                </React.Fragment>
            );
        } else if (MatrixClientPeg.get() && MatrixClientPeg.get().isGuest()) {
            primaryOptionList = (
                <React.Fragment>
                    <IconizedContextMenuOptionList>
                        {homeButton}
                        <IconizedContextMenuOption
                            iconClassName="mx_UserMenu_iconSettings"
                            label={"Settings"}
                            onClick={(e) => this.onSettingsOpen(e, null)}
                        />
                        {/* {feedbackButton} */}
                        { rewardButton }
                    </IconizedContextMenuOptionList>
                </React.Fragment>
            );
        }

        const classes = classNames({
            "mx_UserMenu_contextMenu": true,
            "mx_UserMenu_contextMenu_prototype": !!prototypeCommunityName,
        });

        return <IconizedContextMenu
            // numerical adjustments to overlap the context menu by just over the width of the
            // menu icon and make it look connected
            left={this.state.contextMenuPosition.left + this.state.contextMenuPosition.width - 300}
            top={this.state.contextMenuPosition.top + this.state.contextMenuPosition.height + 8}
            onFinished={this.onCloseMenu}
            className={classes}
        >
            <div className="mx_UserMenu_contextMenu_header">
                {primaryHeader}
                {userCustomStatus}
                {lottie}
                {/* <AccessibleTooltipButton
                    className="mx_UserMenu_contextMenu_themeButton"
                    onClick={this.onSwitchThemeClick}
                    title={this.state.isDarkTheme ? _t("Switch to light mode") : _t("Switch to dark mode")}
                >
                    <img
                        src={require("../../../res/img/element-icons/roomlist/dark-light-mode.svg")}
                        alt={_t("Switch theme")}
                        width={16}
                    />
                </AccessibleTooltipButton> */}
            </div>
            {topSection}
            {primaryOptionList}
            {secondarySection}
        </IconizedContextMenu>;
    };



    public render() {
        const avatarSize = 40; // should match border-radius of the avatar
        let userId
        let displayName
        if (MatrixClientPeg.get()) {
            userId = MatrixClientPeg.get().getUserId();
            displayName = OwnProfileStore.instance.displayName || userId;
        }
        else {
            displayName = "Guest"
        }
        const avatarUrl = MatrixClientPeg.get()? OwnProfileStore.instance.getHttpAvatarUrl(avatarSize): null;

        const prototypeCommunityName = CommunityPrototypeStore.instance.getSelectedCommunityName();

        let isPrototype = false;
        let menuName = "User Menu";
        let name = <span className="mx_UserMenu_userName">{displayName}</span>;
        let buttons = (
            <span className="mx_UserMenu_headerButtons">
                { /* masked image in CSS */}
            </span>
        );
        let dnd;
        if (this.state.selectedSpace) {
            name = (
                <div className="mx_UserMenu_doubleName">
                    <span className="mx_UserMenu_userName">{displayName}</span>
                    <RoomName room={this.state.selectedSpace}>
                        {(roomName) => <span className="mx_UserMenu_subUserName">{roomName}</span>}
                    </RoomName>
                </div>
            );
        } else if (prototypeCommunityName) {
            name = (
                <div className="mx_UserMenu_doubleName">
                    <span className="mx_UserMenu_userName">{prototypeCommunityName}</span>
                    <span className="mx_UserMenu_subUserName">{displayName}</span>
                </div>
            );
            menuName = _t("Community and user menu");
            isPrototype = true;
        } else if (SettingsStore.getValue("feature_communities_v2_prototypes")) {
            name = (
                <div className="mx_UserMenu_doubleName">
                    <span className="mx_UserMenu_userName">{"Home"}</span>
                    <span className="mx_UserMenu_subUserName">{displayName}</span>
                </div>
            );
            isPrototype = true;
        } else if (SettingsStore.getValue("feature_dnd")) {
            const isDnd = SettingsStore.getValue("doNotDisturb");
            dnd = <AccessibleButton
                onClick={this.onDndToggle}
                className={classNames({
                    "mx_UserMenu_dnd": true,
                    "mx_UserMenu_dnd_noisy": !isDnd,
                    "mx_UserMenu_dnd_muted": isDnd,
                })}
            />;
        }
        if (this.props.isMinimized) {
            name = null;
            buttons = null;
        }

        const classes = classNames({
            'mx_UserMenu': true,
            'mx_UserMenu_minimized': this.props.isMinimized,
            'mx_UserMenu_prototype': isPrototype,
        });
        
        return (
            <React.Fragment>
                <ContextMenuButton
                    className={classes}
                    onClick={this.onOpenMenuClick}
                    inputRef={this.buttonRef}
                    label={menuName}
                    isExpanded={!!this.state.contextMenuPosition}
                    onContextMenu={this.onContextMenu}
                >
                    <div className="mx_UserMenu_row">
                        <span className="mx_UserMenu_userAvatarContainer">
                            <NftAvatarCheckContainer userId={userId}>
                                <BaseAvatar
                                    idName={userId}
                                    name={displayName}
                                    url={avatarUrl}
                                    width={avatarSize}
                                    height={avatarSize}
                                    resizeMethod="crop"
                                    className="mx_UserMenu_userAvatar"
                                />
                            </NftAvatarCheckContainer>
                        </span>
                        <DomainNameCheckContainer userId={userId}>
                            {name}
                        </DomainNameCheckContainer>
                        {this.state.pendingRoomJoin.size > 0 && (
                            <InlineSpinner>
                                <TooltipButton helpText={_t(
                                    "Currently joining %(count)s rooms",
                                    { count: this.state.pendingRoomJoin.size },
                                )} />
                            </InlineSpinner>
                        )}
                        {dnd}
                        {buttons}
                    </div>
                </ContextMenuButton>
                {this.renderContextMenu()}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    // console.log("Is this???");
    const { wallets } = state.wallet;
    return { wallets };
};
  
export default connect(mapStateToProps)(UserMenu);