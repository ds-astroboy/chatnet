import React, {useState, useEffect, useCallback} from "react";
import { debounce } from "lodash";
import { MatrixClientPeg } from "../../MatrixClientPeg";
import { useMatrixContexts, setUserStatus } from "../../contexts";
import { getUserStatus, saveUserStatus } from "../../apis"
import axios from "axios"

const CustomStatus = () => {
    const [customStatus, setCustomStatus] = useState("");
    const [controller, dispatch] = useMatrixContexts();
    const { userStatus } = controller;

    useEffect(() => {
        if(!userStatus) {
            getInitialUserStatus();
        }
        else {
            setCustomStatus(userStatus);
        }
        // const header = {
        //     headers: {
        //         "Content-Type": "application/json"
        //     }
        // }

        // const data = [
        //     {
        //         jsonrpc: "2.0",
        //         id: 1,
        //         method: "getTokenAccountsByOwner",
        //         params: [
        //           "B3gJHt8PrFr3eHEm4gdq41FDaePPEMk9VfejLaUsaCnU",
        //           {
        //             mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        //           },
        //           {
        //             encoding: "jsonParsed",
        //           },
        //         ],
        //     }
        // ]
        // axios.post(
        //     `https://api.mainnet-beta.solana.com`,
        //     data,
        //     header,
        // )
        // .then(response => {
        //     console.log("================response==============", response);
        // })
    }, []);

    const getInitialUserStatus = async() => {
        const userId = MatrixClientPeg.get().getUserId();
        const accessToken = MatrixClientPeg.get().getAccessToken();
        let userStatus = await getUserStatus(accessToken, userId);
        if(userStatus === "Active now") return;
        setUserStatus(dispatch, userStatus);
        setCustomStatus(userStatus)
    }

    const saveCustomStatus = useCallback(
        debounce(async (status: string) => {
            const accessToken = MatrixClientPeg.get().getAccessToken();
            if(!status) status = "Active now"
            let result = await saveUserStatus(accessToken, status);
            if(result) {
                setUserStatus(dispatch, status)
            }
        }, 1000)
        ,[]
    )

    const changeCustomStatus = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.value !== userStatus) {
            saveCustomStatus(e.target.value)
            setCustomStatus(e.target.value);
        }
    }

    return (
        <div className="mx_UserMenu_contextMenu_custom_status">
            <div className="mx_UserMenu_contextMenu_custom_status_icon">
            </div>
            <div className="mx_UserMenu_contextMenu_custom_status_input">
                <input 
                    type="text" 
                    placeholder="Update your status" 
                    value={customStatus} 
                    onChange={changeCustomStatus}
                />
            </div>
        </div>
    )
}

export default CustomStatus