import { PublicKey } from '@solana/web3.js'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import {
  AccountMetaData,
  Proposal,
  ProposalTransaction,
} from '@solana/spl-governance'
import {
  getAccountName,
  getInstructionDescriptor,
  InstructionDescriptor,
  WSOL_MINT,
} from './tools'
import React, { useEffect, useState } from 'react'
import useWalletStore from '../../../../stores/vote/useWalletStore'
import { getExplorerUrl } from '../explorer/tools'
import { getProgramName } from './programs/names'
import { tryGetTokenAccount } from '../../../../utils/vote/tokens'
import { ExecuteInstructionButton, PlayState } from './ExecuteInstructionButton'
import { ProgramAccount } from '@solana/spl-governance'
import InspectorButton from '../explorer/inspectorButton'
import { FlagInstructionErrorButton } from './FlagInstructionErrorButton'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import axios from 'axios'
import { notify } from '../../../../utils/vote/notifications'
import useGovernanceAssets from '../../../../hooks/useGovernanceAssets'
import tokenService from '../../../../utils/vote/services/token'

export default function InstructionCard({
  index,
  proposal,
  proposalInstruction,
}: {
  index: number
  proposal: ProgramAccount<Proposal>
  proposalInstruction: ProgramAccount<ProposalTransaction>
}) {
  const {
    nftsGovernedTokenAccounts,
    governedTokenAccountsWithoutNfts,
  } = useGovernanceAssets()
  const connection = useWalletStore((s) => s.connection)
  const tokenRecords = useWalletStore((s) => s.selectedRealm)
  const [descriptor, setDescriptor] = useState<InstructionDescriptor>()
  const [playing, setPlaying] = useState(
    proposalInstruction.account.executedAt
      ? PlayState.Played
      : PlayState.Unplayed
  )
  const [nftImgUrl, setNftImgUrl] = useState('')
  const [tokenImgUrl, setTokenImgUrl] = useState('')
  useEffect(() => {
    getInstructionDescriptor(
      connection,
      proposalInstruction.account.getSingleInstruction()
    ).then((d) => setDescriptor(d))
    const getAmountImg = async () => {
      const sourcePk = proposalInstruction.account.getSingleInstruction()
        .accounts[0].pubkey
      const tokenAccount = await tryGetTokenAccount(
        connection.current,
        sourcePk
      )
      const isSol = governedTokenAccountsWithoutNfts.find(
        (x) => x.transferAddress?.toBase58() === sourcePk.toBase58()
      )?.isSol
      const isNFTAccount = nftsGovernedTokenAccounts.find(
        (x) =>
          x.governance?.pubkey.toBase58() ===
          tokenAccount?.account.owner.toBase58()
      )
      if (isNFTAccount) {
        const mint = tokenAccount?.account.mint
        if (mint) {
          try {
            const metadataPDA = await Metadata.getPDA(mint)
            const tokenMetadata = await Metadata.load(
              connection.current,
              metadataPDA
            )
            const url = (await axios.get(tokenMetadata.data.data.uri)).data
            setNftImgUrl(url.image)
          } catch (e) {
            notify({
              type: 'error',
              message: 'Unable to fetch nft',
            })
          }
        }
        return
      }

      if (isSol) {
        const info = tokenService.getTokenInfo(WSOL_MINT)
        const imgUrl = info?.logoURI ? info.logoURI : ''
        setTokenImgUrl(imgUrl)
        return
      }
      const mint = tokenAccount?.account.mint
      if (mint) {
        const info = tokenService.getTokenInfo(mint.toBase58())
        const imgUrl = info?.logoURI ? info.logoURI : ''
        setTokenImgUrl(imgUrl)
      }
      return
    }
    getAmountImg()
  }, [proposalInstruction, governedTokenAccountsWithoutNfts.length])
  const isSol = tokenImgUrl.includes(WSOL_MINT)

  const proposalAuthority = tokenRecords[proposal.owner.toBase58()]
  return (
    <div className="mx_InstructionCard">
      <div className="mx_InstructionCard_header">
        <div className='mx_InstructionCard_title'>
          {`Instruction ${index} `}
          {descriptor?.name && `– ${descriptor.name}`}{' '}
        </div>
        {tokenImgUrl && (
          <img
            className={`mx_InstructionCard_logo ${isSol && 'rounded'}`}
            src={tokenImgUrl}
          ></img>
        )}
      </div>
      <InstructionProgram
        endpoint={connection.endpoint}
        programId={proposalInstruction.account.getSingleInstruction().programId}
      ></InstructionProgram>
      <div className="mx_InstructionCard_accounts">
        {proposalInstruction.account
          .getSingleInstruction()
          .accounts.map((am, idx) => (
            <InstructionAccount
              endpoint={connection.endpoint}
              key={idx}
              index={idx}
              accountMeta={am}
              descriptor={descriptor}
            />
          ))}
      </div>
      <div className="mx_InstructionCard_data">
        {descriptor?.dataUI.props ? (
          <div className="mx_InstructionCard_data_title">Data</div>
        ) : (
          ''
        )}
        {nftImgUrl ? (
          <div
            style={{ width: '150px', height: '150px' }}
            className="mx_InstructionCard_data_nftImage"
          >
            <img src={nftImgUrl}></img>
          </div>
        ) : (
          <InstructionData descriptor={descriptor}></InstructionData>
        )}
      </div>

      <div className="mx_InstructionCard_buttonGroup">
        <InspectorButton proposalInstruction={proposalInstruction} />

        <FlagInstructionErrorButton
          playState={playing}
          proposal={proposal}
          proposalAuthority={proposalAuthority}
          proposalInstruction={proposalInstruction}
        />

        {proposal && (
          <ExecuteInstructionButton
            proposal={proposal}
            proposalInstruction={proposalInstruction}
            playing={playing}
            setPlaying={setPlaying}
          />
        )}
      </div>
    </div>
  )
}

