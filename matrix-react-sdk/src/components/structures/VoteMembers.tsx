import React, {useEffect, useState} from "react"
import { mediaFromMxc } from "../../customisations/Media";
import { MatrixClientPeg } from "../../MatrixClientPeg"
import BaseAvatar from "../views/avatars/BaseAvatar"
const VoteMember = props => {
    const [avatarUrl, setAvatarUrl] = useState("")
    const [name, setName] = useState("");
    const cli = MatrixClientPeg.get();
    useEffect(() => {
        const getUserProfile = async() => {
            const profile = await cli.getProfileInfo(props.member.user_id);
            let avatar_url = profile['avatar_url'];
            avatar_url = avatar_url ? mediaFromMxc(avatar_url).getSquareThumbnailHttp(24) : null
            let name = profile['displayname'];
            setAvatarUrl(avatar_url);
            setName(name);
        }
        getUserProfile();
    }, [])
    return (
        <div>
            <div className="mx_AccessibleButton mx_EntityTile mx_EntityTile_online_beenactive">
                <div className="mx_EntityTile_avatar">
                    <BaseAvatar
                        name={name}
                        url={avatarUrl}
                        width={32}
                        height={32}
                        idName={props.member.user_id}
                    />
                </div>
                <div className="mx_EntityTile_details">
                    <div className="mx_EntityTile_name mx_Username_color2 bold">
                        {name}
                    </div>
                </div>
                <div className="mx_EntityTile_power">{props.member.vote_status?props.member.vote_status: false}</div>
            </div>
        </div>
    )
}

const VoteMembers = props => {
    return (
        <div>
            {
                props.members.length
                ?
                props.members.map((member, index) => {
                    return (
                        <VoteMember member={member}/>
                    )
                })
                :
                false
            }
        </div>
    )
}

export default VoteMembers