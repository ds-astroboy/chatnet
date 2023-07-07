import React, { FunctionComponent } from 'react'
import { getTreasuryAccountItemInfo } from '../../../../utils/vote/treasuryTools'
import useTreasuryAccountStore from '../../../../stores/vote/useTreasuryAccountStore'
import AccessibleButton from '../../elements/AccessibleButton'

interface AccountsTabsProps {
  activeTab: any
  onChange: (x) => void
  tabs: Array<any>
}

const AccountsTabs: FunctionComponent<AccountsTabsProps> = ({
  activeTab,
  onChange,
  tabs,
}) => {
  const governanceNfts = useTreasuryAccountStore((s) => s.governanceNfts)
  return (
    <div className="mx_AccountsTabs">
      {tabs.map((x) => {
        const {
          amountFormatted,
          logo,
          name,
          symbol,
          displayPrice,
        } = getTreasuryAccountItemInfo(x, governanceNfts)
        return (
          <AccessibleButton
            key={x.transferAddress}
            onClick={() => onChange(x)}
            className={`mx_AccountsTabs_button ${activeTab?.transferAddress === x.transferAddress? "active" : ""}`}
          >
            <div className="mx_AccountsTabs_accountInfo">
                {logo && (
                  <div className='mx_AccountsTabs_logo'>
                    <img src={logo}></img>
                  </div>
                )} 
              <div className='mx_AccountsTabs_name'>{name}</div>
            </div>
            <div className="mx_AccountsTabs_amount">
              {amountFormatted} {symbol}
            </div>
            {displayPrice && (
              <div className="mx_AccountsTabs_price">${displayPrice}</div>
            )}
          </AccessibleButton>
        )
      })}
    </div>
  )
}

export default AccountsTabs
