import React, {useEffect, useState} from "react";
import { mediaFromMxc } from "../../../customisations/Media";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import BaseCard from "./BaseCard";
import SearchBox from "../../structures/SearchBox";
import { _t } from '../../../languageHandler';
import { SetRightPanelPhasePayload } from "../../../dispatcher/payloads/SetRightPanelPhasePayload";
import { Action } from "../../../dispatcher/actions";
import { RightPanelPhases } from "../../../stores/RightPanelStorePhases";
import dis from '../../../dispatcher/dispatcher';
import axios from "axios";
import BaseAvatar from "../avatars/BaseAvatar";
import classNames from "classnames";
import { checkVerifiedUserOrRoom } from "../../../hooks/commonFuncs";
import VerifiedCheckContainer from "../../structures/VerifiedCheckContainer";

const Donators = [
    {
        userId: "@victoriia:main.cafeteria.gg",
        point: 15000
    },
    {
        userId: "@victoriia:main.cafeteria.gg",
        point: 15000
    },
    {
        userId: "@victoriia:main.cafeteria.gg",
        point: 15000
    }
]

const getUserPoints = async(userId: string, accessToken: string) => {
    let userPoints;
    await axios.get(
        `https://main.cafeteria.gg/dashboard/api/total_user_points/${userId}/`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
    )
    .then((response) => {
        userPoints = response.data.total_user_points;
    })
    return userPoints
}

const trimPoints = (points: number) => {
    if(points >= 1000) {
        return (points/ 1000) + "k";
    }
    else return points
}

const PointedMemberList = props => {
    const user = MatrixClientPeg.get().getUser(props.donator.userId);
    const [points, setPoints] = useState(0);
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        const getAccessToken = async() => {
            try {
                const accessToken = await MatrixClientPeg.get().getAccessToken();
                setAccessToken(accessToken);
            }
            catch(e) {
                console.error(e);
            }
        }
        getAccessToken();
    }, [])
    useEffect(() =>  {
        if(accessToken) {
            const getPoints = async () => {
                let userPoints = await getUserPoints(props.donator.userId, accessToken);
                userPoints = trimPoints(userPoints);
                setPoints(userPoints);
            }
            getPoints();
        }
    }, [accessToken])

    const displayNameClassName = classNames("mx_EntityTile_name", "bold");
    // const isVerified = checkVerifiedUserOrRoom(user.userId, user.displayName);
    // let verifiedBadge;
    // if(isVerified) {
    //     verifiedBadge = <div className='mx_User_verified'></div>
    // }

    return (
        <div className="mx_AccessibleButton mx_EntityTile mx_EntityTile_online_beenactive mx_DonatedMember_Avatar">
            <BaseAvatar
                url={user.avatarUrl ? mediaFromMxc(user.avatarUrl).getThumbnailOfSourceHttp(30, 30, "scale") : null}
                name={user.displayName}
                idName={user.userId}
                width={36}
                height={36}
            />
            <div className="mx_EntityTile_details">
                <VerifiedCheckContainer isUser={true} className={displayNameClassName} id={user.userId}>
                    {user.displayName}
                    {/* {verifiedBadge} */}
                </VerifiedCheckContainer>
            </div>
            <div className="mx_EntityTile_power">
                <img src={require("../../../../res/img/cafeteria-point.png")} width={18}/>
                <span>{points}</span>
            </div>
        </div>
    )
}
const PointedMembersList = () => {
    return (
        <div className="mx_DonatorList_section">
            {
                Donators.map((donator) => {
                    return <PointedMemberList donator={donator}/>
                })
            }
        </div>
    )
    
}

const PointDetailContainer = () => {
    const [sectionNumber, setSectionNumber] = useState(0);
    const showSection = (index) => {
        setSectionNumber(index);
    }
    return (
        <div className="mx_DonatorList_detail">
            <div className="mx_DonatorList_header">
                <div className="mx_DonatorList_header_button">Donate</div>
                <div className="mx_DonatorList_header_button green_button">Get Credits</div>
            </div>
            <div className="mx_DonatorList_subHeader">
                <div className={`mx_DonatorList_subHeader_button ${sectionNumber? "": "active"}`} onClick={() => {showSection(0)}}>Top Tippers</div>
                <div className={`mx_DonatorList_subHeader_button ${sectionNumber? "active": ""}`}  onClick={() => {showSection(1)}}>Group Donations</div>
            </div>
        </div>
    )
}





const DonatorList = props => {
    const [userPoints, setUserPoints] = useState(0);
    const userId = MatrixClientPeg.get().getUserId();
    const user = MatrixClientPeg.get().getUser(userId);
    const showMemberList = () => {
        dis.dispatch<SetRightPanelPhasePayload>({
            action: Action.SetRightPanelPhase,
            phase: RightPanelPhases.RoomMemberList,
        });
    }
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        const getAccessToken = async() => {
            try {
                const accessToken = await MatrixClientPeg.get().getAccessToken();
                setAccessToken(accessToken);
            }
            catch(e) {
                console.error(e);
            }
        }
        getAccessToken();
    }, [])

    useEffect(() => {
        if(accessToken) {
            const getPoints = async() => {
                let points = await getUserPoints(userId, accessToken);
                setUserPoints(points);
            }
            getPoints();
        }
    }, [accessToken])
    const displayNameClassName = classNames("mx_RightPanel_userInfo_name")

    // const isVerified = checkVerifiedUserOrRoom(user.userId, user.displayName);
    // let verifiedBadge;
    // if(isVerified) {
    //     verifiedBadge = <div className='mx_User_verified'></div>
    // }

    const userInfo = (
        <div className='mx_RightPanel_userInfo'>
            <div className='mx_RightPanel_userInfo_section'>
                <BaseAvatar
                    url={user.avatarUrl ? mediaFromMxc(user.avatarUrl).getThumbnailOfSourceHttp(40, 40, "scale") : null}
                    name={user.displayName}
                    idName={user.userId}
                    width={40}
                    height={40}
                />
                <div className='mx_RightPanel_userInfo_detail'>
                    <VerifiedCheckContainer isUser={true} className={displayNameClassName} id={user.userId}>
                        <span>
                            {user.displayName}
                        </span>
                        {/* {verifiedBadge} */}
                    </VerifiedCheckContainer>
                    <div className='mx_RightPanel_userInfo_point'>
                        <img src={require("../../../../res/img/cafeteria-point.png")} width={18}/>
                        <span>{userPoints} Credits</span>
                    </div>                    
                </div>
            </div>
            <div className='mx_RightPanel_userInfo_moreButton'>
                <button onClick={showMemberList}></button>
            </div>
        </div>
    )
    const searchbar = (
        <SearchBox
            className="mx_DonatorList_query mx_textinput_icon mx_textinput_search"
            placeholder={_t('Filter room members')}
        />
    );
    return (
        <BaseCard
            className="mx_DonatorList"
            header={<React.Fragment>                
                { userInfo }
                
                { searchbar }
            </React.Fragment>}
        >
            <div className="mx_DonatorList_wrapper">
                <PointedMembersList/>
                <PointDetailContainer/>
            </div>
        </BaseCard>
    )
}

export default DonatorList