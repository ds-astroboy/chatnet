import React, {useEffect} from "react";
import { useSelector } from "react-redux";

const GetWalletInfo = props => {
    const wallets = useSelector((state: any) => state.wallet.wallets);
    

    useEffect(() => {
        props.saveWalletInfo(wallets);
    }, [wallets])

    return <></>
}

export default GetWalletInfo