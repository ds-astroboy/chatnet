import axios from "axios"
import { MESSAGES } from "../@types/error-type";
import { httpsRequest } from "../@types/httpsRequest"

interface UserAuthData {
    username: string;
    password: string;
}

export const getUserPoints = async (
    accessToken: string,
    userId: string
) => {
    let userPoints = 0;        
    try {
        if (accessToken) {
            const headers = {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
            await axios.get(
                `${httpsRequest.GetUserPoints}/${userId}/`,
                headers
            )
            .then((response) => {
                if (response.status === 200 && response.data.total_user_points) {
                    userPoints = response.data.total_user_points;
                }
            })
        }
    }
    catch (e) {
        console.warn(e);
    }
    return userPoints;
}

export const sendPointsToUser = async (
    amount: number, 
    receiverId: string, 
    accessToken: string
) => {
    let result = false;
    try {
        const headers = {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
        const data = {
            "user_id": receiverId,
            "points_amount": amount
        }
        await axios.post(
            httpsRequest.tipPoints,
            data,
            headers
        )
            .then(response => {
                if (response.status === 200 && response.data.response === "user tip made successfully") {
                    result = true;
                }
            })
    }
    catch (e) {
        console.warn(e);
    }

    return result;
}

export const sendPointsToCreator = async (
    userId: string,
    roomId: string,
    amount: number,
    accessToken: string
) => {
    let result = false;
    const data = {
        "room_id": roomId,
        "user_id": userId,
        "amount": amount
    }
    const headers = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    try {
        await axios.post(
            `${httpsRequest.PayPointsToRoom}`,
            data,
            headers
        )
        .then(response => {
            if(response.status === 200 && response.data) {
                result = true;
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    console.log("SendPointsToCreator: ", result);
    return result;
}

export const sendTipSucessEvent = async (
    notifyWebSocket: WebSocket, 
    userId: string, 
    amount: number
) => {
    try {
        notifyWebSocket.send(JSON.stringify({
            event: "user_tip_notify",
            data: {
                user_id: userId,
                content: {
                    type: "cafeteria.points",
                    amount
                }
            }
        }));
    }
    catch (e) {
        console.warn(e);
        console.log(`Error: ${(e as Error).message}`);
    }
}

export const checkBarrierRooms = async (
    roomId: string
) => {
    let barrierInfo;
    try {
        await axios.get(
            `${httpsRequest.RoomBarrier}/${roomId}`,
        )
        .then(response => {
            if (response.status === 200 && response.data && response.data.type) {
                barrierInfo = response.data;
            }
        })
    }
    catch (e) {
        console.warn(e);
    }
    return barrierInfo;
}

export const setBarrierToRoom = async (
    accessToken: string | false,
    roomId: string,
    barrierObj: any
) => {
    let success = false;
    if(accessToken) {
        const headers = {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
        await axios.put(
            `${httpsRequest.RoomBarrier}/${roomId}/`,
            barrierObj,
            headers
        )
        .then(response => {
            if(response.status === 200) {
                success = true;
                console.log("Successfully added Barrier to room: ", roomId);
            }
        })
    }
    return success
}

export const deleteBarrierFromRoom = async(
    accessToken: string,
    roomId: string
) => {
    let success = false;
    const header = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    await axios.delete(
        `${httpsRequest.RoomBarrier}/${roomId}/`,
        header
    )
    .then(response => {
        if(response.status === 200) {
            success = true;
        }
    })
    .catch(e => {
        console.warn(e);
    })
    return success;
}

export const getAllCategories = async () => {
    let data = [];
    try {
        await axios.get(
            httpsRequest.GetAllCategories,
        )
        .then(response => {
            if (response.status === 200) {
                if(response.data.response?.all_categories?.length) {
                    response.data.response.all_categories.map((categoryArr) => {
                        data.push(categoryArr[0]);
                    })
                }
            }
        })
    }
    catch (e) {
        console.warn(e);
    }
    return data;
}

export const getCategoryForRoom = async (
    roomId: string
) => {
    let category;
    try {
        await axios.get(
            `${httpsRequest.GetCategoryForRoom}/${roomId}/`,
        )
        .then(response => {
            if (response.status === 200 && typeof response.data === 'string') {
                category = response.data
            }
        })
    }
    catch (e) {
        console.warn(e);
    }
    return category;
}

export const setCategoryToRoom = async (
    accessToken: string | false,
    category: string,
    roomId: string
) => {
    let success = false;
    const headers = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    const data = {            
        "type_name": category            
    }
    await axios.put(
        `${httpsRequest.SetCategoryForRoom}/${roomId}/`,
        data,
        headers
    )
    .then(response => {
        if(response.status === 200) {
            success = true;
        }
    })
    .catch(e => {
        console.warn(e);
    })
    return success;
}

export const savePointsPresentTip = async (
    accessToken: string,
    eventId: string,
    amount: number,
    time: number
) => {
    const header = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    const data = {
        "event_id": eventId,
        "amount": amount,
        "txn_sec": time
    }
    let error = null;

    await axios.post (
        httpsRequest.SavePointsPresentTip,
        data,
        header
    )
    .then(response => {
        if(response.status === 200 && response.data.response === "present points success") {
            return;
        }
    })
    .catch(err => {
        if(err.response.status === 409) {
            error = MESSAGES.INFFICIENTCREDITS;
        }
        else {
            error = MESSAGES.TIPFAILED
        }
    })    
    return { error };
}

export const saveCryptoPresentTip = async (
    accessToken: string,
    eventId: string,
    currency: string,
    amount: number,
    time: number
) => {
    const header = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    const data = {
        "event_id": eventId,
        "currency_type": currency,
        "amount": amount,
        "txn_sec": time
    }
    let result = false;
    try {
        await axios.post (
            httpsRequest.saveCryptoPresentTip,
            data,
            header
        )
        .then(response => {
            if(response.status === 200) {
                console.log("==========saveCryptoPresentTip Success=========");
                result = true
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return result;
}

export const checkTransactionOnSolscan = async (
    signature: string
) => {
    let result = false;
    try {
        await axios.get(
            `${httpsRequest.CheckTransactionSolscan}/${signature}`
        )
        .then(response => {
            if(response.status === 200 && response.data.status === "Success") {
                result = true;
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return result;
}

export const getBackgrounds = async (
    accessToken: string
) => {
    let data = null;
    try {
        const headers = {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
        await axios.get(
            httpsRequest.GetBackgrounds,
            headers
        )
        .then(response => {
            if(response.status === 200) {
                data = response.data.response
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return data
}

export const checkVerifiedNFT = async (
    accessToken: string,
    update_authority: string
) => {
    let isVerified = false;
    try {
        const header = {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
        const data = {
            update_authority
        }

        await axios.post(
            httpsRequest.CheckVerifiedNFT,
            data,
            header
        )
        .then(response => {
            if(response.status === 200) {
                isVerified = response.data.response.verified;
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return isVerified
}

export const saveUserStatus = async (
    accessToken: string,
    status: string
) => {
    let result = false;
    try {
        const header = {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
        const data = {
            status_message: status
        }

        await axios.put(
            httpsRequest.SaveUserStatus,
            data,
            header
        )
        .then(response => {
            if(response.status === 200) {
                result = true;
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return result
}

export const getUserStatus = async (
    accessToken: string,
    userId: string
) => {
    let userStatus = "";
    try {
        const header = {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
        await axios.get(
            `${httpsRequest.GetUserStatus}/${userId}`,
            header
        )
        .then(response => {
            if(response.status === 200) {
                userStatus = response.data.response[0].status_message
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return userStatus;
}

export const getFanTip = async () => {
    let fanTip = "";
    try {
        await axios.get(httpsRequest.FanTip)
            .then(response => {
                if(response.status === 200 && response.data[0]) {
                    fanTip = response.data[0]["tip_text"];
                }
            })
    }
    catch (e) {
        console.warn(e);
    }
    return fanTip
}

export const setPMSetting = async (
    accessToken: string,
    isPMEnabled: boolean
) => {
    let result = false
    const header = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    const data = {
        flag: isPMEnabled
    }
    try {
        await axios.put(
            httpsRequest.PMSetting,
            data,
            header
        )
        .then (response => {
            if(response.status === 200) {
                result = true
            }
        })
    }
    catch(e) {
        console.warn(e)
    }
    return result
}

export const getPMSetting = async (
    accessToken: string,
) => {
    let isPMEnabled = false
    const header = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    
    try {
        await axios.get(
            httpsRequest.PMSetting,
            header
        )
        .then (response => {
            if(response.status === 200) {
                isPMEnabled = response.data["pm_enabled"]
            }
        })
    }
    catch(e) {
        console.warn(e)
    }
    return isPMEnabled
}

export const getPMSettingForUser = async (
    userId: string
) => {
    let isPMEnabled = false
    try {
        await axios.get(
            `${httpsRequest.GetPMSettingForUser}/${userId}/`,
        )
        .then (response => {
            if(response.status === 200) {
                console.log("response", response);
                isPMEnabled = response.data["pm_enabled"]
            }
        })
    }
    catch(e) {
        console.warn(e)
    }
    return isPMEnabled
}

export const verifyWeb2Email = async (
    email: string,
    callbackUrl: string
) => {
    let responseCode;
    try {
        await axios.post(
            httpsRequest.VerifyWeb2UserEmail,
            { email, callbackUrl }
        ).then(response => {
            if(response.status === 200) {
                responseCode = 200;
            }
        })
        .catch(e => {
            responseCode = e.status
        })
    }
    catch(e) {
        console.warn(e);
    }
    return {responseCode};
}

export const signInWeb2Email = async (
    token: string
) => {
    let success = false;
    let userData;
    try {
        await axios.post(
            httpsRequest.SignInWeb2UserEmail,
            { token }
        ).then(response => {
            if(response.status === 200) {
                success = true;
                userData = response.data
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return { success, userData};
}

export const verifySolanaWallet = async(
    publicKey: string
) => {
    let data;
    let success = false;
    let responseCode;
    try {
        await axios.post(
            `${httpsRequest.VerifySolanaWalletAddress}`,
            {
                publicKey
            }
        )
        .then (response => {
            if(response.status === 200) {
                console.log("verifySolanaWallet api response: ", response);
                data = response.data
                success = true;
            }
        })
        .catch(e => {
            responseCode = e.status;
        })
    }
    catch(e) {
        console.warn(e)
    }
    return {success, data, responseCode};
}

export const verifyAptosWallet = async(
    publicKey: string
) => {
    let data;
    let success = false;
    let responseCode;
    try {
        await axios.post(
            `${httpsRequest.VerifyAptosWalletAddress}`,{
                publicKey
            }
        )
        .then (response => {
            if(response.status === 200) {
                console.log("verifyAptosWallet api response: ", response);
                data = response.data
                success = true;
            }
        })
        .catch(e => {
            responseCode = e.status;
        })
    }
    catch(e) {
        console.warn(e)
    }
    return {success, data, responseCode};
}

export const signInSolanaWallet = async(
    publicKey: string,
    signature: string,
    token: string
) => {
    let data;
    let success = false;
    try {
        await axios.post(
            `${httpsRequest.SignInViaSolanaWallet}`,
            {
                publicKey,
                signature,
                token
            }
        )
        .then (response => {
            if(response.status === 200) {
                console.log("signInSolanaWallet api response: ", response);
                data = response.data
                success = true;
            }
        })
    }
    catch(e) {
        console.warn(e)
    }
    return {success, data};
}

export const signInAptosWallet = async(
    publicKey: string,
    signature: string,
    token: string
) => {
    let data;
    let success = false;
    try {
        await axios.post(
            `${httpsRequest.SignInViaAptosWallet}`,
            {
                publicKey,
                signature,
                token
            }
        )
        .then (response => {
            if(response.status === 200) {
                console.log("signInAptosWallet api response: ", response);
                data = response.data
                success = true;
            }
        })
        .catch(e => {
            success = false;
            data = "SignInAptosWallet failed";
        })
    }
    catch(e) {
        console.warn(e)
    }
    return {success, data};
}

export const verifyEthWallet = async(
    publicKey: string
) => {
    let data;
    let success = false;
    let responseCode;
    try {
        await axios.post(
            `${httpsRequest.VerifyEthWalletAddress}`,
            {
                publicKey
            }
        )
        .then (response => {
            if(response.status === 200) {
                console.log("VerifyEthWalletAddress api response: ", response);
                data = response.data
                success = true;
            }
        })
        .catch((e) => {
            responseCode = e.status
        })
    }
    catch(e) {
        console.warn(e)
    }
    return {success, data, responseCode};
}

export const signInEthWallet = async(
    publicKey: string,
    signature: string,
    token: string
) => {
    let data;
    let success = false;
    try {
        await axios.post(
            `${httpsRequest.SignInViaEthWallet}`,
            {
                publicKey,
                signature,
                token
            }
        )
        .then (response => {
            if(response.status === 200) {
                console.log("signInEthWallet api response: ", response);
                data = response.data
                success = true;
            }
        })
    }
    catch(e) {
        console.warn(e)
    }
    return {success, data};
}

export const postFeedback = async(
    message: string,
    rating: string,
    accessToken: string
) => {
    let success = false;
    const headers = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    const body = {
        message,
        rating,
    }
    try {
        await axios.post(
            `${httpsRequest.PostFeedback}`,
            body,
            headers
        )
        .then (response => {
            if(response.status === 200) {
                console.log("postFeedback api response: ", response);
                success = true;
            }
        })
    }
    catch(e) {
        console.warn(e)
    }
    return success;
}

export const getWalletAddress = async(
    username: string,
    protocol: string,
    auth: UserAuthData
) => {
    let success = false;
    let wallets;
    
    const url = httpsRequest.getWalleAddresstUrl(username, protocol);
    try {
        await axios.get(
            url,
            {
                auth
            }
        )
        .then(response => {
            if(response.status === 200) {
                console.log("getWalletAddress api response: ", response);
                success = true;
                wallets = response.data;
            }
        })
    }
    catch(e) {
        console.warn(e)
    }
    return { success, wallets };
}

export const putNftAvatarFlag = async(
    isNft: boolean,
    accessToken: string
) => {
    const body = {
        "nft_avatar_used": isNft
    }
    const header = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    let success = false;
    try {
        await axios.put(
            httpsRequest.NftAvatar,
            body,
            header
        ).then(response => {
            if(response.status === 200) {
                success = true;
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return success
}

export const getNftAvatarFlag = async(
    accessToken: string
) => {
    const header = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    let success = false;
    let data;
    try {
        await axios.get(
            httpsRequest.NftAvatar,
            header
        ).then(response => {
            console.log("getNftAvatarFlag: ", response)
            if(response.status === 200) {
                success = true;
                data = response.data[0];
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return {success, data};
}

export const checkNftAvatar = async(
    userId: string,
    accessToken: string
) => {
    const header = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    let success = false;
    let data;
    try {
        await axios.get(
            `${httpsRequest.CheckNftAvatar}${userId}/`,
            header
        ).then(response => {
            console.log("checkNftAvatar: ", response)
            if(response.status === 200) {
                success = true;
                data = response.data[0]
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return {success, data}
}

export const putDomainNameFlag = async(
    isDomain: boolean,
    accessToken: string
) => {
    const body = {
        "domain_used": isDomain
    }
    const header = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    let success = false;
    try {
        await axios.put(
            httpsRequest.DomainName,
            body,
            header
        ).then(response => {
            if(response.status === 200) {
                success = true;
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return success
}

export const getDomainNameFlag = async(
    accessToken: string
) => {
    const header = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    let success = false;
    let data;
    try {
        await axios.get(
            httpsRequest.DomainName,
            header
        ).then(response => {
            console.log("getDomainNameFlag: ", response);
            if(response.status === 200) {
                data = response.data[0];
                success = true;
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return {success, data}
}

export const checkDomainName = async(
    userId: string,
    accessToken: string
) => {
    const header = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    let success = false;
    let data;
    try {
        await axios.get(
            `${httpsRequest.CheckDomainName}${userId}/`,
            header
        ).then(response => {
            console.log("checkDomainName: ", response)
            if(response.status === 200) {
                success = true;
                data = response.data[0];
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return {success, data};
}

export const getUserIdByUserName = async(
    username: string
) => {
    let url = httpsRequest.getUserIdUrl(username);
    let userId;
    let success = false;
    try {
        await axios.get(url)
        .then(response => {
            if(response.status === 200) {
                userId = response.data.userId;
                success = true;
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return { success, userId }
}

export const connectWalletByUserName = async(
    auth: UserAuthData,
    userData: UserAuthData,
    protocol: string
) => {
    let url = httpsRequest.getConnectWalletByUserNameUrl(auth.username, protocol);
    const body = {...userData};
    const header = {
        auth
    }
    let success = false;
    try {
        await axios.post(
            url,
            body,
            header
        )
        .then(response => {
            if(response.status === 200) {
                success = true;
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return success;
}

export const getUserDetailByUserName = async(
    auth: UserAuthData,
    username = ""
) => {
    let success = false;
    let userDetail;
    let url = httpsRequest.getUserDetailUrl(auth.username);
    if(username) {
        url = httpsRequest.getUserDetailUrl(username);
    }
    const header = {
        auth
    }
    try {
        await axios.get(
            url,
            header
        )
        .then(response => {
            if(response.status === 200) {
                success = true;
                userDetail = response.data;
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return { success, userDetail }
}
export const connectEmailByUserName = async(
    userData: UserAuthData,
    auth: UserAuthData
) => {
    let success = false;
    let url = httpsRequest.getConnectEmailByUserNameUrl(auth.username);
    const header = {
        auth
    }
    try {
        await axios.post(
            url,
            userData,
            header
        ).then(response => {
            if(response.status === 200) {
                success = true;
            }
        })
    }
    catch(e) {
        console.warn(e)
    }
    return success
}

export const getEmailAddressByUserName = async(
    auth: UserAuthData,
) => {
    let success = false;
    let email = "";
    let url = httpsRequest.getEmailAddressByUserNameUrl(auth.username);
    const header = {
        auth
    };
    try {
        await axios.get(
            url,
            header
        ).then(response => {
            if(response.status === 200) {
                success = true;
                email = response.data.email
            }
        })
    }
    catch(e) {
        console.warn(e)
    }
    return { success, email }
}

export const getMatrixUserInfoById = async(
    userId: string
) => {
    let success = false;
    let data = null;
    let url = `${httpsRequest.GetMatrixUserInfoById}/${userId}`;
    await axios.get(url)
    .then(response => {
        if(Array.isArray(response.data?.response)) {
            success = true;
            data = response.data.response[0]
        }
    })
    return {success, data};
}

export const createGroup = async(
    auth: UserAuthData,
    body
) => {
    let success = false;
    let data = null;
    let url = httpsRequest.CreateGroup;
    const header = {
        auth
    };
    try {
        await axios.post(
            url,
            body,
            header
        )
        .then(response => {
            if(response.status === 200) {
                success = true;
                data = response.data
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    
    return {success, data};
}

export const emailSubscription = async(
    email: string
) => {
    let success = false;
    let message = null;
    const headers = {
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
    }
    
    const response = await axios.post(
        httpsRequest.EmailSubscription,
        {email},
        headers
    )

    switch(response.status) {
        case 200:
        case 201:
            success = true;
            message = "Please click on the verification link in your email inbox to confirm your subscription to our mailing list."
            break;
        default :
            message = "We could not validate your email. Are you sure it is correct?"
    }

    return {success, message}
}

export const verifiedUser = async(
    userId: string
) => {
    let isVerified = false;
    try {
        await axios.get(
            `${httpsRequest.VerifiedUser}/${userId}/`
        )
        .then(response => {
            if(response.status === 200) {
                isVerified = response.data.verified;   
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return isVerified;
}

export const getLatestModal = async() => {
    let success = false;
    let data;
    try {
        await axios.get(httpsRequest.GetLatestModal)
        .then(response => {
            if(response.status === 200) {
                success = true;
                data = response.data
            }
        })
    }
    catch(e) {
        console.warn(e)
    }
    return { success, data }
}

export const getMcdVerified = async(
    userId: string
) => {
    let success = false;
    let isVerified = false;
    const url = `${httpsRequest.MCDVerify}/${userId}`
    try {
        await axios.get(url)
        .then(response => {
            if(response.status === 200) {
                success = true;
                isVerified = response.data["mcd_verified"];
            }
        })
    }
    catch(e) {
        console.warn(e);
    }

    return {success, isVerified};
}


export const verifySoftBarrier = async(
    roomId: string,
    id: string,
    txn: number,
    accessToken: string
) => {
    let success = false;
    let url = `${httpsRequest.SoftBarrierVerify}/${roomId}/`;
    const header = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    const body = {
        "nft_id": id,
        "txn_sec": txn
    }
    try {
        await axios.post(
            url,
            body,
            header
        )
        .then(response => {
            if(response.status === 200) {
                success = true;
            }
        })
    }
    catch(e) {
        console.warn(e)
    }
    return success;
}

export const getVerifiedNftId = async(
    roomId: string,
    userId: string,
    accessToken: string
) => {
    let success = false;
    let id;
    console.log({userId})
    let url = `${httpsRequest.SoftBarrierVerify}/${roomId}/${userId}`;
    const header = {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    try {
        await axios.get(
            url,
            header
        )
        .then(response => {
            console.log("getVerifiedNftId: ", response.data)
            if(response.status === 200 && response.data?.user_soft_barrier_verified) {
                success = true; 
                id = response.data.nft_id;
            }
        })
    }
    catch(e) {
        console.warn(e)
    }
    return {success, id}
}

export const getUsersByRoomId = async(
    roomId: string,
    auth: UserAuthData
) => {
    let success = false;
    let users = [];
    const url = httpsRequest.getUsersByRoomIdUrl(roomId);
    const header = {
        auth
    }
    try {
        await axios.get(
            url,
            header
        )
        .then(response => {
            if(response.status === 200 && response.data?.users?.length) {
                users = response.data.users;
                success = true;
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return {success, users}
}

export const getTilesByRoomId = async(
    roomId: string
) => {
    let success = false;
    let tiles: any;
    const url = httpsRequest.getTilesByRoomId(roomId);
    try {
        await axios.get(
            url
        )
        .then(response => {
            if(response.status === 200 && response.data?.tiles) {
                tiles = response.data.tiles;
                success = true;
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return {success, tiles}
}

export const getRoomCreatorUsername = async(
    roomId: string,
    auth: UserAuthData
) => {
    let success = false;
    let username: string;
    const url = httpsRequest.getRoomCreatorUsername(roomId);
    const header = {
        auth
    }
    try {
        await axios.get(
            url,
            header
        )
        .then(response => {
            if(response.status === 200 && response.data?.username) {
                username = response.data.username;
                success = true;
            }
        })
    }
    catch(e) {
        console.warn(e);
    }
    return {success, username}
}