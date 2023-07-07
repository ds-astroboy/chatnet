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

import React from 'react';
import PropTypes from 'prop-types';
import { _t } from "../../../../../languageHandler";
import RoomProfileSettings from "../../../room_settings/RoomProfileSettings";
import * as sdk from "../../../../..";
import AccessibleButton from "../../../elements/AccessibleButton";
import dis from "../../../../../dispatcher/dispatcher";
import MatrixClientContext from "../../../../../contexts/MatrixClientContext";
import SettingsStore from "../../../../../settings/SettingsStore";
import { UIFeature } from "../../../../../settings/UIFeature";
import { replaceableComponent } from "../../../../../utils/replaceableComponent";
import LabelledToggleSwitch from '../../../elements/LabelledToggleSwitch';
import axios from 'axios';

@replaceableComponent("views.settings.tabs.room.RoomBotsSettingsTab")
export default class RoomBotsSettingsTab extends React.Component {
    static propTypes = {
        roomId: PropTypes.string.isRequired,
    };

    static contextType = MatrixClientContext;

    constructor() {
        super();

        this.state = {
            isVerificationBotPurchased: false,
            isVerificationBotEnabled: false
        };

        this.onVerificationBotSettingChange = this.onVerificationBotSettingChange.bind(this)
    }

    componentDidMount() {
        this.getRoomHasVerificationPurchased(this.props.roomId)
    }

    async getRoomHasVerificationPurchased(roomId) {
        // Database check if room has verification bot activated
        var purchased;
        var enabled;

        const roomVerificationBotEnabled = await axios.get(
            `https://node-main.cafeteria.gg/v1/bots/humanVerificationBot/${roomId}/getBotEnabled`,
            { validateStatus: false } // Accept 404 as a response code
        )
        if (roomVerificationBotEnabled.status == 200){
            purchased = true
            enabled = roomVerificationBotEnabled.data
        } else {
            purchased = enabled = false
        }

        this.setState({ isVerificationBotPurchased: purchased, isVerificationBotEnabled: enabled });
        console.log(this.state)
    }

    async onVerificationBotSettingChange(props) {
        const authData = JSON.parse(window.localStorage.getItem("mx_userData"));
        const auth = authData.username + ':' + authData.password
        var base64encodedData = Buffer.from(auth).toString('base64');

        const toggleVerificationBot = await axios.get(
            `https://node-main.cafeteria.gg/v1/bots/humanVerificationBot/${this.props.roomId}/toggleVerificationBot`,
            { validateStatus: false, headers: {"Authorization": `Basic ${base64encodedData}`} } // Accept 404 as a response code
        )
        if (toggleVerificationBot.status == 200){
            this.setState({ isVerificationBotEnabled: toggleVerificationBot.data.enabled })
        }
    }

    render() {
        let tooltipLabel = "";
        if(!this.state.isVerificationBotPurchased) {
            tooltipLabel = "Purchase in Group Marketplace";
        }
        return (
            <div className="mx_SettingsTab mx_GeneralRoomSettingsTab">
                <div className="mx_SettingsTab_heading">Bots &amp; Plugins</div>

                {/* <span className='mx_SettingsTab_subheading'>Human Verification Plugin</span> */}
                <div className='mx_SettingsTab_section'>
                    <span className="mx_SettingsTab_subheading">Human Verification Plugin</span>
                    <LabelledToggleSwitch
                        label="Do your group members need to be human-verified before they are able to chat?"
                        onChange={this.onVerificationBotSettingChange}
                        value={this.state.isVerificationBotEnabled}
                        disabled={!this.state.isVerificationBotPurchased}
                        className="mx_SettingsTab_VerificationBotSettingToggle"
                        tooltipLabel={tooltipLabel}
                    />
                </div>
            </div>
        );
    }
}