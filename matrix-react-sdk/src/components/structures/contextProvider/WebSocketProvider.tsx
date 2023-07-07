import React, { useEffect } from "react";
import { 
    useMatrixContexts, 
    setWebSocket, 
    setNotifyWebSocket
} from "../../../contexts";

interface IProps {
    webSocket: WebSocket | null;
    notifyWebSocket: WebSocket | null;
    children: any
}

const WebScoketProvider = (props: IProps) => {
    const [controller, dispatch] = useMatrixContexts();

    useEffect(() => {
        setWebSocket(dispatch, props.webSocket);
        setNotifyWebSocket(dispatch, props.notifyWebSocket);
    }, [])
    
    return (
        props.children
    )
}

export default WebScoketProvider;