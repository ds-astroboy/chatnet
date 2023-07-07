import React from 'react'
import { PublicKey } from '@solana/web3.js'
import { GovernedTokenAccount } from '../../../../utils/vote/tokens'
import { abbreviateAddress } from '../../../../utils/vote/formatting'
import useWalletStore from '../../../../stores/vote/useWalletStore'
import useTreasuryAccountStore from '../../../../stores/vote/useTreasuryAccountStore'

const AccountItemNFT = ({
  governedAccountTokenAccount,
  className,
  onClick,
  border = false,
}: {
  governedAccountTokenAccount: GovernedTokenAccount
  className?: string
  onClick?: () => void
  border?: boolean
}) => {
  const connection = useWalletStore((s) => s.connection)
  const governanceNfts = useTreasuryAccountStore((s) => s.governanceNfts)
  const { setCurrentAccount } = useTreasuryAccountStore()

  const accountPublicKey = governedAccountTokenAccount
    ? governedAccountTokenAccount.governance?.pubkey
    : null
  //TODO move to outside component
  async function handleGoToAccountOverview() {
    setCurrentAccount(governedAccountTokenAccount, connection)
  }
  return (
    <div
      onClick={onClick ? onClick : handleGoToAccountOverview}
      className="mx_AccountItemNFT"
    >
      <img
        src="/img/collectablesIcon.svg"
        className="mx_AccountItemNFT_logo"
      />
      <div className="mx_AccountItemNFT_info">
        <div className="mx_AccountItemNFT_account">
          {abbreviateAddress(accountPublicKey as PublicKey)}
        </div>
        <div className="mx_AccountItemNFT_amount">
          {governedAccountTokenAccount.governance
            ? governanceNfts[
                governedAccountTokenAccount.governance?.pubkey.toBase58()
              ]?.length
            : 0}{' '}
          NFTS
        </div>
      </div>
    </div>
  )
}

export default AccountItemNFT
