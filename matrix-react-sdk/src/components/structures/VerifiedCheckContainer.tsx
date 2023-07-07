import React, { FC, useState, useEffect, useMemo } from "react";
import classNames from "classnames";

import { useSelector, useDispatch } from "react-redux";
import { getMcdVerified, getVerifiedNftId, verifiedUser } from "../../apis";
import reduxActions from "../../redux/actions";
import { MatrixClientPeg } from "../../MatrixClientPeg";

interface IProps {
    id: string;
    children: any;
    isUser: boolean;
    className: string;
    roomId?: string;
}

const VerifiedCheckContainer: FC<IProps> = (props) => {
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [isMCDVerified, setIsMCDVerified] = useState<boolean>(false);
    const [verifiedNftId, setVerifiedNftId] = useState<string>("");

    const verifiedList = useSelector((state: any) => state.verified.verifiedList);
    const verifiedOwnershipList = useSelector((state: any) => state.verified.verifiedOwnershipList);
    const dispatch = useDispatch();

    useEffect(() => {
        if(!props.id) return;
        checkVerifiedStatus();
        if(props.isUser && props.roomId) {
            checkVerifiedNftStatus();
        }
    }, [props.id]);

    const checkVerified = async(id) => {
        let isVerified = false;
        if(!props.isUser) return;
        isVerified = await verifiedUser(id);
        setIsVerified(isVerified);
        dispatch(
            reduxActions.verifiedActions.addOne(id, "verified", isVerified)
        );
    }

    const checkMcdVerified = async(id) => {
        let isMCDVerified = false;
        if(!props.isUser) return;
        const { success, isVerified } = await getMcdVerified(id);
        if(!success) return;
        isMCDVerified = isVerified;
        setIsMCDVerified(isMCDVerified);
        dispatch(
            reduxActions.verifiedActions.addOne(id, "McdVerified", isMCDVerified)
        );
    }

    const checkVerifiedStatus = async() => {
        let id = props.id;
        if(verifiedList && verifiedList[id] !== undefined) {
            if(verifiedList[id]["verified"]) {
                setIsVerified(true);
            }
            else {
                checkVerified(id);
            }
            if(verifiedList[id]["McdVerified"]) {
                setIsMCDVerified(true);
            }
            else {
                checkMcdVerified(id);
            }
        }
        else {
            checkVerified(id);
            checkMcdVerified(id);
        }
    }

    const checkVerifiedNftStatus = async() => {
        let id = props.id;
        if(verifiedOwnershipList && verifiedOwnershipList[id] !== undefined) {
            setVerifiedNftId(verifiedOwnershipList[id]);
        }
        else {
            const accessToken = MatrixClientPeg.get().getAccessToken();
            const { success, id: nftId } = await getVerifiedNftId(props.roomId, id, accessToken);
            if(success) {
                setVerifiedNftId(nftId);
                dispatch(
                    reduxActions.verifiedOwnershipActions.addUser(id, nftId)
                );
            }
        }
    }

    return (
        <div className={props.className}>
            {props.children}
            { isVerified && <div className="verified-badge"/> }
            { isMCDVerified && <div className="mcd-verified-badge"/> }
            { verifiedNftId && <div className="verified-ownership common-badge bg-green">{verifiedNftId}</div> }
        </div>
    )
}

export default VerifiedCheckContainer;