/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2019, 2021 The Matrix.org Foundation C.I.C.

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

import React from 'react';
import classNames from 'classnames';
import { _t } from '../../../languageHandler';
import { MatrixClientPeg } from '../../../MatrixClientPeg';

import SettingsStore from "../../../settings/SettingsStore";
import RoomHeaderButtons from '../right_panel/RoomHeaderButtons';
import E2EIcon from './E2EIcon';
import DecoratedRoomAvatar from "../avatars/DecoratedRoomAvatar";
import AccessibleTooltipButton from "../elements/AccessibleTooltipButton";
import RoomTopic from "../elements/RoomTopic";
import RoomName from "../elements/RoomName";
import { PlaceCallType } from "../../../CallHandler";
import { replaceableComponent } from "../../../utils/replaceableComponent";
import { throttle } from 'lodash';
import { MatrixEvent, Room, RoomMember, RoomState } from 'matrix-js-sdk/src';
import { E2EStatus } from '../../../utils/ShieldUtils';
import { IOOBData } from '../../../stores/ThreepidInviteStore';
import { SearchScope } from './SearchBar';
import { getEventDisplayInfo } from '../../../utils/EventUtils';
import { EventType } from "matrix-js-sdk/src/@types/event";
import DMRoomMap from '../../../utils/DMRoomMap';
import UserInfoButton from '../right_panel/UserInfoButton';
import AccessibleButton from '../elements/AccessibleButton';
import { getCategoryForRoom } from '../../../apis';
import RoomHeaderCustomStatus from './RoomHeaderCustomStatus';
import { checkVerifiedUserOrRoom } from '../../../hooks/commonFuncs';
import { fakeCategorie } from '../../../@types/variables';
import CategoryContextProvider from '../../structures/contextProvider/CategoryContextProvider';
import Spinner from "../elements/Spinner";

export interface ISearchInfo {
    searchTerm: string;
    searchScope: SearchScope;
    searchCount: number;
}

interface IProps {
    room: Room;
    oobData?: IOOBData;
    inRoom: boolean;
    // onSettingsClick: () => void;
    onSearchClick: () => void;
    onForgetClick: () => void;
    onCallPlaced: (type: PlaceCallType) => void;
    onAppsClick: () => void;
    e2eStatus: E2EStatus;
    appsShown: boolean;
    searchInfo: ISearchInfo;
    isMobileView?: boolean;
    setIsShowMessageWrap?: (value: boolean) => void
}

interface IState {
    category: string;
    isLoadingCategory: boolean;
}

