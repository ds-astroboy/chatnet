/*
Copyright 2019 New Vector Ltd
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

import React from 'react';
import { _t } from "../../../../../languageHandler";
import SdkConfig from "../../../../../SdkConfig";
import { MatrixClientPeg } from '../../../../../MatrixClientPeg';
import SettingsStore from "../../../../../settings/SettingsStore";
import { enumerateThemes } from "../../../../../theme";
import ThemeWatcher from "../../../../../settings/watchers/ThemeWatcher";
import Slider from "../../../elements/Slider";
import AccessibleButton from "../../../elements/AccessibleButton";
import dis from "../../../../../dispatcher/dispatcher";
import { FontWatcher } from "../../../../../settings/watchers/FontWatcher";
import { RecheckThemePayload } from '../../../../../dispatcher/payloads/RecheckThemePayload';
import { Action } from '../../../../../dispatcher/actions';
import { IValidationResult, IFieldState } from '../../../elements/Validation';
import StyledCheckbox from '../../../elements/StyledCheckbox';
import SettingsFlag from '../../../elements/SettingsFlag';
import Field from '../../../elements/Field';
import EventTilePreview from '../../../elements/EventTilePreview';
import StyledRadioGroup from "../../../elements/StyledRadioGroup";
import { SettingLevel } from "../../../../../settings/SettingLevel";
import { UIFeature } from "../../../../../settings/UIFeature";
import { Layout } from "../../../../../settings/Layout";
import classNames from 'classnames';
import StyledRadioButton from '../../../elements/StyledRadioButton';
import { replaceableComponent } from "../../../../../utils/replaceableComponent";
import { compare } from "../../../../../utils/strings";

interface IProps {
}

interface IThemeState {
    theme: string;
    useSystemTheme: boolean;
}

export interface CustomThemeMessage {
    isError: boolean;
    text: string;
}

interface IState extends IThemeState {
    // String displaying the current selected fontSize.
    // Needs to be string for things like '17.' without
    // trailing 0s.
    fontSize: string;
    customThemeUrl: string;
    customThemeMessage: CustomThemeMessage;
    useCustomFontSize: boolean;
    useSystemFont: boolean;
    systemFont: string;
    showAdvanced: boolean;
    layout: Layout;
    // User profile data for the message preview
    userId: string;
    displayName: string;
    avatarUrl: string;
}

@replaceableComponent("views.settings.tabs.user.AdvancedUserSettingsTab")
export default class AdvancedUserSettingsTab extends React.Component<IProps, IState> {
    private readonly MESSAGE_PREVIEW_TEXT = _t("Hey you. You're the best!");

    private unmounted = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            fontSize: (SettingsStore.getValue("baseFontSize", null) + FontWatcher.SIZE_DIFF).toString(),
            ...this.calculateThemeState(),
            customThemeUrl: "",
            customThemeMessage: { isError: false, text: "" },
            useCustomFontSize: SettingsStore.getValue("useCustomFontSize"),
            useSystemFont: SettingsStore.getValue("useSystemFont"),
            systemFont: SettingsStore.getValue("systemFont"),
            showAdvanced: false,
            layout: SettingsStore.getValue("layout"),
            userId: MatrixClientPeg.get().getUserId(),
            displayName: MatrixClientPeg.get().getUser(MatrixClientPeg.get().getUserId()).displayName,
            avatarUrl: MatrixClientPeg.get().getUser(MatrixClientPeg.get().getUserId()).avatarUrl,
        };
    }

    async componentDidMount() {
        // Fetch the current user profile for the message preview
        const client = MatrixClientPeg.get();
        const userId = client.getUserId();
        const profileInfo = await client.getProfileInfo(userId);
        if (this.unmounted) return;

        this.setState({
            userId,
            displayName: profileInfo.displayname,
            avatarUrl: profileInfo.avatar_url,
        });
    }

    componentWillUnmount() {
        this.unmounted = true;
    }

    private calculateThemeState(): IThemeState {
        // We have to mirror the logic from ThemeWatcher.getEffectiveTheme so we
        // show the right values for things.

        const themeChoice: string = SettingsStore.getValue("theme");
        const systemThemeExplicit: boolean = SettingsStore.getValueAt(
            SettingLevel.DEVICE, "use_system_theme", null, false, true);
        const themeExplicit: string = SettingsStore.getValueAt(
            SettingLevel.DEVICE, "theme", null, false, true);

        // If the user has enabled system theme matching, use that.
        if (systemThemeExplicit) {
            return {
                theme: themeChoice,
                useSystemTheme: true,
            };
        }

        // If the user has set a theme explicitly, use that (no system theme matching)
        if (themeExplicit) {
            return {
                theme: themeChoice,
                useSystemTheme: false,
            };
        }

        // Otherwise assume the defaults for the settings
        return {
            theme: themeChoice,
            useSystemTheme: SettingsStore.getValueAt(SettingLevel.DEVICE, "use_system_theme"),
        };
    }

    private onIRCLayoutChange = (enabled: boolean) => {
        if (enabled) {
            this.setState({ layout: Layout.IRC });
            SettingsStore.setValue("layout", null, SettingLevel.DEVICE, Layout.IRC);
        } else {
            this.setState({ layout: Layout.Group });
            SettingsStore.setValue("layout", null, SettingLevel.DEVICE, Layout.Group);
        }
    };

    private renderFontSection() {
        return <div className="mx_SettingsTab_section mx_AppearanceUserSettingsTab_fontScaling">

            <span className="mx_SettingsTab_subheading">{ _t("Font size") }</span>
            <EventTilePreview
                className="mx_AppearanceUserSettingsTab_fontSlider_preview"
                message={this.MESSAGE_PREVIEW_TEXT}
                layout={this.state.layout}
                userId={this.state.userId}
                displayName={this.state.displayName}
                avatarUrl={this.state.avatarUrl}
            />
        </div>;
    }

    private renderAdvancedSection() {
        if (!SettingsStore.getValue(UIFeature.AdvancedSettings)) return null;

        const brand = SdkConfig.get().brand;
        let advanced: React.ReactNode;

        const tooltipContent = _t(
            "Set the name of a font installed on your system & %(brand)s will attempt to use it.",
            { brand },
        );
        advanced = <>
            <SettingsFlag
                name="useCompactLayout"
                level={SettingLevel.DEVICE}
                useCheckbox={true}
                disabled={this.state.layout !== Layout.Group}
            />

            { !SettingsStore.getValue("feature_new_layout_switcher") ?
                <StyledCheckbox
                    checked={this.state.layout == Layout.IRC}
                    onChange={(ev) => this.onIRCLayoutChange(ev.target.checked)}
                >
                    { _t("Enable experimental, compact IRC style layout") }
                </StyledCheckbox> : null
            }

            <SettingsFlag
                name="useSystemFont"
                level={SettingLevel.DEVICE}
                useCheckbox={true}
                onChange={(checked) => this.setState({ useSystemFont: checked })}
            />
            <Field
                className="mx_AppearanceUserSettingsTab_systemFont"
                label={SettingsStore.getDisplayName("systemFont")}
                onChange={(value) => {
                    this.setState({
                        systemFont: value.target.value,
                    });

                    SettingsStore.setValue("systemFont", null, SettingLevel.DEVICE, value.target.value);
                }}
                tooltipContent={tooltipContent}
                forceTooltipVisible={true}
                disabled={!this.state.useSystemFont}
                value={this.state.systemFont}
            />
        </>;
        return <div className="mx_SettingsTab_section mx_AppearanceUserSettingsTab_Advanced">
            { advanced }
        </div>;
    }

    render() {
        const brand = SdkConfig.get().brand;

        return (
            <div className="mx_SettingsTab mx_AppearanceUserSettingsTab">
                <div className="mx_SettingsTab_heading">{ _t("Customise your appearance") }</div>
                <div className="mx_SettingsTab_SubHeading">
                    { _t("Advanced Settings only affect this %(brand)s session.", { brand }) }
                </div>
                { this.renderFontSection() }
                { this.renderAdvancedSection() }
            </div>
        );
    }
}
