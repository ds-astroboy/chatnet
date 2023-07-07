/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd
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

import React from 'react';
import AccessibleButton from '../elements/AccessibleButton';
import { _td } from '../../../languageHandler';
import classNames from "classnames";
import E2EIcon from './E2EIcon';
import { replaceableComponent } from "../../../utils/replaceableComponent";
import BaseAvatar from '../avatars/BaseAvatar';
import PresenceLabel from "./PresenceLabel";
import { getUserNameColorClass } from '../../../utils/FormattingUtils';
import UserRoleBadge from './UserRoleBadge';
import { checkVerifiedUserOrRoom } from '../../../hooks/commonFuncs';
import DomainNameCheckContainer from '../../structures/DomainNameCheckContainer';
import VerifiedCheckContainer from '../../structures/VerifiedCheckContainer';
const adminBadge = require("../../../../res/img/admin-crown.png");
const modBadge = require("../../../../res/img/mod-star.png");

export enum PowerStatus {
    Admin = "admin",
    Moderator = "moderator",
    Team = "team",
}

const PowerLabel: Record<PowerStatus, string> = {
    [PowerStatus.Admin]: _td("Admin"),
    [PowerStatus.Moderator]: _td("Mod"),
    [PowerStatus.Team]: "Team",
};

const PRESENCE_CLASS = {
    "offline": "mx_EntityTile_offline",
    "online": "mx_EntityTile_online",
    "unavailable": "mx_EntityTile_unavailable",
};

function presenceClassForMember(presenceState: string, lastActiveAgo: number, showPresence: boolean): string {
    if (showPresence === false) {
        return 'mx_EntityTile_online_beenactive';
    }

    // offline is split into two categories depending on whether we have
    // a last_active_ago for them.
    if (presenceState === 'offline') {
        if (lastActiveAgo) {
            return PRESENCE_CLASS['offline'] + '_beenactive';
        } else {
            return PRESENCE_CLASS['offline'] + '_neveractive';
        }
    } else if (presenceState) {
        return PRESENCE_CLASS[presenceState];
    } else {
        return PRESENCE_CLASS['offline'] + '_neveractive';
    }
}

interface IProps {
    name?: string;
    title?: string;
    avatarJsx?: JSX.Element; // <BaseAvatar />
    className?: string;
    presenceState?: string;
    presenceLastActiveAgo?: number;
    presenceLastTs?: number;
    presenceCurrentlyActive?: boolean;
    showInviteButton?: boolean;
    onClick?(): void;
    suppressOnHover?: boolean;
    showPresence?: boolean;
    subtextLabel?: string;
    e2eStatus?: string;
    powerStatus?: PowerStatus;
    userId?: string;
    showBadge?: boolean;
    roomId?: string;
}

interface IState {
    hover: boolean;
}

@replaceableComponent("views.rooms.EntityTile")
export default class EntityTile extends React.PureComponent<IProps, IState> {
    static defaultProps = {
        onClick: () => {},
        presenceState: "offline",
        presenceLastActiveAgo: 0,
        presenceLastTs: 0,
        showInviteButton: false,
        suppressOnHover: false,
        showPresence: true,
    };

    constructor(props: IProps) {
        super(props);

        this.state = {
            hover: false,
        };
    }

    render() {

        const mainClassNames = {
            "mx_EntityTile": true,
            "mx_EntityTile_noHover": this.props.suppressOnHover,
        };
        const userNameColor = getUserNameColorClass(this.props.userId);
        if (this.props.className) mainClassNames[this.props.className] = true;

        const presenceClass = presenceClassForMember(
            this.props.presenceState, this.props.presenceLastActiveAgo, this.props.showPresence,
        );
        mainClassNames[presenceClass] = true;

        let nameEl;
        const { name } = this.props;

        if (!this.props.suppressOnHover) {
            const activeAgo = this.props.presenceLastActiveAgo ?
                (Date.now() - (this.props.presenceLastTs - this.props.presenceLastActiveAgo)) : -1;

            let presenceLabel = null;
            if (this.props.showPresence) {
                presenceLabel = <PresenceLabel activeAgo={activeAgo}
                    currentlyActive={this.props.presenceCurrentlyActive}
                    presenceState={this.props.presenceState} />;
            }
            if (this.props.subtextLabel) {
                presenceLabel = <span className="mx_EntityTile_subtext">{ this.props.subtextLabel }</span>;
            }
            const nameClassName = classNames(
                "mx_EntityTile_name",
                userNameColor,
                "bold",
            )
            // const isVerified = checkVerifiedUserOrRoom(this.props.userId, name);
            // let verifiedBadge;
            // if(isVerified) {
            //     verifiedBadge = <div className='mx_User_verified'></div>
            // }
            nameEl = (
                <div className="mx_EntityTile_details">
                    <VerifiedCheckContainer className={nameClassName} isUser={true} id={this.props.userId} roomId={this.props.roomId}>
                        <DomainNameCheckContainer userId={this.props.userId}>
                            { name }
                        </DomainNameCheckContainer>
                        {/* { verifiedBadge } */}
                    </VerifiedCheckContainer>
                    { presenceLabel }
                </div>
            );
        } else if (this.props.subtextLabel) {
            nameEl = (
                <div className="mx_EntityTile_details">
                    <div className={`mx_EntityTile_name ${userNameColor} bold`} dir="auto">
                        <DomainNameCheckContainer userId={this.props.userId}>
                            { name }
                        </DomainNameCheckContainer>
                    </div>
                    <span className="mx_EntityTile_subtext">{ this.props.subtextLabel }</span>
                </div>
            );
        } else {
            nameEl = (
                <div className={`mx_EntityTile_name ${userNameColor} bold`} dir="auto">
                    <DomainNameCheckContainer userId={this.props.userId}>
                        { name }
                    </DomainNameCheckContainer>
                </div>
            );
        }

        let inviteButton;
        if (this.props.showInviteButton) {
            inviteButton = (
                <div className="mx_EntityTile_invite">
                    <img src={require("../../../../res/img/plus.svg")} width="16" height="16" />
                </div>
            );
        }

        let powerLabel;
        const powerStatus = this.props.powerStatus;
        let powerText
        if (powerStatus) {
            powerText = PowerLabel[powerStatus] === "Admin" ? "Creator": PowerLabel[powerStatus];
            powerLabel = <div className="mx_EntityTile_power">{ powerText }</div>;
        }

        // let e2eIcon;
        // const { e2eStatus } = this.props;
        // if (e2eStatus) {
        //     e2eIcon = <E2EIcon status={e2eStatus} isUser={true} bordered={true} />;
        // }

        const av = this.props.avatarJsx ||
            <BaseAvatar name={this.props.name} width={36} height={36} aria-hidden="true" />;
        let badge;
        if(powerText == "Admin") {
            badge = <UserRoleBadge img={adminBadge}/>
        }
        else if(powerText == "Mod") {
            badge = <UserRoleBadge img={modBadge}/>
        }
        // The wrapping div is required to make the magic mouse listener work, for some reason.
        return (
            <div>
                <AccessibleButton
                    className={classNames(mainClassNames)}
                    // title={this.props.title}
                    onClick={this.props.onClick}
                >
                    <div className="mx_EntityTile_avatar">
                        { av }
                        {/* { e2eIcon } */}
                        {/* { 
                            this.props.showBadge
                            ?
                            badge 
                            :
                            false
                        } */}
                    </div>
                    { nameEl }
                    { powerLabel }
                    { inviteButton }
                </AccessibleButton>
            </div>
        );
    }
}