@replaceableComponent("views.rooms.RoomHeader")
export default class RoomHeader extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            category: null,
            isLoadingCategory: false,
        }

        this.setRoomCategory = this.setRoomCategory.bind(this);
    }
    static defaultProps = {
        editing: false,
        inRoom: false,
    };

    public componentDidMount() {
        const cli = MatrixClientPeg.get();
        cli.on("RoomState.events", this.onRoomStateEvents);
        this.setRoomCategory();
    }

    public componentWillUnmount() {
        const cli = MatrixClientPeg.get();
        if (cli) {
            cli.removeListener("RoomState.events", this.onRoomStateEvents);
        }
    }

    private async setRoomCategory() {
        let isPrivateMessage = !!DMRoomMap.shared().getUserIdForRoomId(this.props.room.roomId);
        if (isPrivateMessage) return;
        this.setState({ isLoadingCategory: true });
        let category = await getCategoryForRoom(this.props.room.roomId);
        this.setState({ category, isLoadingCategory: false });
    }

    private onRoomStateEvents = (event: MatrixEvent, state: RoomState) => {
        if (!this.props.room || event.getRoomId() !== this.props.room.roomId) {
            return;
        }

        // redisplay the room name, topic, etc.
        this.rateLimitedUpdate();
    };

    private rateLimitedUpdate = throttle(() => {
        this.forceUpdate();
    }, 500, { leading: true, trailing: true });

    public render() {
        let searchStatus = null;
        let isPrivateMessage = !!DMRoomMap.shared().getUserIdForRoomId(this.props.room.roomId);
        // don't display the search count until the search completes and
        // gives us a valid (possibly zero) searchCount.
        if (this.props.searchInfo &&
            this.props.searchInfo.searchCount !== undefined &&
            this.props.searchInfo.searchCount !== null) {
            searchStatus = <div className="mx_RoomHeader_searchStatus">&nbsp;
                {_t("(~%(count)s results)", { count: this.props.searchInfo.searchCount })}
            </div>;
        }

        // XXX: this is a bit inefficient - we could just compare room.name for 'Empty room'...
        let settingsHint = false;
        const members = this.props.room ? this.props.room.getJoinedMembers() : undefined;
        if (members) {
            if (members.length === 1 && members[0].userId === MatrixClientPeg.get().credentials.userId) {
                const nameEvent = this.props.room.currentState.getStateEvents('m.room.name', '');
                if (!nameEvent || !nameEvent.getContent().name) {
                    settingsHint = true;
                }
            }
        }

        let oobName = "Join Room";
        if (this.props.oobData && this.props.oobData.name) {
            oobName = this.props.oobData.name;
        }
        const isVerified = checkVerifiedUserOrRoom(this.props.room.roomId, this.props.room.name || oobName);
        let verifiedBadge;
        if (isVerified) {
            verifiedBadge = (
                <div className='mx_Room_verified'></div>
            )
        }

        const name =
            // <div className="mx_RoomHeader_name" onClick={() => {if(!isPrivateMessage) this.props.onSettingsClick()}}>
            <div className="mx_RoomHeader_name" style={{ marginTop: (this.state.category || isPrivateMessage) ? '0' : '9px' }}>
                <RoomName room={this.props.room}>
                    {(name) => {
                        const roomName = name || oobName;
                        const textClasses = classNames('mx_RoomHeader_nametext', { mx_RoomHeader_settingsHint: settingsHint });
                        return <div dir="auto" className={textClasses} title={roomName}>{roomName}</div>;
                    }}
                </RoomName>
                {verifiedBadge}
                {searchStatus}
            </div>;

        const topicElement = <RoomTopic room={this.props.room}>
            {(topic, ref) => <div className="mx_RoomHeader_topic" ref={ref} title={topic} dir="auto">
                {/* {topic} */}
            </div>}
        </RoomTopic>;

        let roomAvatar;
        if (this.props.room) {
            //@ts-ignore
            roomAvatar = <DecoratedRoomAvatar
                room={this.props.room}
                avatarSize={40}
                oobData={this.props.oobData}
                viewAvatarOnClick={true}
            />;
        }

        let forgetButton;
        if (this.props.onForgetClick) {
            forgetButton =
                <AccessibleTooltipButton
                    className="mx_RoomHeader_button mx_RoomHeader_forgetButton"
                    onClick={this.props.onForgetClick}
                    title={"Forget Room"} />;
        }

        let appsButton;
        if (this.props.onAppsClick && false) {
            appsButton =
                <AccessibleTooltipButton
                    className={classNames("mx_RoomHeader_button mx_RoomHeader_appsButton", {
                        mx_RoomHeader_appsButton_highlight: this.props.appsShown,
                    })}
                    onClick={this.props.onAppsClick}
                    title={this.props.appsShown ? _t("Hide Widgets") : _t("Show Widgets")} />;
        }

        let searchButton;
        if (this.props.onSearchClick && this.props.inRoom) {
            searchButton =
                <AccessibleTooltipButton
                    className="mx_RoomHeader_button mx_RoomHeader_searchButton"
                    onClick={this.props.onSearchClick}
                    title={"Search"}
                    alignment={4}
                />;
        }

        let voiceCallButton;
        let videoCallButton;
        if (this.props.inRoom && SettingsStore.getValue("showCallButtonsInComposer")) {
            voiceCallButton =
                <AccessibleTooltipButton
                    className="mx_RoomHeader_button mx_RoomHeader_voiceCallButton"
                    // onClick={() => this.props.onCallPlaced(PlaceCallType.Voice)}
                    onClick={null}
                    title={"Voice Call"} />;
            videoCallButton =
                <AccessibleTooltipButton
                    className="mx_RoomHeader_button mx_RoomHeader_videoCallButton"
                    onClick={(ev) => this.props.onCallPlaced(
                        ev.shiftKey ? PlaceCallType.ScreenSharing : PlaceCallType.Video)}
                    title={"Video Call"} />;
        }

        const rightRow =
            <div className="mx_RoomHeader_buttons">
                {/* { videoCallButton } */}
                {/* { voiceCallButton } */}
                {/* { forgetButton } */}
                {appsButton}
                {searchButton}
            </div>;
        let leftButton;
        if (this.props.isMobileView) {
            leftButton = (
                <AccessibleButton onClick={() => this.props.setIsShowMessageWrap(false)}>
                    <div className='mx_RoomHeader_LeftButton' id='show_left_panel_button'>
                    </div>
                </AccessibleButton>
            )
        }
        // const events = this.props.room.getLiveTimeline().getEvents();
        // let isEncryptedEvent = false;

        // events.map((event) => {
        //     const eventType = event.getType();
        //     const content = event.getContent();
        //     const msgtype = content.msgtype;
        //     // Info messages are basically information about commands processed on a room
        //     let isBubbleMessage = (

        //         (eventType === EventType.RoomMessage && msgtype && msgtype.startsWith("m.key.verification"))
        //     );
        //     if(isBubbleMessage) isEncryptedEvent = true;
        // })

        // const isRoomEncrypted = (!!this.props.room.summaryHeroes || isEncryptedEvent);

        // const e2eIcon = isRoomEncrypted ? <E2EIcon status={"normal"} /> : undefined;
        let isAvtive = false;
        let spinner;
        if (this.state.isLoadingCategory) {
            spinner = <Spinner w={20} h={20} />
        }
        let subTitle;
        if (this.state.category) {
            subTitle = (
                <div className='mx_RoomHeader_Category d-flex align-items-center'>
                    <div className={`icon ${this.state.category.toLowerCase()}`}></div>
                    <div className='mx_Category_name dark'>{this.state.category}</div>
                </div>
            )
        }
        let memberId;
        if (isPrivateMessage) {
            const Members = this.props.room.getJoinedMembers();
            Members.map((member: RoomMember) => {
                if (member.user?.presence == "online" && MatrixClientPeg.get().getUserId() != member.userId) {
                    isAvtive = true;
                }
                if (member.userId !== MatrixClientPeg.get().getUserId()) {
                    memberId = member.userId;
                }
            })
            subTitle = (
                <RoomHeaderCustomStatus
                    memberId={memberId}
                    accessToken={MatrixClientPeg.get().getAccessToken()}
                />
            )
        }

        const roomAvatarClassName = classNames("mx_RoomHeader_avatar");

        const navbar = !isPrivateMessage ?
            <div className="container d-none d-md-block">
                <nav className="navbar navbar-expand navbar-light mx_RoomHeader_nav">
                    <ul className="navbar-nav mx_RoomHeader_navbar">
                        <li className="nav-item active">
                            <a className="nav-link" href="#">Chatbox</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link disabled" href="#">Group News</a>
                        </li>                        
                        <li className="nav-item">
                            <a className="nav-link disabled" href="#">
                                <span className="members-lock"></span>
                                Super Chatters
                            </a>
                        </li>
                    </ul>
                </nav>
            </div> : null;

        const topicElementComponent = !isPrivateMessage ? null : topicElement;

        return (
            <div className="mx_RoomHeader light-panel">
                {/* <CategoryContextProvider setRoomCategory={this.setRoomCategory} roomId={this.props.room.roomId}> */}
                <div className="mx_RoomHeader_wrapper" aria-owns="mx_RightPanel">
                    {leftButton}
                    <div className={roomAvatarClassName}>{roomAvatar}</div>
                    {/* <div className="mx_RoomHeader_e2eIcon">{ e2eIcon }</div> */}
                    <div className="mx_RoomHeader_Name_Category">
                        {name}
                        {subTitle}
                    </div>

                    {navbar}

                    {topicElementComponent}

                    {/* {rightRow} */}
                    <RoomHeaderButtons room={this.props.room} rightRow={rightRow}/>
                    <UserInfoButton />
                </div>
                {/* </CategoryContextProvider> */}
            </div>
        );
    }
}
