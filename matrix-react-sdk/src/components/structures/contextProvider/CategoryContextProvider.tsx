import React, { useEffect } from "react";
import { useMatrixContexts } from "../../../contexts";

interface IProps {
    children: any;
    roomId: string;
    setRoomCategory: (category: string) => void;
}
const CategoryContextProvider = (props: IProps) => {
    const [controller] = useMatrixContexts();
    const {
        publicRoomInfo
    } = controller;

    useEffect(() => {
        if(props.roomId && publicRoomInfo?.length) {
            let room = publicRoomInfo.find((room) => room.room_id === props.roomId);
            if(room?.categoryName) {
                props.setRoomCategory(room.categoryName);
            }
        }
    }, [props.roomId])

    return (
        props.children
    )
}

export default CategoryContextProvider