import React from 'react'
import { NftVoterClient } from '@solana/governance-program-library'
import {
  getTokenOwnerRecordAddress,
  SYSTEM_PROGRAM_ID,
  withCreateTokenOwnerRecord,
} from '@solana/spl-governance'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import { sendTransaction } from '../../../utils/vote/send'
import { useState, useEffect } from 'react'
import Spinner from '../elements/Spinner'
import NFTSelector from './NFTS/NFTSelector'
import useRealm from '../../../hooks/useRealm'
import { getNftVoterWeightRecord } from '../../../NftVotePlugin/sdk/accounts'
import useNftPluginStore from '../../../NftVotePlugin/store/nftPluginStore'
import useVotePluginsClientStore from '../../../stores/vote/useVotePluginsClientStore'
import useWalletStore from '../../../stores/vote/useWalletStore'
import AccessibleButton from '../elements/AccessibleButton'

const NftBalanceCard = () => {
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const nfts = useNftPluginStore((s) => s.state.votingNfts)
  const isLoading = useNftPluginStore((s) => s.state.isLoadingNfts)
  const connection = useWalletStore((s) => s.connection)
  const [tokenOwnerRecordPk, setTokenOwneRecordPk] = useState('')
  const { tokenRecords, realm, symbol, mint, councilMint } = useRealm()
  const { fetchRealm } = useWalletStore((s) => s.actions)
  const ownTokenRecord = wallet?.publicKey
    ? tokenRecords[wallet.publicKey!.toBase58()]
    : null
  const handleRegister = async () => {
    const instructions: TransactionInstruction[] = []
    const { voterWeightPk } = await getNftVoterWeightRecord(
      realm!.pubkey,
      realm!.account.communityMint,
      wallet!.publicKey!,
      client.client!.program.programId
    )
    instructions.push(
      (client.client as NftVoterClient).program.instruction.createVoterWeightRecord(
        wallet!.publicKey!,
        {
          accounts: {
            voterWeightRecord: voterWeightPk,
            governanceProgramId: realm!.owner,
            realm: realm!.pubkey,
            realmGoverningTokenMint: realm!.account.communityMint,
            payer: wallet!.publicKey!,
            systemProgram: SYSTEM_PROGRAM_ID,
          },
        }
      )
    )
    await withCreateTokenOwnerRecord(
      instructions,
      realm!.owner!,
      realm!.pubkey,
      wallet!.publicKey!,
      realm!.account.communityMint,
      wallet!.publicKey!
    )
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({
      transaction: transaction,
      wallet,
      connection: connection.current,
      signers: [],
      sendingMessage: `Registering`,
      successMessage: `Registered`,
    })
    await fetchRealm(realm?.owner, realm?.pubkey)
  }

  useEffect(() => {
    const getTokenOwnerRecord = async () => {
      const defaultMint = !mint?.supply.isZero()
        ? realm!.account.communityMint
        : !councilMint?.supply.isZero()
        ? realm!.account.config.councilMint
        : undefined
      const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
        realm!.owner,
        realm!.pubkey,
        defaultMint!,
        wallet!.publicKey!
      )
      setTokenOwneRecordPk(tokenOwnerRecordAddress.toBase58())
    }
    if (realm && wallet?.connected) {
      getTokenOwnerRecord()
    }
  }, [realm?.pubkey.toBase58(), wallet?.connected])
  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="mb-0">Your NFTS</h3>
        <div>
          <a
            className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3 ${
              !connected || !tokenOwnerRecordPk
                ? 'opacity-50 pointer-events-none'
                : ''
            }`}
          >
            View
          </a>
        </div>
      </div>
      <div className="space-y-4">
        {!connected ? (
          <div className="text-xs bg-bkg-3 p-3">Please connect your wallet</div>
        ) : !isLoading ? (
          <NFTSelector
            onNftSelect={() => {
              return null
            }}
            ownerPk={wallet!.publicKey!}
            nftHeight="50px"
            nftWidth="50px"
            selectable={false}
            predefinedNfts={nfts}
          ></NFTSelector>
        ) : (
          <Spinner></Spinner>
        )}
      </div>
      {connected && !ownTokenRecord && (
        <AccessibleButton className="w-full" onClick={handleRegister}>
          Register
        </AccessibleButton>
      )}
    </div>
  )
}
export default NftBalanceCard
