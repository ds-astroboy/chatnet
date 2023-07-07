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

import React, { useCallback, useState, useEffect, useContext, useMemo } from "react";
import classNames from "classnames";
import { Room } from "matrix-js-sdk/src/models/room";

import MatrixClientContext from "../../../contexts/MatrixClientContext";
import { useIsEncrypted } from '../../../hooks/useIsEncrypted';
import BaseCard, { Group } from "./BaseCard";
import { _t } from '../../../languageHandler';
import RoomAvatar from "../avatars/RoomAvatar";
import AccessibleButton from "../elements/AccessibleButton";
import defaultDispatcher from "../../../dispatcher/dispatcher";
import { Action } from "../../../dispatcher/actions";
import { RightPanelPhases } from "../../../stores/RightPanelStorePhases";
import { SetRightPanelPhasePayload } from "../../../dispatcher/payloads/SetRightPanelPhasePayload";
import Modal from "../../../Modal";
import ShareDialog from '../dialogs/ShareDialog';
import { useEventEmitter } from "../../../hooks/useEventEmitter";
import WidgetUtils from "../../../utils/WidgetUtils";
import { IntegrationManagers } from "../../../integrations/IntegrationManagers";
import SettingsStore from "../../../settings/SettingsStore";
import TextWithTooltip from "../elements/TextWithTooltip";
import WidgetAvatar from "../avatars/WidgetAvatar";
import AccessibleTooltipButton from "../elements/AccessibleTooltipButton";
import WidgetStore, { IApp } from "../../../stores/WidgetStore";
import { E2EStatus } from "../../../utils/ShieldUtils";
import RoomContext from "../../../contexts/RoomContext";
import { UIFeature } from "../../../settings/UIFeature";
import { ChevronFace, ContextMenuTooltipButton, useContextMenu } from "../../structures/ContextMenu";
import WidgetContextMenu from "../context_menus/WidgetContextMenu";
import { useRoomMemberCount } from "../../../hooks/useRoomMembers";
import { Container, MAX_PINNED, WidgetLayoutStore } from "../../../stores/widgets/WidgetLayoutStore";
import RoomName from "../elements/RoomName";
import UIStore from "../../../stores/UIStore";
import { getEventDisplayInfo } from '../../../utils/EventUtils';
import { EventType } from "matrix-js-sdk/src/@types/event";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import dis from '../../../dispatcher/dispatcher';
import { checkVerifiedUserOrRoom } from "../../../hooks/commonFuncs";
import RoomTopic from "../elements/RoomTopic";
import { AWARDS, BLOCKCHAINNETWORKS, EXClUSIVITY, GROUPAWARDS } from "../../../@variables/common";
import { useWeb3React } from "@web3-react/core";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAlert } from 'react-alert';
import { checkBarrierRooms, verifySoftBarrier } from "../../../apis";
import { BarrierType } from "../../../@types/barrier";
import { Connection } from "@solana/web3.js";
import { useSelector } from "react-redux";

interface IProps {
    room: Room;
    onClose(): void;
}

interface IAppsSectionProps {
    room: Room;
}

interface IButtonProps {
    className: string;
    onClick(): void;
}

const Button: React.FC<IButtonProps> = ({ children, className, onClick }) => {
    return <AccessibleButton
        className={classNames("mx_BaseCard_Button mx_RoomSummaryCard_Button", className)}
        onClick={onClick}
    >
        { children }
    </AccessibleButton>;
};

export const useWidgets = (room: Room) => {
    const [apps, setApps] = useState<IApp[]>(WidgetStore.instance.getApps(room.roomId));

    const updateApps = useCallback(() => {
        // Copy the array so that we always trigger a re-render, as some updates mutate the array of apps/settings
        setApps([...WidgetStore.instance.getApps(room.roomId)]);
    }, [room]);

    useEffect(updateApps, [room, updateApps]);
    useEventEmitter(WidgetStore.instance, room.roomId, updateApps);
    useEventEmitter(WidgetLayoutStore.instance, WidgetLayoutStore.emissionForRoom(room), updateApps);

    return apps;
};

interface IAppRowProps {
    app: IApp;
    room: Room;
}