export function InstructionProgram({
  endpoint,
  programId,
}: {
  endpoint: string
  programId: PublicKey
}) {
  const programLabel = getProgramName(programId)
  return (
    <div className="mx_InstructionCard_program">
      <div className="mx_InstructionCard_program_title">Program</div>
      <div className="mx_InstructionCard_program_body">
        <a
          className="mx_InstructionCard_program_label"
          href={getExplorerUrl(endpoint, programId)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {programId.toBase58()}
          {programLabel && (
            <div className="mx_InstructionCard_program_content">
              {programLabel}
            </div>
          )}
        </a>
        <ExternalLinkIcon
          className={`mx_InstructionCard_program_link`}
        />
      </div>
    </div>
  )
}

export function InstructionAccount({
  endpoint,
  index,
  accountMeta,
  descriptor,
}: {
  endpoint: string
  index: number
  accountMeta: AccountMetaData
  descriptor: InstructionDescriptor | undefined
}) {
  const connection = useWalletStore((s) => s.connection)
  const [accountLabel, setAccountLabel] = useState(
    getAccountName(accountMeta.pubkey)
  )

  if (!accountLabel) {
    // Check if the account is SPL token account and if yes then display its owner
    tryGetTokenAccount(connection.current, accountMeta.pubkey).then((ta) => {
      if (ta) {
        setAccountLabel(`owner: ${ta?.account.owner.toBase58()}`)
      }
    })
    // TODO: Extend to other well known account types
  }

  return (
    <div className="mx_InstructionCard_account">
      <div className="mx_InstructionCard_account_header">
        <p className="mx_InstructionCard_account_index">{`Account ${index + 1}`}</p>
        {descriptor?.accounts && (
          <div className="mx_InstructionCard_account_name">
            {descriptor.accounts[index]?.name}
          </div>
        )}
      </div>
      <div className="mx_InstructionCard_account_body">
        <a
          className="mx_InstructionCard_account_info"
          href={getExplorerUrl(endpoint, accountMeta.pubkey)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className='mx_InstructionCard_account_pubkey'>
            {accountMeta.pubkey.toBase58()}
          </div>
          {accountLabel && (
            <div className="mx_InstructionCard_account_label">
              {accountLabel}
            </div>
          )}
        </a>
        <ExternalLinkIcon
          className={`mx_InstructionCard_account_link`}
        />
      </div>
    </div>
  )
}

export function InstructionData({
  descriptor,
}: {
  descriptor: InstructionDescriptor | undefined
}) {
  return (
    <div className="mx_InstructionCard_data_body">
      <span className="mx_InstructionCard_data_ui">
        {descriptor?.dataUI}
      </span>
    </div>
  )
}
