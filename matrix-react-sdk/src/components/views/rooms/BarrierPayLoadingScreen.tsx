import * as React from "react"
import Lottie from "lottie-react";
import ReactLoading from "react-loading";
import { Connection } from "@solana/web3.js";
import TransactionConfirmation from "../../structures/TransactionConfirmation";

interface LoadingProps {
    label: string,
    loadingLottie: any,
    type: string,
    showConfirmation: boolean,
}
const BarrierPayLoadingScreen = (props: LoadingProps) => {    

    return  (
            <div className="mx_PageLoading">
                <div className="mx_PageLoading_container">
                    <div className="mx_PageLoading_img">
                        <Lottie animationData={props.loadingLottie} />
                    </div>
                    <div className="mx_PageLoading_text">
                        {props.showConfirmation? "Paying Sol to Join Room ... ": props.label}
                    </div>
                    {
                        props.showConfirmation
                        ?
                        <TransactionConfirmation 
                            contentColor="#fff"
                            isShow={props.showConfirmation}
                            size={30}
                        />
                        :
                        <React.Fragment></React.Fragment>
                    }
                </div>
            </div>
        )
}

export default BarrierPayLoadingScreen