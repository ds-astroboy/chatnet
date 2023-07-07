import React, { FC, useEffect } from "react";
import { getUserDetailByUserName } from "../../../apis";
import { 
    useMatrixContexts, 
    setUserDetail,
    setUsersData
} from "../../../contexts";
import { useLocalStorageState } from "../../../hooks/useLocalStorageState";

interface IProps {
    children: any;
}

const InitializeProvider: FC<IProps> = (props: IProps) => {
    const [controller, dispatch] = useMatrixContexts();
    const { userDetail } = controller;
    const [userData, ] = useLocalStorageState("userData", null);

    useEffect(() => {
        getUserDetail();
    }, []);


    const getUserDetail = async() => {
        if(!userData) return;
        const { success, userDetail: detail } = await getUserDetailByUserName(userData);
        if(!success) return;
        let data = {...userDetail, ...detail}
        console.log("userDetail: ", data);
        setUserDetail(dispatch, data);
    }
    
    return (
        props.children
    )
}

export default InitializeProvider;