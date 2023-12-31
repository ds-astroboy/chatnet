/*
Copyright 2017 New Vector Ltd.
Copyright 2018 Michael Telatynski <7t3chguy@gmail.com>
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
import PropTypes from 'prop-types';
import classNames from 'classnames';
import * as sdk from '../../../index';
import dis from '../../../dispatcher/dispatcher';
import { isOnlyCtrlOrCmdIgnoreShiftKeyEvent } from '../../../Keyboard';
import * as FormattingUtils from '../../../utils/FormattingUtils';

import FlairStore from '../../../stores/FlairStore';
import GroupStore from '../../../stores/GroupStore';
import GroupFilterOrderStore from '../../../stores/GroupFilterOrderStore';
import MatrixClientContext from "../../../contexts/MatrixClientContext";
import AccessibleButton from "./AccessibleButton";
import SettingsStore from "../../../settings/SettingsStore";
import { mediaFromMxc } from "../../../customisations/Media";
import { replaceableComponent } from "../../../utils/replaceableComponent";

// A class for a child of GroupFilterPanel (possibly wrapped in a DNDTagTile) that represents
// a thing to click on for the user to filter the visible rooms in the RoomList to:
//  - Rooms that are part of the group
//  - Direct messages with members of the group
// with the intention that this could be expanded to arbitrary tags in future.
@replaceableComponent("views.elements.TagTile")
export default class TagTile extends React.Component {
    static propTypes = {
        // A string tag such as "m.favourite" or a group ID such as "+groupid:domain.bla"
        // For now, only group IDs are handled.
        tag: PropTypes.string,
        contextMenuButtonRef: PropTypes.object,
        openMenu: PropTypes.func,
        menuDisplayed: PropTypes.bool,
        selected: PropTypes.bool,
    };

    static contextType = MatrixClientContext;

    state = {
        // Whether the mouse is over the tile
        hover: false,
        // The profile data of the group if this.props.tag is a group ID
        profile: null,
    };

    componentDidMount() {
        this.unmounted = false;
        if (this.props.tag[0] === '+') {
            FlairStore.addListener('updateGroupProfile', this._onFlairStoreUpdated);
            this._onFlairStoreUpdated();
            // New rooms or members may have been added to the group, fetch async
            this._refreshGroup(this.props.tag);
        }
    }

    componentWillUnmount() {
        this.unmounted = true;
        if (this.props.tag[0] === '+') {
            FlairStore.removeListener('updateGroupProfile', this._onFlairStoreUpdated);
        }
    }

    _onFlairStoreUpdated = () => {
        if (this.unmounted) return;
        FlairStore.getGroupProfileCached(
            this.context,
            this.props.tag,
        ).then((profile) => {
            if (this.unmounted) return;
            this.setState({ profile });
        }).catch((err) => {
            console.warn('Could not fetch group profile for ' + this.props.tag, err);
        });
    };

    _refreshGroup(groupId) {
        GroupStore.refreshGroupRooms(groupId);
        GroupStore.refreshGroupMembers(groupId);
    }

    onClick = e => {
        e.preventDefault();
        e.stopPropagation();
        dis.dispatch({
            action: 'select_tag',
            tag: this.props.tag,
            ctrlOrCmdKey: isOnlyCtrlOrCmdIgnoreShiftKeyEvent(e),
            shiftKey: e.shiftKey,
        });
        if (this.props.tag[0] === '+') {
            // New rooms or members may have been added to the group, fetch async
            this._refreshGroup(this.props.tag);
        }
    };

    onMouseOver = () => {
        if (SettingsStore.getValue("feature_communities_v2_prototypes")) return;
        this.setState({ hover: true });
    };

    onMouseLeave = () => {
        this.setState({ hover: false });
    };

    openMenu = e => {
        // Prevent the TagTile onClick event firing as well
        e.stopPropagation();
        e.preventDefault();
        if (SettingsStore.getValue("feature_communities_v2_prototypes")) return;
        this.setState({ hover: false });
        this.props.openMenu();
    };

    render() {
        const BaseAvatar = sdk.getComponent('avatars.BaseAvatar');
        const profile = this.state.profile || {};
        const name = profile.name || this.props.tag;
        const avatarSize = 32;

        const httpUrl = profile.avatarUrl
            ? mediaFromMxc(profile.avatarUrl).getSquareThumbnailHttp(avatarSize)
            : null;

        const isPrototype = SettingsStore.getValue("feature_communities_v2_prototypes");
        const className = classNames({
            mx_TagTile: true,
            mx_TagTile_prototype: isPrototype,
            mx_TagTile_selected: this.props.selected && !isPrototype,
            mx_TagTile_selected_prototype: this.props.selected && isPrototype,
        });

        const badge = GroupFilterOrderStore.getGroupBadge(this.props.tag);
        let badgeElement;
        if (badge && !this.state.hover && !this.props.menuDisplayed) {
            const badgeClasses = classNames({
                "mx_TagTile_badge": true,
                "mx_TagTile_badgeHighlight": badge.highlight,
            });
            badgeElement = (<div className={badgeClasses}>{ FormattingUtils.formatCount(badge.count) }</div>);
        }

        const contextButton = this.state.hover || this.props.menuDisplayed ?
            <AccessibleButton
                className="mx_TagTile_context_button"
                onClick={this.openMenu}
                inputRef={this.props.contextMenuButtonRef}
            >
                { "\u00B7\u00B7\u00B7" }
            </AccessibleButton> : <div ref={this.props.contextMenuButtonRef} />;

        const AccessibleTooltipButton = sdk.getComponent("elements.AccessibleTooltipButton");

        return <AccessibleTooltipButton
            className={className}
            onClick={this.onClick}
            onContextMenu={this.openMenu}
            title={name}
        >
            <div
                className="mx_TagTile_avatar"
                onMouseOver={this.onMouseOver}
                onMouseLeave={this.onMouseLeave}
            >
                <BaseAvatar
                    name={name}
                    idName={this.props.tag}
                    url={httpUrl}
                    width={avatarSize}
                    height={avatarSize}
                />
                { contextButton }
                { badgeElement }
            </div>
        </AccessibleTooltipButton>;
    }
}
