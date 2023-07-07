import React, { useEffect } from "react";
import { useMatrixContexts } from "../../../contexts";

interface IProps {
    children: any,
    roomId: string,
    setRoomBarrierInfo: (barrierInfo) => void
}

const BarrierContextProvider = (props: IProps) => {
    const [controller] = useMatrixContexts();
    const {
        publicRoomInfo
    } = controller;

    useEffect(() => {
        if(publicRoomInfo?.length && (props.roomId)) {
            let room = publicRoomInfo.find((room) => room.room_id === props.roomId);
            if(room) {
                props.setRoomBarrierInfo(room.barrierInfo);
            }
        }
    }, [publicRoomInfo, props])

    return (
        props.children
    )
}

export default BarrierContextProvider;