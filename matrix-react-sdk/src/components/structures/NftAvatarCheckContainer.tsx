import React, { FC, useState, useEffect, useMemo } from "react";
import BaseAvatar from "../views/avatars/BaseAvatar";
import classNames from "classnames";

import { useSelector, useDispatch } from "react-redux";
import { getMatrixUserInfoById } from "../../apis";
import reduxActions from "../../redux/actions";

interface IProps {
    userId: string;
    children: any
}

const NftAvatarCheckContainer: FC<IProps> = (props) => {
    const [isNftAvatar, setIsNftAvatar] = useState(false);
    const usersInfo = useSelector((state: any) => state.users.usersInfo);
    const dispatch = useDispatch();

    useEffect(() => {
        ;(async () => {
            let userId = props.userId;
            if(!userId) return;
    
            if(usersInfo && usersInfo[userId]) {
                setIsNftAvatar(usersInfo[userId]?.nft_avatar_used);
            }
            else {
                const {success, data} = await getMatrixUserInfoById(userId);
                if(!success) return;
                setIsNftAvatar(data?.nft_avatar_used);
                dispatch(
                    reduxActions.usersActions.addUser(userId, data)
                );
            }
        })();
    }, [props.userId]);

    const classnames = useMemo(() => {
        return classNames({
            "nft_avatar": isNftAvatar
        });
    }, [isNftAvatar]); 

    return (
        <div className={classnames}>
            {props.children}
        </div>
    )
}

export default NftAvatarCheckContainer;