import React, {FC, useEffect, useState} from 'react';
import { getUserStatus } from '../../../apis';
import AccessibleTooltipButton from '../elements/AccessibleTooltipButton';

interface IProps {
    memberId?: string;
    accessToken: string;
}

const RoomHeaderCustomStatus: FC<IProps> = ({ memberId, accessToken }) => {
    const [userStatus, setUserStatus] = useState("");

    useEffect(() => {
        if(memberId) {
            getInitialStatus();
        }
    }, [])

    const getInitialStatus = async() => {
        let userStatus = await getUserStatus(accessToken ,memberId);
        if(userStatus) {
            setUserStatus(userStatus);
        }
    }

    return (
        <div className='mx_RoomHeader_subtitle'>
            <AccessibleTooltipButton
                className="mx_RoomHeader_subtitle_private_icon"
                onClick={null}
                title={"Messages in this room are end-to-end encrypted."}
            >
            </AccessibleTooltipButton>
            <div className='mx_RoomHeader_subtitle_history'>{ userStatus }</div>
        </div>
    )
}

export default RoomHeaderCustomStatus