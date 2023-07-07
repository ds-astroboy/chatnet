import React from "react";
import useTreasuryAccountStore from "../../../../stores/vote/useTreasuryAccountStore";
import { GovernedTokenAccount } from '../../../../utils/vote/tokens'
import { getTreasuryAccountItemInfo } from '../../../../utils/vote/treasuryTools'

const AccountItem = ({
  governedAccountTokenAccount,
}: {
  governedAccountTokenAccount: GovernedTokenAccount
}) => {
  const governanceNfts = useTreasuryAccountStore((s) => s.governanceNfts)
  const {
    amountFormatted,
    logo,
    name,
    symbol,
    displayPrice,
    isSol,
  } = getTreasuryAccountItemInfo(governedAccountTokenAccount, governanceNfts)

  return (
    <div className="mx_AccountItem">
      {logo && (
        <div className="mx_AccountItem_logo">
          <img
            src={logo}
          />
        </div>
      )}
      <div className="mx_AccountItem_info">
        <div className="mx_AccountItem_name">
          {name}
        </div>
        <div className="mx_AccountItem_amount">
          {amountFormatted} {symbol}
        </div>
        {displayPrice ? (
          <div className="mx_AccountItem_price">≈${displayPrice}</div>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

export default AccountItem
