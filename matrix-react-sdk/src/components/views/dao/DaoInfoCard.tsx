import React, { FC } from 'react';
import useMembers from '../../../hooks/useMembers';
import useRealm from "../../../hooks/useRealm";
import BaseAvatar from "../avatars/BaseAvatar";
import AccessibleButton from "../elements/AccessibleButton";
import Spinner from '../elements/Spinner';
import { UsersIcon } from '@heroicons/react/outline'
import dis from "../../../dispatcher/dispatcher";

const DaoInfoCard: FC = () => {
    const { realm, realmInfo, symbol } = useRealm()
    const { members } = useMembers();
    const showMembers = () => {
        dis.dispatch({
            action: "show_dao_members",
            symbol
        })
    }

    return (
        <>
            {(realm && realmInfo && symbol === realmInfo.realmId.toBase58()) ? 
            <div className='mx_DaoInfoCard'>
                <div className='mx_DaoInfoCard_header'>
                    <BaseAvatar
                        className='mx_DaoInfoCard_avatar'
                        url={realmInfo.ogImage}
                        name={realmInfo.displayName}
                        width={100}
                        height={100}
                    ></BaseAvatar>
                </div>
                <div className='mx_DaoInfoCard_body'>
                    <div className='mx_DaoInfoCard_title'>
                        {realmInfo.displayName}
                    </div>
                    <AccessibleButton 
                        className='mx_DaoInfoCard_member'
                        onClick={showMembers}
                    >
                        <UsersIcon className="mx_DaoInfoCard_member_icon" />
                        <div className="mx_DaoInfoCard_member_number">
                            {members.length} Members
                        </div>
                    </AccessibleButton>
                    <div className='mx_DaoInfoCard_detail'>
                        <div className='mx_DaoInfoCard_category'>
                            Nfts
                        </div>
                        <div className='mx_DaoInfoCard_condition'>
                            <div className='mx_DaoInfoCard_condition_logo solana'></div>
                            <div className='mx_DaoInfoCard_condition_content'>On-chain</div>
                        </div>
                    </div>
                    <div className='mx_DaoInfoCard_joinedCondition'>
                        <div className='joined'>Joined</div>
                    </div>
                </div>
                <div className='mx_DaoInfoCard_footer'>
                    <div className='mx_DaoInfoCard_buttons'>
                        <div className='mx_DaoInfoCard_buttonGroup'>
                            <AccessibleButton
                                className='mx_DaoInfoCard_button visit'
                                onClick={null}
                            />
                            <div className='mx_DaoInfoCard_buttonLabel'>Visit</div>
                        </div>
                        <div className='mx_DaoInfoCard_buttonGroup'>
                            <AccessibleButton
                                className='mx_DaoInfoCard_button notification'
                                onClick={null}
                            />
                            <div className='mx_DaoInfoCard_buttonLabel'>Notification</div>
                        </div>
                        <div className='mx_DaoInfoCard_buttonGroup'>
                            <AccessibleButton
                                className='mx_DaoInfoCard_button help'
                                onClick={null}
                            />
                            <div className='mx_DaoInfoCard_buttonLabel'>Help</div>
                        </div>
                    </div>
                </div>
            </div>
            :
            <Spinner/>
            }
        </>
    )
}

export default DaoInfoCard;