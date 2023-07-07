import React, { useEffect } from "react";
import { NOTIFICATIONACTIONS, NOTIFICATIONS } from "../../@variables/common";
import dis from "../../dispatcher/dispatcher";
import { useAlert } from "react-alert";

const NotificationProvider = (props) => {
    const alert = useAlert();
    let dispatcherRef: any;

    useEffect(() => {
        dispatcherRef = dis.register(onAction);
        return () => {
            dis.unregister(dispatcherRef);
        }
    }, [])
    
    const onAction = (payload) => {
        switch (payload.action) {
            case NOTIFICATIONACTIONS.SentEmail:
                alert.success(NOTIFICATIONS.SentEmail);
                break;
        }
    }
    return (
        props.children
    )
}

export default NotificationProvider;