import React, { useEffect, useState } from 'react'
import useGovernanceAssets from '../../../../hooks/useGovernanceAssets'
import { GovernedTokenAccount } from '../../../../utils/vote/tokens'
import AccountItem from './AccountItem'

const AccountsItems = () => {
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const [treasuryAccounts, setTreasuryAccounts] = useState<
    GovernedTokenAccount[]
  >([])

  useEffect(() => {
    async function prepTreasuryAccounts() {
      if (governedTokenAccountsWithoutNfts.every((x) => x.mint && x.token)) {
        setTreasuryAccounts(governedTokenAccountsWithoutNfts)
      }
    }
    prepTreasuryAccounts()
  }, [JSON.stringify(governedTokenAccountsWithoutNfts)])

  return (
    <div className="mx_AccountsItems">
      {treasuryAccounts.map((accountWithGovernance) => {
        return (
          accountWithGovernance.transferAddress && (
            <AccountItem
              governedAccountTokenAccount={accountWithGovernance}
              key={accountWithGovernance?.transferAddress?.toBase58()}
            />
          )
        )
      })}
    </div>
  )
}

export default AccountsItems
