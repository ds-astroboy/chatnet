/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2017 New Vector Ltd
Copyright 2018 New Vector Ltd
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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

import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";

import { _t } from '../../../languageHandler';
import HeaderButton from './HeaderButton';
import HeaderButtons, { HeaderKind } from './HeaderButtons';
import { RightPanelPhases } from "../../../stores/RightPanelStorePhases";
import { Action } from "../../../dispatcher/actions";
import { ActionPayload } from "../../../dispatcher/payloads";
import RightPanelStore from "../../../stores/RightPanelStore";
import { replaceableComponent } from "../../../utils/replaceableComponent";
import { useSettingValue } from "../../../hooks/useSettings";
import { useReadPinnedEvents, usePinnedEvents } from './PinnedMessagesCard';
import DMRoomMap from "../../../utils/DMRoomMap";

const ROOM_INFO_PHASES = [
    RightPanelPhases.RoomSummary,
    RightPanelPhases.Widget,
    RightPanelPhases.FilePanel,
    RightPanelPhases.RoomMemberList,
    RightPanelPhases.RoomMemberInfo,
    RightPanelPhases.EncryptionPanel,
    RightPanelPhases.Room3pidMemberInfo,
];

const PinnedMessagesHeaderButton = ({ room, isHighlighted, onClick }) => {
    const pinningEnabled = useSettingValue("feature_pinning");
    const pinnedEvents = usePinnedEvents(pinningEnabled && room);
    const readPinnedEvents = useReadPinnedEvents(pinningEnabled && room);
    if (!pinningEnabled) return null;

    let unreadIndicator;
    if (pinnedEvents.some(id => !readPinnedEvents.has(id))) {
        unreadIndicator = <div className="mx_RightPanel_pinnedMessagesButton_unreadIndicator" />;
    }

    return <HeaderButton
        name="pinnedMessagesButton"
        title={"Pinned Messages"}
        isHighlighted={isHighlighted}
        onClick={onClick}
        analytics={["Right Panel", "Pinned Messages Button", "click"]}
    >
        { unreadIndicator }
    </HeaderButton>;
};

interface IProps {
    room?: Room;
    rightRow?: any;
}

@replaceableComponent("views.right_panel.RoomHeaderButtons")
export default class RoomHeaderButtons extends HeaderButtons<IProps> {
    constructor(props: IProps) {
        super(props, HeaderKind.Room);
    }

    private isPrivateMessage = !!DMRoomMap.shared().getUserIdForRoomId(this.props.room.roomId);

    protected onAction(payload: ActionPayload) {
        if (payload.action === Action.ViewUser) {
            if (payload.member) {
                this.setPhase(RightPanelPhases.RoomMemberInfo, { member: payload.member });
            } else {
                this.setPhase(RightPanelPhases.RoomMemberList);
            }
        } else if (payload.action === "view_3pid_invite") {
            if (payload.event) {
                this.setPhase(RightPanelPhases.Room3pidMemberInfo, { event: payload.event });
            } else {
                this.setPhase(RightPanelPhases.RoomMemberList);
            }
        }
    }

    private onGroupMembersListClicked = () => {
        // // use roomPanelPhase rather than this.state.phase as it remembers the latest one if we close
        // const lastPhase = RightPanelStore.getSharedInstance().roomPanelPhase;
        // if (ROOM_INFO_PHASES.includes(lastPhase)) {
        //     if (this.state.phase === lastPhase) {
        //         this.setPhase(lastPhase);
        //     } else {
        //         this.setPhase(lastPhase, RightPanelStore.getSharedInstance().roomPanelPhaseParams);
        //     }
        // } else {
        //     // This toggles for us, if needed
        //     this.setPhase(RightPanelPhases.RoomSummary);
        // }
        this.setPhase(RightPanelPhases.RoomMemberList);

    };

    private onGroupInfoClicked = () => {
        this.setPhase(RightPanelPhases.RoomSummary)
    }

    private onNotificationsClicked = () => {
        // This toggles for us, if needed
        this.setPhase(RightPanelPhases.NotificationPanel);
    };

    private onRoomAppStoreClicked = () => {
        this.setPhase(RightPanelPhases.RoomAppStore);
    }

    private onPinnedMessagesClicked = () => {
        // This toggles for us, if needed
        this.setPhase(RightPanelPhases.PinnedMessages);
    };

    public renderButtons() {

        const buttons = (
            <>
                { this.props.rightRow }
                <PinnedMessagesHeaderButton
                    room={this.props.room}
                    isHighlighted={this.isPhase(RightPanelPhases.PinnedMessages)}
                    onClick={this.onPinnedMessagesClicked}
                />
                {
                    !this.isPrivateMessage && (
                        <>
                            <HeaderButton
                                name="appStoreButton"
                                title={'Group Marketplace'}
                                isHighlighted={this.isPhase(RightPanelPhases.RoomAppStore)}
                                onClick={this.onRoomAppStoreClicked}
                                analytics={['Right Panel', 'Group Marketplace Button', 'click']}
                            />
                            <HeaderButton
                                name="groupMembersButton"
                                title={"Active Members"}
                                isHighlighted={this.isPhase(RightPanelPhases.RoomMemberList) || this.isPhase(RightPanelPhases.RoomDonatorList)}
                                onClick={this.onGroupMembersListClicked}
                                analytics={['Right Panel', 'Group Members List Button', 'click']}
                            />
                        </>
                    )
                }
                
                {/* <HeaderButton
                    name="notifsButton"
                    title={_t('Notifications')}
                    isHighlighted={this.isPhase(RightPanelPhases.NotificationPanel)}
                    onClick={this.onNotificationsClicked}
                    analytics={['Right Panel', 'Notification List Button', 'click']}
                /> */}
                
                <HeaderButton
                    name="groupInfoButton"
                    title={'Group Info'}
                    isHighlighted={this.isPhase(RightPanelPhases.RoomSummary)}
                    onClick={this.onGroupInfoClicked}
                    analytics={['Right Panel', 'Group Info Button', 'click']}
                />            
            </>
        )

        const mobileButtonGroup = (
            <div className="dropdown">
                <input type="checkbox" id="mx_HeaderButtons_menu_checkbox" className="mx_HeaderButtons_menu_checkbox"/>
                <label className="dropdown__face" htmlFor="mx_HeaderButtons_menu_checkbox">
                    <div className="mx_HeaderButtons_menu_Button"></div>
                </label>
                <ul className="dropdown__items">
                    { buttons }
                </ul>
            </div>
        )
        return <>
            <div className="mx_HeaderButtons_web">
                { buttons }                
            </div>
            <div className="mx_HeaderButtons_mobile">
                { mobileButtonGroup }
            </div>
        </>;
    }
}
