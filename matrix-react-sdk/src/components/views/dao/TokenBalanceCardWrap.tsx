import React from 'react'
import { Proposal } from '@solana/spl-governance'
import { Option } from '../../../tools/core/option'
import useRealm from '../../../hooks/useRealm'
import { nftPluginsPks, vsrPluginsPks } from '../../../hooks/useVotingPlugins'
import TokenBalanceCard from './TokenBalanceCard'
import NftBalanceCard from './NftBalanceCard'
import LockPluginTokenBalanceCard from './LockPluginTokenBalanceCard'

const TokenBalanceCardWrapper = ({
  proposal,
}: {
  proposal?: Option<Proposal>
}) => {
  const {
    ownTokenRecord,
    config,
    ownCouncilTokenRecord,
    councilTokenAccount,
  } = useRealm()
  const currentPluginPk = config?.account?.communityVoterWeightAddin
  const getTokenBalanceCard = () => {
    //based on realm config it will provide proper tokenBalanceCardComponent
    const isLockTokensMode =
      currentPluginPk && vsrPluginsPks.includes(currentPluginPk?.toBase58())
    const isNftMode =
      currentPluginPk && nftPluginsPks.includes(currentPluginPk?.toBase58())
    if (
      isLockTokensMode &&
      (!ownTokenRecord ||
        ownTokenRecord.account.governingTokenDepositAmount.isZero())
    ) {
      return <LockPluginTokenBalanceCard></LockPluginTokenBalanceCard>
    }
    if (
      isNftMode &&
      (!ownTokenRecord ||
        ownTokenRecord.account.governingTokenDepositAmount.isZero())
    ) {
      return (
        <>
          <NftBalanceCard></NftBalanceCard>
          {(!ownCouncilTokenRecord?.account.governingTokenDepositAmount.isZero() ||
            !councilTokenAccount?.account.amount.isZero()) && (
            <TokenBalanceCard proposal={proposal}></TokenBalanceCard>
          )}
        </>
      )
    }
    //Default
    return <TokenBalanceCard proposal={proposal}></TokenBalanceCard>
  }
  return getTokenBalanceCard()
}

export default TokenBalanceCardWrapper