const AppRow: React.FC<IAppRowProps> = ({ app, room }) => {
    const name = WidgetUtils.getWidgetName(app);
    const dataTitle = WidgetUtils.getWidgetDataTitle(app);
    const subtitle = dataTitle && " - " + dataTitle;

    const onOpenWidgetClick = () => {
        defaultDispatcher.dispatch<SetRightPanelPhasePayload>({
            action: Action.SetRightPanelPhase,
            phase: RightPanelPhases.Widget,
            refireParams: {
                widgetId: app.id,
            },
        });
    };

    const isPinned = WidgetLayoutStore.instance.isInContainer(room, app, Container.Top);
    const togglePin = isPinned
        ? () => { WidgetLayoutStore.instance.moveToContainer(room, app, Container.Right); }
        : () => { WidgetLayoutStore.instance.moveToContainer(room, app, Container.Top); };

    const [menuDisplayed, handle, openMenu, closeMenu] = useContextMenu<HTMLDivElement>();
    let contextMenu;
    if (menuDisplayed) {
        const rect = handle.current.getBoundingClientRect();
        contextMenu = <WidgetContextMenu
            chevronFace={ChevronFace.None}
            right={UIStore.instance.windowWidth - rect.right}
            bottom={UIStore.instance.windowHeight - rect.top}
            onFinished={closeMenu}
            app={app}
        />;
    }

    const cannotPin = !isPinned && !WidgetLayoutStore.instance.canAddToContainer(room, Container.Top);

    let pinTitle: string;
    if (cannotPin) {
        pinTitle = _t("You can only pin up to %(count)s widgets", { count: MAX_PINNED });
    } else {
        pinTitle = isPinned ? _t("Unpin") : _t("Pin");
    }

    const classes = classNames("mx_BaseCard_Button mx_RoomSummaryCard_Button", {
        mx_RoomSummaryCard_Button_pinned: isPinned,
    });

    return <div className={classes} ref={handle}>
        <AccessibleTooltipButton
            className="mx_RoomSummaryCard_icon_app"
            onClick={onOpenWidgetClick}
            // only show a tooltip if the widget is pinned
            title={isPinned ? _t("Unpin a widget to view it in this panel") : ""}
            forceHide={!isPinned}
            disabled={isPinned}
            yOffset={-48}
        >
            <WidgetAvatar app={app} />
            <span>{ name }</span>
            { subtitle }
        </AccessibleTooltipButton>

        <ContextMenuTooltipButton
            className="mx_RoomSummaryCard_app_options"
            isExpanded={menuDisplayed}
            onClick={openMenu}
            title={_t("Options")}
            yOffset={-24}
        />

        <AccessibleTooltipButton
            className="mx_RoomSummaryCard_app_pinToggle"
            onClick={togglePin}
            title={pinTitle}
            disabled={cannotPin}
            yOffset={-24}
        />

        { contextMenu }
    </div>;
};

const AppsSection: React.FC<IAppsSectionProps> = ({ room }) => {
    const apps = useWidgets(room);

    const onManageIntegrations = () => {
        const managers = IntegrationManagers.sharedInstance();
        if (!managers.hasManager()) {
            managers.openNoManagerDialog();
        } else {
            if (SettingsStore.getValue("feature_many_integration_managers")) {
                managers.openAll(room);
            } else {
                managers.getPrimaryManager().open(room);
            }
        }
    };

    let copyLayoutBtn = null;
    if (apps.length > 0 && WidgetLayoutStore.instance.canCopyLayoutToRoom(room)) {
        copyLayoutBtn = (
            <AccessibleButton kind="link" onClick={() => WidgetLayoutStore.instance.copyLayoutToRoom(room)}>
                { _t("Set my room layout for everyone") }
            </AccessibleButton>
        );
    }

    return <Group className="mx_RoomSummaryCard_appsGroup" title={_t("Widgets")}>
        { apps.map(app => <AppRow key={app.id} app={app} room={room} />) }
        { copyLayoutBtn }
        <AccessibleButton kind="link" onClick={onManageIntegrations}>
            { apps.length > 0 ? _t("Edit widgets, bridges & bots") : _t("Add widgets, bridges & bots") }
        </AccessibleButton>
    </Group>;
};

