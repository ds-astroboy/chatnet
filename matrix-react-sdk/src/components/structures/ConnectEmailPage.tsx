import React, { useState, useEffect, FC } from "react";
import { useAlert } from "react-alert";
import { connectEmailByUserName, signInWeb2Email } from "../../apis";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import dis from "../../dispatcher/dispatcher";
import LoadingScreen from "../views/rooms/LoadingScreen";
import LoadingLottie from "../../../res/img/cafeteria-loading.json";

const ConnectEmailPage: FC = () => {
    const alert = useAlert();
    const [ userData, ] = useLocalStorageState("userData", null);

    useEffect(() => {
        const url = new URL(window.location.href);
        const token = url.searchParams.get('token');
        console.log("token: ", token);
        if(!token) return;
        const newUrl = url.protocol + "//" + url.hostname;
        console.log("newUrl: ", newUrl)
        window.history.pushState(null, 'Cafeteria', newUrl);
        connectEmail(token);
    }, []);

    const handleResult = (success: boolean) => {
        if(success) {
            alert.success("Connected Email Successfully.");
        }
        else {
            alert.error("Email Connect Failed.");
        }
        dis.dispatch({
            action: "view_home_page"
        })
    }

    const connectEmail = async(token: string) => {
        const { success, userData: web2UserData } = await signInWeb2Email(token);
        if(!success) return handleResult(false);
        const auth = {
            username: web2UserData.username,
            password: web2UserData.password
        }
        const connectResult = await connectEmailByUserName(auth, userData);
        handleResult(connectResult);
    }

    return (
        <>
            <LoadingScreen label="Connecting Email..." loadingLottie={LoadingLottie} />
        </>
    )
}

export default ConnectEmailPage