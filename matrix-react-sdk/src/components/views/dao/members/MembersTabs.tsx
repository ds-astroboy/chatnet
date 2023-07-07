import React, { FunctionComponent } from 'react'
import useRealm from '../../../../hooks/useRealm'
import tokenService from '../../../../utils/vote/services/token'
import { fmtMintAmount } from '../../../../tools/sdk/units'
import { trimString } from "../../../../hooks/trimString";
import AccessibleButton from '../../elements/AccessibleButton';
import {
  UserIcon,
} from "@heroicons/react/outline";

interface MembersTabsProps {
  activeTab: any
  onChange: (x) => void
  tabs: Array<any>
}

const MembersTabs: FunctionComponent<MembersTabsProps> = ({
  activeTab,
  onChange,
  tabs,
}) => {
  const { mint, councilMint, realm } = useRealm()
  const tokenName = realm
    ? tokenService.getTokenInfo(realm?.account.communityMint.toBase58())?.symbol
    : ''
  return (
    <div className='mx_MembersTabs'>
      {tabs.map((x) => {
        const { walletAddress, councilVotes, communityVotes, votesCasted } = x
        const communityAmount =
          communityVotes && !communityVotes.isZero()
            ? fmtMintAmount(mint, communityVotes)
            : null
        const councilAmount =
          councilVotes && !councilVotes.isZero()
            ? fmtMintAmount(councilMint, councilVotes)
            : null
        return (
          <AccessibleButton
            key={walletAddress}
            className={`mx_MembersTabs_button ${activeTab?.walletAddress === walletAddress? "active": ""}`}
            onClick={() => onChange(x)}
          >
            <div className="mx_MembersTabs_member">
              <UserIcon className="mx_MembersTabs_member_avatar"/>
              <div className='mx_MembersTabs_member_info'>
                <div className="mx_MembersTabs_member_address">
                  { trimString(walletAddress) }
                </div>
                <div className="mx_MembersTabs_member_voteTokenInfo">
                  Votes Cast: {votesCasted}
                </div>
                <span className="mx_MembersTabs_member_otherVoteTokenInfo">
                  {(communityAmount || !councilAmount) && (
                    <span>
                      {tokenName} Votes {communityAmount || 0}
                    </span>
                  )}
                  {councilAmount && (
                    <span>
                      Council Votes {councilAmount}{' '}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </AccessibleButton>
        )
      })}
    </div>
  )
}

export default MembersTabs