// const onRoomMembersClick = () => {
//     defaultDispatcher.dispatch<SetRightPanelPhasePayload>({
//         action: Action.SetRightPanelPhase,
//         phase: RightPanelPhases.RoomMemberList,
//     });
// };

const onRoomFilesClick = () => {
    defaultDispatcher.dispatch<SetRightPanelPhasePayload>({
        action: Action.SetRightPanelPhase,
        phase: RightPanelPhases.FilePanel,
    });
};

const onRoomSettingsClick = () => {
    defaultDispatcher.dispatch({ action: "open_room_settings" });
};

const onRoomBotsClick = () => {
    defaultDispatcher.dispatch({ action: "open_bots_settings" });
};

const RoomSummaryCard: React.FC<IProps> = ({ room, onClose }) => {
    const [wallet, setWallet] = useState(null);
    const [roomBarrierInfo, setRoomBarrierInfo] = useState(null);
    const [exclusivity, setExclusivity] = useState("Public");
    const alert = useAlert();

    const wallets = useSelector((state: any) => state.wallet.wallets);

    useEffect(() => {
        if(!room) return;
        (async() => {
            let roomBarrierInfo = await checkBarrierRooms(room.roomId);
            if(roomBarrierInfo) {
                let exclusivity = EXClUSIVITY[roomBarrierInfo.type];
                if(roomBarrierInfo.type === BarrierType.NFTCheck && !roomBarrierInfo["hard_barrier"]) {
                    exclusivity = EXClUSIVITY[BarrierType.NFTSoftBarrier]
                }
                setExclusivity(exclusivity);
            }
            setRoomBarrierInfo(roomBarrierInfo);
        })();
    }, [room])

    const verifyNftData = async(nft) => {
        console.log("nft:", nft);
        let names = nft.name.split("#");
        let id;
        if(names.length && names[1]) {
            id = `#${names[1]}`;
        }
        if(!id) return;
        const accessToken = MatrixClientPeg.get().getAccessToken();
        const txn = new Date().getMilliseconds();
        await verifySoftBarrier(room.roomId, id, txn, accessToken);
    }

    const showVerifyDialog = () => {
        const solanaWallet = wallets.find(wallet => wallet.type === "solana");
        const ethWallet = wallets.find(wallet => wallet.type === "ethereum");
        const aptoswallet = wallets.find(wallet => wallet.type === "aptos");
        let wallet = ethWallet;
        if(roomBarrierInfo.protocol === BLOCKCHAINNETWORKS.Solana) {
            wallet = solanaWallet;
        }
        if(roomBarrierInfo.protocol === BLOCKCHAINNETWORKS.Aptos) {
            wallet = aptoswallet;
        }
        dis.dispatch({
            action: "show_nft_check_dialog",
            wallet: wallet,
            getNftData: verifyNftData,
            searchCollectionAddress: roomBarrierInfo.nft_update_auth_addr,
            network: roomBarrierInfo.protocol
        })
    }

    const exclusivityOptions = useMemo(() => {
        if(!roomBarrierInfo) return <></>;
        if(roomBarrierInfo.type === BarrierType.NFTCheck && !roomBarrierInfo["hard_barrier"]) {
            return (
                <Button className="mx_RoomSummaryCard_icon_verifyOwnership" onClick={showVerifyDialog}>
                    { "Verify Ownership" }
                </Button>
            )
        }
        else return <></>;
    }, [roomBarrierInfo])

    const cli = useContext(MatrixClientContext);
    // const onShareRoomClick = () => {
    //     Modal.createTrackedDialog('share room dialog', '', ShareDialog, {
    //         target: room,
    //     });
    // };
    const events = room.getLiveTimeline().getEvents();
    let isEncryptedEvent = false;
    const myUserId = room.myUserId;
    const user = room.getMember(myUserId);
    let isAdmin = user.powerLevel === 100;
    let roomCreator;
    let isCreator = false;
    room.currentState.events.forEach((eventMap) => {
        eventMap.forEach((event)=> {
            if(event.getType() == "m.room.create") {
                roomCreator = event.getSender();
                isCreator = (roomCreator == myUserId)
            }
        })
    })
    let creator = MatrixClientPeg.get().getUser(roomCreator);
    events.map((event) => {
        const eventType = event.getType();
        const content = event.getContent();
        const msgtype = content.msgtype;
        // Info messages are basically information about commands processed on a room
        let isBubbleMessage = (
            
            (eventType === EventType.RoomMessage && msgtype && msgtype.startsWith("m.key.verification"))
        );
        if(isBubbleMessage) isEncryptedEvent = true;
    })

    // const isRoomEncrypted = (!!room.summaryHeroes || isEncryptedEvent);
    // const roomContext = useContext(RoomContext);
    // const e2eStatus = roomContext.e2eStatus;

    const alias = room.getCanonicalAlias() || room.getAltAliases()[0] || room.roomId;
    const isVerified = checkVerifiedUserOrRoom(room.roomId, room.name);
    let verifiedBadge;
    if(isVerified) {
        verifiedBadge = (
            <div className="mx_User_verified"></div>
        )
    }

    const onRoomSettingsClick = () => {
        defaultDispatcher.dispatch({ 
            action: "open_room_settings", 
            wallets, 
            alert 
        });
    };

    const memberNumber = room.getJoinedMemberCount();
    const header = <div className="d-flex flex-column justify-content-center align-items-center">
        <div className="mx_RoomSummaryCard_avatar" role="presentation">
            <RoomAvatar room={room} height={100} width={100} viewAvatarOnClick />
            {/* <TextWithTooltip
                tooltip={isRoomEncrypted ? _t("Encrypted") : _t("Not encrypted")}
                class={classNames("mx_RoomSummaryCard_e2ee", {
                    mx_RoomSummaryCard_e2ee_normal: isRoomEncrypted,
                    mx_RoomSummaryCard_e2ee_warning: !isRoomEncrypted,
                    mx_RoomSummaryCard_e2ee_verified: isRoomEncrypted,
                })}
            /> */}
        </div>

        <RoomName room={room}>
            { name => (
                <h2 title={name} className="mx_RoomSummaryCard_name bold">
                    <span>
                        { name }
                    </span>
                    { verifiedBadge }
                </h2>
            ) }
        </RoomName>
        <div className="mx_RoomSummaryCard_alias bubble bubble-white px-3 t-green py-1 mt-3" title={alias.replace("#", "@")}>
            { alias.replace("#", "@").replace(":main.cafeteria.gg", "") }
        </div>
        {/* <div className="mx_RoomSummaryCard_memberInfo mt-4 dark d-flex justify-content-center align-items-center">
            <div className="mx_RoomSummaryCard_donation mx-3">0 donations</div>
            <div className="mx_RoomSummaryCard_member mx-3">{`${memberNumber} members`}</div>
        </div> */}
        <div className="mx_RoomSummaryCard_joinedNumber"><span className="dark">{room.getJoinedMemberCount()}</span> <span className="grey">Members</span></div>
        <div className="mx_RoomSummaryCard_Membership_Section">
            <AccessibleTooltipButton 
                onClick={null}
                title="Membership Teir"
                className="mx_RoomSummaryCard_Membership_info mx-2"
            >
                <div className="mx_RoomSummaryCard_Membership_info_wrap d-flex align-items-center justify-content-center px-2">
                    <div className="mx_RoomSummaryCard_Membership_info_icon pro img-fill"></div>
                    <div className="mx_RoomSummaryCard_Membership_info_label mx-1 dark bold">Pro</div>
                </div>
            </AccessibleTooltipButton>
            <AccessibleTooltipButton
                onClick={null}
                title={"Chats will automatically delete after 90 Days"}
                className="mx_RoomSummaryCard_Membership_info mx-2"
            >
                <div className="mx_RoomSummaryCard_Membership_info_wrap d-flex align-items-center justify-content-center px-2">
                    <div className="mx_RoomSummaryCard_Membership_info_icon time img-fill"></div>
                    <div className="mx_RoomSummaryCard_Membership_info_label mx-1 dark bold">90 Days</div>
                </div>
            </AccessibleTooltipButton>
        </div>
    </div>;

    // const memberCount = useRoomMemberCount(room);
    let roomAwardsTootip = (
        <div className="mx_RoomSummaryCard_awardsGroup_item_tooltip">
            <div className="mx_RoomSummaryCard_awardsGroup_item_status">Non-tradable</div>
            <div>item 1 of 10</div>
        </div>
    )
    let canInvite = (!!room && !!room.canInvite(myUserId));
    const onInviteButtonClick = (): void => {
        if (MatrixClientPeg.get().isGuest()) {
            dis.dispatch({ action: 'require_registration' });
            return;
        }

        // call AddressPickerDialog
        dis.dispatch({
            action: 'view_invite',
            roomId: room.roomId,
        });
    };

    let inviteButton;
    if(canInvite) {
        inviteButton = (
            <Button className={`mx_RoomSummaryCard_icon_invite`} onClick={onInviteButtonClick}>
                { "Invite" }
            </Button>
        )
    }

    const roomInfoElement = <RoomTopic room={room}>
        {(topic, ref) => <div ref={ref} title={topic} dir="auto">
            {topic}
        </div>}
    </RoomTopic>;

    const groupAwards = <div className="mx_RoomSummaryCard_awardsGroup_items">
        {GROUPAWARDS.map((awardKey, index) => {
            let award = AWARDS[awardKey];
            const tooltip = (
                <div className="mx_RoomSummaryCard_awardsGroup_item_tooltip">
                    <div className="bold t-white">{award.name}</div>
                    <div className="mx_RoomSummaryCard_awardsGroup_item_status">Non-tradable</div>
                </div>
            )
            const classname = classNames("mx_RoomSummaryCard_awardsGroup_item", {
                "center": (index % 3 === 1)
            })
            return(
                <AccessibleTooltipButton
                    className={classname}
                    title="Group Award"
                    tooltip={tooltip}
                    onClick={null}
                    key={index}
                    alignment={3}
                >
                    <img src={award.logo}/>
                </AccessibleTooltipButton>
            )
        })}
    </div>    

    return (
        <BaseCard header={header} className="mx_RoomSummaryCard" onClose={onClose}>
            <Group title={"Info"} className="mx_RoomSummaryCard_infoGroup">
                {roomInfoElement}
            </Group>
            <Group title={"Exclusivity"} className="mx_RoomSummaryCard_exclusivity">
                <div>{exclusivity}</div>
                { exclusivityOptions }
            </Group>
            <Group title={"Group Awards"} className="mx_RoomSummaryCard_awardsGroup">
                {groupAwards}
            </Group>
            <Group title={_t("About")} className="mx_RoomSummaryCard_aboutGroup">
                {/* <Button className="mx_RoomSummaryCard_icon_people" onClick={onRoomMembersClick}>
                    { _t("%(count)s people", { count: memberCount }) }
                </Button> */}
                { inviteButton }
                <Button className="mx_RoomSummaryCard_icon_files" onClick={onRoomFilesClick}>
                    { "Show Files" }
                </Button>
                {/* <Button className="mx_RoomSummaryCard_icon_share" onClick={onShareRoomClick}>
                    { _t("Share room") }
                </Button> */}
                {
                    isCreator && (
                        <Button className="mx_RoomSummaryCard_icon_settings" onClick={onRoomSettingsClick}>
                            { "Group Settings" }
                        </Button>
                    )
                }
                {
                    isCreator ?
                        <Button className="mx_RoomSummaryCard_icon_bots" onClick={onRoomBotsClick}>
                            Bots &amp; Plugins
                        </Button>
                        :
                        false
                }
            </Group>
            {/* <Group title={"Useful Links"} className="mx_RoomSummaryCard_usefulLinksGroup">
                <Button className="mx_RoomSummaryCard_icon_vote" onClick={null}>
                    {`${creator.displayName} Governance Group`}
                </Button>
                <Button className="mx_RoomSummaryCard_icon_link" onClick={null}>
                    {"Tiktok"}
                </Button>
                <Button className="mx_RoomSummaryCard_icon_youtube" onClick={null}>
                    {"Youtube"}
                </Button>
                <Button className="mx_RoomSummaryCard_icon_instagram" onClick={null}>
                    {"Instagram"}
                </Button>                
            </Group> */}

            {/* { SettingsStore.getValue(UIFeature.Widgets) && <AppsSection room={room} /> } */}
        </BaseCard>
    )
};

export default RoomSummaryCard;
