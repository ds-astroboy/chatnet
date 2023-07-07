/*
Copyright 2019 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

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
import GeneralUserSettingsTab from "../settings/tabs/user/GeneralUserSettingsTab";
import SettingsStore, { CallbackFn } from "../../../settings/SettingsStore";
import AppearanceUserSettingsTab from "../settings/tabs/user/AppearanceUserSettingsTab";
import AdvancedUserSettingsTab from '../settings/tabs/user/AdvancedUserSettingsTab';
import { replaceableComponent } from "../../../utils/replaceableComponent";
import BaseDialog from "./BaseDialog";
import TradesTransactionsDialog from '../settings/tabs/transaction/TradesTransactionDialog';
import GeneralTransactionsDialog from '../settings/tabs/transaction/GeneralTransactionsDialog';

export enum UserTab {    
    Trades = "USER_TRADES_TAB",
    General = "USER_GENERAL_TAB",
}

interface IProps {
    onFinished: (success: boolean) => void;
    initialTabId?: string;
    wallet?: any;
    connection?: any;
}

interface IState {
    mjolnirEnabled: boolean;
}

@replaceableComponent("views.dialogs.UserTransactionsDialog")
export default class UserTransactionsDialog extends React.Component<IProps, IState> {
    private mjolnirWatcher: string;

    constructor(props) {
        super(props);

        this.state = {
            mjolnirEnabled: SettingsStore.getValue("feature_mjolnir"),
        };
    }

    public componentDidMount(): void {
        this.mjolnirWatcher = SettingsStore.watchSetting("feature_mjolnir", null, this.mjolnirChanged);
    }

    public componentWillUnmount(): void {
        SettingsStore.unwatchSetting(this.mjolnirWatcher);
    }

    private mjolnirChanged: CallbackFn = (settingName, roomId, atLevel, newValue) => {
        // We can cheat because we know what levels a feature is tracked at, and how it is tracked
        this.setState({ mjolnirEnabled: newValue });
    };
    private getTabs() {
        const tabs = [];
        tabs.push(new Tab(
            UserTab.General,
            _t("General"),
            "mx_UserTransactionsDialog_generalIcon",
            <GeneralTransactionsDialog />,
        ));
        tabs.push(new Tab(
            UserTab.Trades,
            _t("Trades"),
            "mx_UserTransactionsDialog_tradesIcon",
            <TradesTransactionsDialog />,
        ));
        return tabs;
    }

    render() {
        return (
            <BaseDialog
                className='mx_UserSettingsDialog'
                hasCancel={true}
                onFinished={this.props.onFinished}
                title={_t("My Transactions")}
            >
                <div className='mx_SettingsDialog_content'>
                    <TabbedView tabs={this.getTabs()} initialTabId={this.props.initialTabId}/>
                </div>
            </BaseDialog>
        );
    }
}
