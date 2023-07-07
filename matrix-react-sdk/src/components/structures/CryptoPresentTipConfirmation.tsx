import React, { useState, useEffect, useRef } from "react";
import ReactLoading from "react-loading";
import { MatrixEvent } from 'matrix-js-sdk/src/models/event';
import dis from '../../dispatcher/dispatcher';

interface IProps {
    contentColor: string;
    isShow: boolean;
    mxEvent: MatrixEvent;
    signature: string;
}
const CryptoPresentTipConfirmation = (props: IProps) => {
    const [slotNumber, setSlotNumber] = useState(0);
    const isShow = useRef(false);
    let taimoor;

    const moveToComment = (e) => {
        e.preventDefault();
        dis.dispatch({
            action: 'view_room',
            event_id: props.mxEvent.getId(),
            highlighted: true,
            room_id: props.mxEvent.getRoomId(),
        });
    }

    const getSlotNumber = (prevSlot: number, time: number): void => {
        let slot = prevSlot + time;
        setSlotNumber(Math.round(slot));
        let randomTime = Math.random() * 3;
        if(slot < 100) {
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
        <div className="mx_SolPresentTipConfirmation">
            <span>
                Sending sol tip 
                <a href='#' onClick={moveToComment}>
                    [view comment]
                </a>                   
                , awaiting
            </span>
            <ReactLoading 
                type={"spinningBubbles"} 
                color={props.contentColor} 
                width={20} 
                height={20} 
            />
            {`(${slotNumber} Confirmations) `}
            <a href={`https://solscan.io/tx/${props.signature}`} target='_blank'>[view on Solscan]</a>
        </div>
        :
        <React.Fragment></React.Fragment>
    )
}

export default CryptoPresentTipConfirmation