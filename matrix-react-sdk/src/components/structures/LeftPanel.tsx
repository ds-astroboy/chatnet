/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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

import * as React from "react";
import { createRef } from "react";
import classNames from "classnames";
import { Room } from "matrix-js-sdk/src/models/room";

import GroupFilterPanel from "./GroupFilterPanel";
import CustomRoomTagPanel from "./CustomRoomTagPanel";
import dis from "../../dispatcher/dispatcher";
import { _t } from "../../languageHandler";
import RoomList from "../views/rooms/RoomList";
import CallHandler from "../../CallHandler";
import { HEADER_HEIGHT } from "../views/rooms/RoomSublist";
import { Action } from "../../dispatcher/actions";
import UserMenu from "./UserMenu";
import RoomSearch from "./RoomSearch";
import RoomBreadcrumbs from "../views/rooms/RoomBreadcrumbs";
import { BreadcrumbsStore } from "../../stores/BreadcrumbsStore";
import { UPDATE_EVENT } from "../../stores/AsyncStore";
import ResizeNotifier from "../../utils/ResizeNotifier";
import SettingsStore from "../../settings/SettingsStore";
import RoomListStore, { LISTS_UPDATE_EVENT } from "../../stores/room-list/RoomListStore";
import IndicatorScrollbar from "../structures/IndicatorScrollbar";
import AccessibleTooltipButton from "../views/elements/AccessibleTooltipButton";
import { OwnProfileStore } from "../../stores/OwnProfileStore";
import RoomListNumResults from "../views/rooms/RoomListNumResults";
import LeftPanelWidget from "./LeftPanelWidget";
import { replaceableComponent } from "../../utils/replaceableComponent";
import { mediaFromMxc } from "../../customisations/Media";
import SpaceStore, { UPDATE_SELECTED_SPACE } from "../../stores/SpaceStore";
import { getKeyBindingsManager, RoomListAction } from "../../KeyBindingsManager";
import UIStore from "../../stores/UIStore";
import Lottie from "lottie-react";
import leftLogoLottie from "../../../res/img/lottie/cafeteria_animation_nopadding.json";
import leftVoteLottie from "../../../res/img/lottie/checkbox_white.json";
import PageTypes from '../../PageTypes';
import { SettingLevel } from "../../settings/SettingLevel";
import { getCustomTheme } from "../../theme";
import LeftPanelFooter from "./LeftPanelFooter";
import UserInfoButton from "../views/right_panel/UserInfoButton";

interface IProps {
    isMinimized: boolean;
    resizeNotifier: ResizeNotifier;
    isDarkTheme?: boolean;
    setIsMobileView?: (value: boolean) => void;
    setIsShowMessageWrap?: (value: boolean) => void;
    isShowMessageWrap?: boolean;
    pageType?: string;
    isShowLeftPanel?: boolean;
    setIsShowLeftPanel?: (value: boolean) => void;
    setIsHiddenLeftPanel?: (value: boolean) => void;
    isSignout?: boolean;
}

interface IState {
    showBreadcrumbs: boolean;
    showGroupFilterPanel: boolean;
    activeSpace?: Room;
    isShowLogoLottie?: boolean;
    isShowVoteLottie?: boolean;
    isNotMobileView: boolean;
    isMinimized: boolean;
    isHiddenLeftPanel: boolean;
}

// List of CSS classes which should be included in keyboard navigation within the room list
const cssClasses = [
    "mx_RoomSearch_input",
    "mx_RoomSearch_minimizedHandle", // minimized <RoomSearch />
    "mx_RoomSublist_headerText",
    "mx_RoomTile",
    "mx_RoomSublist_showNButton",
];

