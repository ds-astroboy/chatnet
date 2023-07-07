/*
Copyright 2019 New Vector Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
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
import TabbedView, { Tab } from "../../structures/TabbedView";
import { _t, _td } from "../../../languageHandler";
import AdvancedRoomSettingsTab from "../settings/tabs/room/AdvancedRoomSettingsTab";
import RolesRoomSettingsTab from "../settings/tabs/room/RolesRoomSettingsTab";
import GeneralRoomSettingsTab from "../settings/tabs/room/GeneralRoomSettingsTab";
import RoomBotsSettingsTab from "../settings/tabs/room/RoomBotsSettingsTab";
import SecurityRoomSettingsTab from "../settings/tabs/room/SecurityRoomSettingsTab";
import NotificationSettingsTab from "../settings/tabs/room/NotificationSettingsTab";
import BridgeSettingsTab from "../settings/tabs/room/BridgeSettingsTab";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import dis from "../../../dispatcher/dispatcher";
import SettingsStore from "../../../settings/SettingsStore";
import { UIFeature } from "../../../settings/UIFeature";
import { replaceableComponent } from "../../../utils/replaceableComponent";
import BaseDialog from "./BaseDialog";

export const ROOM_GENERAL_TAB = "ROOM_GENERAL_TAB";
export const ROOM_SECURITY_TAB = "ROOM_SECURITY_TAB";
export const ROOM_ROLES_TAB = "ROOM_ROLES_TAB";
export const ROOM_NOTIFICATIONS_TAB = "ROOM_NOTIFICATIONS_TAB";
export const ROOM_BRIDGES_TAB = "ROOM_BRIDGES_TAB";
export const ROOM_ADVANCED_TAB = "ROOM_ADVANCED_TAB";

interface IProps {
    roomId: string;
    onFinished: (success: boolean) => void;
    initialTabId?: string;
}

@replaceableComponent("views.dialogs.RoomSettingsDialog")
export default class RoomSettingsDialog extends React.Component<IProps> {
    private dispatcherRef: string;

    public componentDidMount() {
        this.dispatcherRef = dis.register(this.onAction);
    }

    public componentWillUnmount() {
        if (this.dispatcherRef) {
            dis.unregister(this.dispatcherRef);
        }
    }

    private onAction = (payload): void => {
        // When view changes below us, close the room settings
        // whilst the modal is open this can only be triggered when someone hits Leave Room
        if (payload.action === 'view_home_page') {
            this.props.onFinished(true);
        }
    };

    private getTabs(): Tab[] {
        const tabs: Tab[] = [];

        tabs.push(new Tab(
            ROOM_GENERAL_TAB,
            _td("General"),
            "mx_RoomSettingsDialog_settingsIcon",
            <RoomBotsSettingsTab roomId={this.props.roomId} />,
        ));

        return tabs;
    }

    render() {
        const roomName = MatrixClientPeg.get().getRoom(this.props.roomId).name;
        return (
            <BaseDialog
                className='mx_RoomSettingsDialog'
                hasCancel={true}
                onFinished={this.props.onFinished}
                title={`Bots & Plugins Settings - ${roomName}`}
            >
                <div className='mx_SettingsDialog_content'>
                    <TabbedView
                        tabs={this.getTabs()}
                        initialTabId={this.props.initialTabId}
                    />
                </div>
            </BaseDialog>
        );
    }
}