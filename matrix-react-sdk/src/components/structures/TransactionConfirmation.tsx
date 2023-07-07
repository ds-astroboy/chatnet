import React, { useState, useEffect, useRef } from "react";
import ReactLoading from "react-loading";

interface IProps {
    contentColor: string;
    isShow: boolean;
    size: number;
}
const TransactionConfirmation = (props: IProps) => {
    const [slotNumber, setSlotNumber] = useState(0);
    const isShow = useRef(false);
    let taimoor;

    const getSlotNumber = (prevSlot: number, time: number): void => {
        let slot = prevSlot + time;
        setSlotNumber(Math.round(slot));
        let randomTime = Math.random() * 3;
        if(slot < 60) {
            taimoor = setTimeout(() => {
                getSlotNumber(slot, randomTime);
            }, randomTime * 1000);
        }
    }

    useEffect(() => {       
        isShow.current = props.isShow; 
        if(props.isShow) {
            getSlotNumber(0, 0);
        }
        else {
            if(slotNumber) {
                setSlotNumber(0);
                clearTimeout(taimoor);
            }
        }
    }, [props.isShow])
    
    return (
        props.isShow
        ?
        <div className="mx_TransactionConfirmation">
            <div className="mx_TransactionConfirmation_loading">
                <ReactLoading 
                    type={"spinningBubbles"} 
                    color={props.contentColor} 
                    width={props.size} 
                    height={props.size} 
                />
            </div>
            <div className="mx_TransactionConfirmation_label" style={{color: props.contentColor}}>
                {`(${slotNumber} Confirmations)`}
            </div>
        </div>
        :
        <React.Fragment></React.Fragment>
    )
}

export default TransactionConfirmation