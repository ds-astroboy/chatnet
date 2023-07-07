import React from 'react'
import { BN } from '@project-serum/anchor'
import { RpcContext } from '@solana/spl-governance'
import { useState } from 'react'
import Spinner from '../elements/Spinner'
import AccessibleTooltipButton from '../elements/AccessibleTooltipButton'
import useRealm from '../../../hooks/useRealm'
import useWalletStore from '../../../stores/vote/useWalletStore'
import useDepositStore from '../../../VoteStakeRegistry/stores/useDepositStore'
import { notify } from '../../../utils/vote/notifications'
import { getProgramVersionForRealm } from '../../../apis/registry/api'
import { voteRegistryDepositWithoutLockup } from '../../../VoteStakeRegistry/actions/voteRegistryDepositWithoutLockup'
import useVotePluginsClientStore from '../../../stores/vote/useVotePluginsClientStore'

const DepositCommunityTokensBtn = ({ className = '' }) => {
  const { getOwnedDeposits } = useDepositStore()
  const { realm, realmInfo, realmTokenAccount, tokenRecords } = useRealm()
  const client = useVotePluginsClientStore((s) => s.state.vsrClient)
  const [isLoading, setIsLoading] = useState(false)
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const connection = useWalletStore((s) => s.connection.current)
  const endpoint = useWalletStore((s) => s.connection.endpoint)
  const { fetchRealm, fetchWalletTokenAccounts } = useWalletStore(
    (s) => s.actions
  )

  const depositAllTokens = async function () {
    if (!realm) {
      throw 'No realm selected'
    }
    setIsLoading(true)
    const currentTokenOwnerRecord = tokenRecords[wallet!.publicKey!.toBase58()]
    const tokenOwnerRecordPk =
      typeof currentTokenOwnerRecord !== 'undefined'
        ? currentTokenOwnerRecord.pubkey
        : null
    const rpcContext = new RpcContext(
      realm.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection,
      endpoint
    )
    try {
      await voteRegistryDepositWithoutLockup({
        rpcContext,
        fromPk: realmTokenAccount!.publicKey,
        mintPk: realm.account.communityMint!,
        realmPk: realm.pubkey,
        programId: realm.owner,
        amount: realmTokenAccount!.account.amount,
        tokenOwnerRecordPk,
        client: client,
        communityMintPk: realm.account.communityMint,
      })
      await getOwnedDeposits({
        realmPk: realm!.pubkey,
        communityMintPk: realm!.account.communityMint,
        walletPk: wallet!.publicKey!,
        client: client!,
        connection,
      })
      await fetchWalletTokenAccounts()
      await fetchRealm(realmInfo!.programId, realmInfo!.realmId)
    } catch (e) {
      console.log(e)
      notify({ message: `Something went wrong ${e}`, type: 'error' })
    }
    setIsLoading(false)
  }

  const hasTokensInWallet =
    realmTokenAccount && realmTokenAccount.account.amount.gt(new BN(0))

  const depositTooltipContent = !connected
    ? 'Connect your wallet to deposit'
    : !hasTokensInWallet
    ? "You don't have any governance tokens in your wallet to deposit."
    : ''

  return (
    <AccessibleTooltipButton
      title={depositTooltipContent}
      className={`sm:w-1/2 ${className}`}
      disabled={!connected || !hasTokensInWallet || isLoading}
      onClick={depositAllTokens}
    >
      {isLoading ? <Spinner></Spinner> : 'Deposit'}
    </AccessibleTooltipButton>
  )
}

export default DepositCommunityTokensBtn
