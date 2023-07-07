import React, { useEffect, useState } from "react"
import Lottie from "lottie-react";
import { getFanTip } from "../../../apis";

interface LoadingProps {
    label: string,
    loadingLottie: any
}
const LoadingScreen = (props: LoadingProps) => {
    const [fanTip, setFanTip] = useState("");

    useEffect(() => {
        ; (async () => {
            let fantip = await getFanTip();
            setFanTip(fantip);
        })()
    }, [])

    return (
        <div className="mx_PageLoading">
            <div className="mx_PageLoading_container">
                <div className="mx_PageLoading_img">
                    <Lottie animationData={props.loadingLottie} />
                </div>
                {/* <div className="mx_PageLoading_text">{props.label}</div> */}
                {fanTip && (
                    <div className="mx_PageLoading_fanTip px-4 py-2 t-white bold d-flex align-items-center justify-content-center">
                        {fanTip.includes("?") ?
                            <img src={require("../../../../res/img/thinking-face.png")} />
                            :
                            <img src={require("../../../../res/img/tip.png")} />
                        }
                        <span>
                            {fanTip}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LoadingScreen