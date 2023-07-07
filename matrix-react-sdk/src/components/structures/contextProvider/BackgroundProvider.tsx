import React, { FC, useEffect } from "react";
import { useMatrixContexts, setBackgrounds } from "../../../contexts";
import { getBackgrounds } from "../../../apis";
import { Room } from "matrix-js-sdk";
interface IProps {
    children: any,
    accessToken: string
}

const BackGroundProvider: FC<IProps> = (props: IProps) => {
    const [controller, dispatch] = useMatrixContexts();

    const getInitialState = async() => {
        const background = await getBackgrounds(props.accessToken);
        if(background) {
            setBackgrounds(dispatch, background);
        }
    }

    useEffect(() => {
        if(props.accessToken) {
            getInitialState();
        }
    }, [])

    return (
        props.children
    )
}

interface BackgroundProviderProps {
    children: any;
    room: Room;
    setLottieBgUrl: (url: string) => void
}

export const CurrentBackgroundProvider: FC<BackgroundProviderProps> = (props) => {
    const [controller, dispatch] = useMatrixContexts();
    const { userBackgrounds } = controller;

    useEffect(() => {
        const roomId = props.room?.roomId;
        let keys = Object.keys(userBackgrounds);
        let index = keys.indexOf(roomId);
        let index1 = keys.indexOf("global");
        if(index !== -1 && userBackgrounds[roomId]) {
            if(userBackgrounds[roomId].isLottie) {
                document.getElementById("main_split").style.background = "transparent"
                props.setLottieBgUrl(userBackgrounds[roomId].url);
            }
            else {
                document.getElementById("main_split").style.background = `url(${userBackgrounds[roomId].image_url}) 100% / cover no-repeat`;
            }
        }
        else if(index1 !== -1) {
            if(userBackgrounds.global.isLottie) {
                document.getElementById("main_split").style.background = "transparent"
                props.setLottieBgUrl(userBackgrounds.global.url);
            }
            else if(userBackgrounds.global.image_url){
                document.getElementById("main_split").style.background = `url(${userBackgrounds.global.image_url}) center center / cover no-repeat`;
            }
            else {
                props.setLottieBgUrl(null);
                document.getElementById("main_split").style.background = `url(${require("../../../../res/img/backgrounds/pat-1.svg")}) repeat`;
            }
        }
    }, [props, userBackgrounds]);

    return (
        props.children
    )
}

export default BackGroundProvider