@replaceableComponent("structures.LeftPanel")
export default class LeftPanel extends React.Component<IProps, IState> {
    private ref: React.RefObject<HTMLDivElement> = createRef();
    private listContainerRef: React.RefObject<HTMLDivElement> = createRef();
    private groupFilterPanelWatcherRef: string;
    private bgImageWatcherRef: string;
    private focusedElement = null;
    private isDoingStickyHeaders = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            showBreadcrumbs: this.props.isSignout? false : BreadcrumbsStore.instance.visible,
            showGroupFilterPanel: this.props.isSignout? false : SettingsStore.getValue('TagPanel.enableTagPanel'),
            activeSpace: this.props.isSignout? null : SpaceStore.instance.activeSpace,
            isShowLogoLottie: false,
            isShowVoteLottie: false,
            isNotMobileView: false,
            isMinimized: false,
            isHiddenLeftPanel: false
        };
        if(!this.props.isSignout) {
            BreadcrumbsStore.instance.on(UPDATE_EVENT, this.onBreadcrumbsUpdate);
            RoomListStore.instance.on(LISTS_UPDATE_EVENT, this.onBreadcrumbsUpdate);
            OwnProfileStore.instance.on(UPDATE_EVENT, this.onBackgroundImageUpdate);
            SpaceStore.instance.on(UPDATE_SELECTED_SPACE, this.updateActiveSpace);
            this.bgImageWatcherRef = SettingsStore.watchSetting(
                "RoomList.backgroundImage", null, this.onBackgroundImageUpdate);
            this.groupFilterPanelWatcherRef = SettingsStore.watchSetting("TagPanel.enableTagPanel", null, () => {
                this.setState({ showGroupFilterPanel: SettingsStore.getValue("TagPanel.enableTagPanel") });
            });
        }
    }

    public componentDidMount() {
        this.setState({
            isMinimized: (window.innerWidth > 600 && window.innerWidth < 800),
            isNotMobileView: (window.innerWidth > 600)
        })
        window.onresize = this.checkMinimize
        if(this.props.isSignout) return;
        UIStore.instance.trackElementDimensions("ListContainer", this.listContainerRef.current);
        UIStore.instance.on("ListContainer", this.refreshStickyHeaders);
        // Using the passive option to not block the main thread
        // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners
        this.listContainerRef.current?.addEventListener("scroll", this.onScroll, { passive: true });
        
        this.props.setIsMobileView(window.innerWidth <= 600);
        //Event Listeners
    }

    public componentWillUnmount() {
        if(this.props.isSignout) return;
        SettingsStore.unwatchSetting(this.groupFilterPanelWatcherRef);
        SettingsStore.unwatchSetting(this.bgImageWatcherRef);
        BreadcrumbsStore.instance.off(UPDATE_EVENT, this.onBreadcrumbsUpdate);
        RoomListStore.instance.off(LISTS_UPDATE_EVENT, this.onBreadcrumbsUpdate);
        OwnProfileStore.instance.off(UPDATE_EVENT, this.onBackgroundImageUpdate);
        SpaceStore.instance.off(UPDATE_SELECTED_SPACE, this.updateActiveSpace);
        UIStore.instance.stopTrackingElementDimensions("ListContainer");
        UIStore.instance.removeListener("ListContainer", this.refreshStickyHeaders);
        this.listContainerRef.current?.removeEventListener("scroll", this.onScroll);
    }

    public checkMinimize = (e) => {
        if(e.target.innerWidth > 600 && e.target.innerWidth <= 800) {
            if(!this.state.isMinimized) {
                this.setState({
                    isMinimized: true,
                    isNotMobileView: true
                })
                this.props.setIsMobileView(false);
            }
        }
        else if(e.target.innerWidth <= 600) {
            if(this.state.isNotMobileView) {
                this.setState({
                    isNotMobileView: false,
                    isMinimized: false
                })
                this.props.setIsMobileView(true);
            }
        }
        else {
            if(!this.state.isNotMobileView || this.state.isMinimized) {
                this.setState({
                    isNotMobileView: true,
                    isMinimized: false
                })
                this.props.setIsMobileView(false);
            }
        }
    }

    public componentDidUpdate(prevProps: IProps, prevState: IState): void {
        if (prevState.activeSpace !== this.state.activeSpace) {
            this.refreshStickyHeaders();
        }
    }



    private updateActiveSpace = (activeSpace: Room) => {
        this.setState({ activeSpace });
    };

    private onDialPad = () => {
        dis.fire(Action.OpenDialPad);
    };

    private onExplore = () => {
        dis.fire(Action.ViewRoomDirectory);
    };

    private refreshStickyHeaders = () => {
        if (!this.listContainerRef.current) return; // ignore: no headers to sticky
        this.handleStickyHeaders(this.listContainerRef.current);
    };

    private onBreadcrumbsUpdate = () => {
        const newVal = BreadcrumbsStore.instance.visible;
        if (newVal !== this.state.showBreadcrumbs) {
            this.setState({ showBreadcrumbs: newVal });

            // Update the sticky headers too as the breadcrumbs will be popping in or out.
            if (!this.listContainerRef.current) return; // ignore: no headers to sticky
            this.handleStickyHeaders(this.listContainerRef.current);
        }
    };

    private onBackgroundImageUpdate = () => {
        // Note: we do this in the LeftPanel as it uses this variable most prominently.
        const avatarSize = 32; // arbitrary
        let avatarUrl = OwnProfileStore.instance.getHttpAvatarUrl(avatarSize);
        const settingBgMxc = SettingsStore.getValue("RoomList.backgroundImage");
        if (settingBgMxc) {
            avatarUrl = mediaFromMxc(settingBgMxc).getSquareThumbnailHttp(avatarSize);
        }

        const avatarUrlProp = `url(${avatarUrl})`;
        if (!avatarUrl) {
            document.body.style.removeProperty("--avatar-url");
        } else if (document.body.style.getPropertyValue("--avatar-url") !== avatarUrlProp) {
            document.body.style.setProperty("--avatar-url", avatarUrlProp);
        }
    };

    private handleStickyHeaders(list: HTMLDivElement) {
        if (this.isDoingStickyHeaders) return;
        this.isDoingStickyHeaders = true;
        window.requestAnimationFrame(() => {
            this.doStickyHeaders(list);
            this.isDoingStickyHeaders = false;
        });
    }

    private doStickyHeaders(list: HTMLDivElement) {
        const topEdge = list.scrollTop;
        const bottomEdge = list.offsetHeight + list.scrollTop;
        const sublists = list.querySelectorAll<HTMLDivElement>(".mx_RoomSublist:not(.mx_RoomSublist_hidden)");

        // We track which styles we want on a target before making the changes to avoid
        // excessive layout updates.
        const targetStyles = new Map<HTMLDivElement, {
            stickyTop?: boolean;
            stickyBottom?: boolean;
            makeInvisible?: boolean;
        }>();

        let lastTopHeader;
        let firstBottomHeader;
        for (const sublist of sublists) {
            const header = sublist.querySelector<HTMLDivElement>(".mx_RoomSublist_stickable");
            header.style.removeProperty("display"); // always clear display:none first

            // When an element is <=40% off screen, make it take over
            const offScreenFactor = 0.4;
            const isOffTop = (sublist.offsetTop + (offScreenFactor * HEADER_HEIGHT)) <= topEdge;
            const isOffBottom = (sublist.offsetTop + (offScreenFactor * HEADER_HEIGHT)) >= bottomEdge;

            if (isOffTop || sublist === sublists[0]) {
                // targetStyles.set(header, { stickyTop: true });
                if (lastTopHeader) {
                    lastTopHeader.style.display = "none";
                    targetStyles.set(lastTopHeader, { makeInvisible: true });
                }
                lastTopHeader = header;
            } else if (isOffBottom && !firstBottomHeader) {
                // targetStyles.set(header, { stickyBottom: true });
                firstBottomHeader = header;
            } else {
                targetStyles.set(header, {}); // nothing == clear
            }
        }

        // Run over the style changes and make them reality. We check to see if we're about to
        // cause a no-op update, as adding/removing properties that are/aren't there cause
        // layout updates.
        for (const header of targetStyles.keys()) {
            const style = targetStyles.get(header);

            if (style.makeInvisible) {
                // we will have already removed the 'display: none', so add it back.
                header.style.display = "none";
                continue; // nothing else to do, even if sticky somehow
            }

            if (style.stickyTop) {
                if (!header.classList.contains("mx_RoomSublist_headerContainer_stickyTop")) {
                    header.classList.add("mx_RoomSublist_headerContainer_stickyTop");
                }

                const newTop = `${list.parentElement.offsetTop}px`;
                if (header.style.top !== newTop) {
                    header.style.top = newTop;
                }
            } else {
                if (header.classList.contains("mx_RoomSublist_headerContainer_stickyTop")) {
                    header.classList.remove("mx_RoomSublist_headerContainer_stickyTop");
                }
                if (header.style.top) {
                    header.style.removeProperty('top');
                }
            }

            if (style.stickyBottom) {
                if (!header.classList.contains("mx_RoomSublist_headerContainer_stickyBottom")) {
                    header.classList.add("mx_RoomSublist_headerContainer_stickyBottom");
                }

                const offset = UIStore.instance.windowHeight -
                    (list.parentElement.offsetTop + list.parentElement.offsetHeight);
                const newBottom = `${offset}px`;
                if (header.style.bottom !== newBottom) {
                    header.style.bottom = newBottom;
                }
            } else {
                if (header.classList.contains("mx_RoomSublist_headerContainer_stickyBottom")) {
                    header.classList.remove("mx_RoomSublist_headerContainer_stickyBottom");
                }
                if (header.style.bottom) {
                    header.style.removeProperty('bottom');
                }
            }

            if (style.stickyTop || style.stickyBottom) {
                if (!header.classList.contains("mx_RoomSublist_headerContainer_sticky")) {
                    header.classList.add("mx_RoomSublist_headerContainer_sticky");
                }

                const listDimensions = UIStore.instance.getElementDimensions("ListContainer");
                if (listDimensions) {
                    const headerRightMargin = 15; // calculated from margins and widths to align with non-sticky tiles
                    const headerStickyWidth = listDimensions.width - headerRightMargin;
                    const newWidth = `${headerStickyWidth}px`;
                    if (header.style.width !== newWidth) {
                        header.style.width = newWidth;
                    }
                }
            } else if (!style.stickyTop && !style.stickyBottom) {
                if (header.classList.contains("mx_RoomSublist_headerContainer_sticky")) {
                    header.classList.remove("mx_RoomSublist_headerContainer_sticky");
                }

                if (header.style.width) {
                    header.style.removeProperty('width');
                }
            }
        }

        // add appropriate sticky classes to wrapper so it has
        // the necessary top/bottom padding to put the sticky header in
        const listWrapper = list.parentElement; // .mx_LeftPanel_roomListWrapper
        if (lastTopHeader) {
            listWrapper.classList.add("mx_LeftPanel_roomListWrapper_stickyTop");
        } else {
            listWrapper.classList.remove("mx_LeftPanel_roomListWrapper_stickyTop");
        }
        if (firstBottomHeader) {
            listWrapper.classList.add("mx_LeftPanel_roomListWrapper_stickyBottom");
        } else {
            listWrapper.classList.remove("mx_LeftPanel_roomListWrapper_stickyBottom");
        }
    }

    private onScroll = (ev: Event) => {
        const list = ev.target as HTMLDivElement;
        this.handleStickyHeaders(list);
    };

    private onFocus = (ev: React.FocusEvent) => {
        this.focusedElement = ev.target;
    };

    private onBlur = () => {
        this.focusedElement = null;
    };

    private onKeyDown = (ev: React.KeyboardEvent) => {
        if (!this.focusedElement) return;

        const action = getKeyBindingsManager().getRoomListAction(ev);
        switch (action) {
            case RoomListAction.NextRoom:
            case RoomListAction.PrevRoom:
                ev.stopPropagation();
                ev.preventDefault();
                this.onMoveFocus(action === RoomListAction.PrevRoom);
                break;
        }
    };

    private selectRoom = () => {
        const firstRoom = this.listContainerRef.current.querySelector<HTMLDivElement>(".mx_RoomTile");
        if (firstRoom) {
            firstRoom.click();
            return true; // to get the field to clear
        }
    };

    private onMoveFocus = (up: boolean) => {
        let element = this.focusedElement;

        let descending = false; // are we currently descending or ascending through the DOM tree?
        let classes: DOMTokenList;

        do {
            const child = up ? element.lastElementChild : element.firstElementChild;
            const sibling = up ? element.previousElementSibling : element.nextElementSibling;

            if (descending) {
                if (child) {
                    element = child;
                } else if (sibling) {
                    element = sibling;
                } else {
                    descending = false;
                    element = element.parentElement;
                }
            } else {
                if (sibling) {
                    element = sibling;
                    descending = true;
                } else {
                    element = element.parentElement;
                }
            }

            if (element) {
                classes = element.classList;
            }
        } while (element && (!cssClasses.some(c => classes.contains(c)) || element.offsetParent === null));

        if (element) {
            element.focus();
            this.focusedElement = element;
        }
    };


    private renderHeader(): React.ReactNode {
        const showVotePage = () => {
            if(!this.state.isNotMobileView) return;
            dis.dispatch({action: "view_vote_page"})
            this.props.setIsShowMessageWrap(true);
            this.props.setIsShowLeftPanel(false);
        }
        const showHomePage = () => {
            if(this.props.isSignout) {
                dis.dispatch({action: "view_welcome_page"});
                this.props.setIsShowLeftPanel(false);
            }
            else {
                dis.dispatch({action: "view_home_page"})
                this.props.setIsShowMessageWrap(true);
                this.props.setIsShowLeftPanel(false);
            }
        }
        const showLogoLottie = () => {
            this.setState({isShowLogoLottie: true});
        }
        const hiddenLogoLottie= () => {
            this.setState({isShowLogoLottie: false});
        }
        const showVoteLottie = () => {
            this.setState({isShowVoteLottie: true})
        }
        const hiddenVoteLottie = () => {
            this.setState({isShowVoteLottie: false})
        }
        let voteLottie;
        if(this.state.isShowVoteLottie && this.state.isNotMobileView) {
            voteLottie = (
                <Lottie animationData={leftVoteLottie} loop={false} className="mx_LeftPanel_Vote_Lottie"/>
            )
        }
        let logoLottie;
        if(this.state.isShowLogoLottie && this.state.isNotMobileView) {
            logoLottie = (
                <Lottie animationData={leftLogoLottie} loop={false} className="mx_LeftPanel_logo_Lottie"/>
            )
        }
        const className = classNames(
            "mx_LeftPanel_userHeader",
            {
                mx_LeftPanel_userHeader_Mobile_view: !this.state.isNotMobileView,
                "justify-content-start": !!this.state.isNotMobileView,
                "justify-content-between": !this.state.isNotMobileView,
            }
        )

        const isUserOnDarkTheme = (): boolean => {
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
    
        const changeTheme = () => {
            SettingsStore.setValue("use_system_theme", null, SettingLevel.DEVICE, false);
            const isDarkTheme = isUserOnDarkTheme();
            const newTheme = isDarkTheme ? "light" : "dark";
            SettingsStore.setValue("theme", null, SettingLevel.DEVICE, newTheme); // set at same level as Appearance tab
        }
        return (
            <div className={className}>
                <div className="mx_LeftPanel_logo" onClick={showHomePage} onMouseEnter={showLogoLottie} onMouseLeave={hiddenLogoLottie}>
                    { logoLottie }
                    <img src={require("../../../res/img/cafeteria-icon-svg.svg")}/>
                </div>
                {/* <div className="mx_LeftPanel_logo" onClick={showHomePage}>
                    <img src={require("../../../res/img/pumpkin.svg")}/>
                </div> */}
                {
                    !this.state.isNotMobileView
                    ?
                    <React.Fragment>
                        {
                            this.props.isSignout
                            ?
                            <React.Fragment></React.Fragment>
                            :
                            <div className="mx_LeftPanel_Header_Buttons">
                                <div className="mx_LeftPanel_Header_Button message_button">
                                </div>
                                <div className="mx_LeftPanel_Header_Button vote_button" onClick={showVotePage} onMouseEnter={showVoteLottie} onMouseLeave={hiddenVoteLottie}>
                                    {voteLottie}
                                </div>
                                {/* <div className="mx_LeftPanel_Header_Button vote_button">
                                </div> */}
                            </div>
                        }
                        {/* <div className="dropdown">
                            <input type="checkbox" id="mx_LeftPanel_Header_menu_checkbox" className="mx_LeftPanel_Header_menu_checkbox"/>
                            <label className="dropdown__face" htmlFor="mx_LeftPanel_Header_menu_checkbox">
                                <div className="mx_LeftPanel_Header_menu_Button"></div>
                            </label>
                            <ul className="dropdown__items">
                                <div className="dropdown__item" onClick={changeTheme}>
                                    <div className="dropdown__item__darkIcon"></div>
                                    <div className="dropdown__item__switchIcon"></div>
                                    <div className="dropdown__item__lightIcon"></div>
                                </div>
                            </ul>
                        </div> */}
                        <UserInfoButton />
                    </React.Fragment>
                    :
                    // <div className="mx_LeftPanel_vote_img" onClick={showVotePage} onMouseEnter={showVoteLottie} onMouseLeave={hiddenVoteLottie}>
                    //     { voteLottie }
                    // </div>
                    (!this.props.isMinimized && <div className="mx_LeftPanel_title_logo mx-3"  onClick={showHomePage}>
                        <img src={require("../../../res/img/cafeteria-header-logo-white.png")}/>
                    </div>)
                    // <div className="mx_LeftPanel_vote_img">
                    //     { voteLottie }
                    // </div>
                    
                }
                
            </div>
        );
    }

    private renderBreadcrumbs(): React.ReactNode {
        let isMinimized = this.props.isMinimized;
        if(!this.state.isNotMobileView) isMinimized = false;
        if(this.state.isMinimized) isMinimized = true;

        if (this.state.showBreadcrumbs && !isMinimized) {
            return (
                <IndicatorScrollbar
                    className="mx_LeftPanel_breadcrumbsContainer mx_AutoHideScrollbar"
                    verticalScrollsHorizontally={true}
                    // Firefox sometimes makes this element focusable due to
                    // overflow:scroll;, so force it out of tab order.
                    tabIndex={-1}
                >
                    <RoomBreadcrumbs setIsShowMessageWrap={this.props.setIsShowMessageWrap}/>
                </IndicatorScrollbar>
            );
        }
    }

    private renderSearchDialExplore(): React.ReactNode {
        let dialPadButton = null;

        // If we have dialer support, show a button to bring up the dial pad
        // to start a new call
        if (CallHandler.sharedInstance().getSupportsPstnProtocol()) {
            dialPadButton =
                <AccessibleTooltipButton
                    className={classNames("mx_LeftPanel_dialPadButton", {})}
                    onClick={this.onDialPad}
                    title={_t("Open dial pad")}
                />;
        }

        return (
            <div
                className="mx_LeftPanel_filterContainer"
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onKeyDown={this.onKeyDown}
            >
                <RoomSearch
                    isMinimized={this.props.isMinimized}
                    onKeyDown={this.onKeyDown}
                    onSelectRoom={this.selectRoom}
                />

                { dialPadButton }

                <AccessibleTooltipButton
                    className={classNames("mx_LeftPanel_exploreButton", {
                        mx_LeftPanel_exploreButton_space: !!this.state.activeSpace,
                    })}
                    onClick={this.onExplore}
                    title={_t("Explore rooms")}
                />
            </div>
        );
    }

    public render(): React.ReactNode {
        let isMinimized = this.props.isMinimized;
        if(!this.state.isNotMobileView) isMinimized = this.state.isNotMobileView;
        if(this.state.isMinimized) isMinimized = this.state.isMinimized;
        let leftLeftPanel;
        if (this.state.showGroupFilterPanel) {
            leftLeftPanel = (
                <div className="mx_LeftPanel_GroupFilterPanelContainer">
                    <GroupFilterPanel />
                    { SettingsStore.getValue("feature_custom_tags") ? <CustomRoomTagPanel /> : null }
                </div>
            );
        }

        switch(this.props.pageType) {
            case PageTypes.TermsPage:
            case PageTypes.PrivacyPage:
            case PageTypes.AboutPage:
            case PageTypes.TokensAndNfts:
                isMinimized = true;
                break;
        }

        const roomList = <RoomList
            onKeyDown={this.onKeyDown}
            isNotMobileView={this.state.isNotMobileView}
            resizeNotifier={this.props.resizeNotifier}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            isMinimized={isMinimized}
            activeSpace={this.state.activeSpace}
            onResize={this.refreshStickyHeaders}
            onListCollapse={this.refreshStickyHeaders}
            setIsShowMessageWrap={this.props.setIsShowMessageWrap}
            isSignout={this.props.isSignout}
        />;

        let isHiddenLeftPanel = (!this.state.isNotMobileView && (this.props.isShowMessageWrap || this.props.pageType !== PageTypes.RoomView));
        if(!this.state.isNotMobileView && this.props.isShowLeftPanel && this.props.pageType !== PageTypes.RoomView) {
            isHiddenLeftPanel = false;
        }
            // this.setState({isHiddenLeftPanel})
        this.props.setIsHiddenLeftPanel && this.props.setIsHiddenLeftPanel(isHiddenLeftPanel);

        // switch(this.props.pageType) {
        //     case PageTypes.TermsPage:
        //     case PageTypes.PrivacyPage:
        //     case PageTypes.AboutPage:
        //     case PageTypes.TokensAndNfts:
        //         isHiddenLeftPanel = true;
        //         break;
        // }

        const containerClasses = classNames({
            "mx_LeftPanel": true,
            "mx_LeftPanel_minimized": isMinimized && !isHiddenLeftPanel,
            "mx_LeftPanel_fullWidth": !this.state.isNotMobileView,
            "mx_LeftPanel_hidden": isHiddenLeftPanel,
        });

        const roomListClasses = classNames(
            "mx_LeftPanel_actualRoomListContainer",
            "mx_AutoHideScrollbar", 
            {
                "pt-4": this.props.isSignout
            }
        );

        return (
            <div className={containerClasses} ref={this.ref}>
                {/* { leftLeftPanel } */}
                <aside className="mx_LeftPanel_roomListContainer">
                    { this.renderHeader() }
                    { this.renderBreadcrumbs() }
                    {/* { this.renderSearchDialExplore() } */}
                    {
                        this.props.isSignout
                        ?
                        <React.Fragment></React.Fragment>
                        :
                        <RoomListNumResults onVisibilityChange={this.refreshStickyHeaders} />
                    }
                    <div className="mx_LeftPanel_roomListWrapper">
                        <div
                            className={roomListClasses}
                            ref={this.listContainerRef}
                            // Firefox sometimes makes this element focusable due to
                            // overflow:scroll;, so force it out of tab order.
                            tabIndex={-1}
                        >
                            { roomList }
                        </div>
                    </div>
                    { (!isMinimized && !this.props.isSignout) && <LeftPanelWidget /> }
                    <LeftPanelFooter isMinimized={isMinimized} isMobileView={!this.state.isNotMobileView}/>
                </aside>
            </div>
        );
    }
}
