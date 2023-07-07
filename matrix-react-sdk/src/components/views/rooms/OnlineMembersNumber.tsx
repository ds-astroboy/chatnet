import { Room, RoomMember } from "matrix-js-sdk";
import React, {useEffect, useState} from "react";
import { MatrixClientPeg } from "../../../MatrixClientPeg";

interface OnlineMembersNumberProps {
    room: Room
}

const OnlineMembersNumber = (props: OnlineMembersNumberProps) => {
    const [onlineNumber, setOnlineNumber] = useState(0);
    const myId = props.room.myUserId;
    const cli = MatrixClientPeg.get();

    useEffect(() => {
        onPresenceUpdate();
        const members = props.room.getJoinedMembers(); 
        members.map((member: RoomMember) => {
            cli.getUser(member.userId).on("User.currentlyActive", onPresenceUpdate)
            cli.getUser(member.userId).on("User.presence", onPresenceUpdate)
        })

        return () => {
            members.map((member: RoomMember) => {
                cli.getUser(member.userId).off("User.currentlyActive", onPresenceUpdate)
                cli.getUser(member.userId).off("User.presence", onPresenceUpdate)
            })
        }
    }, [])

    const onPresenceUpdate = () => {
        const members = props.room.getJoinedMembers();
        let count = 0
        let isJoin = false;
        members.map((member: RoomMember) => {
            if(member.user?.presence == "online" && myId != member.userId) {
                count ++;
            }
            if(myId == member.userId) {
                isJoin = true;
            }
        })
        if(isJoin) count ++;
        setOnlineNumber(count);
    }   

    return <span>{onlineNumber}</span>;
}

export default OnlineMembersNumber