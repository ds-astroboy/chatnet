import React, { useEffect, useState } from 'react'
import { executeTransaction } from '../../../../actions/executeTransaction'
import {
  InstructionExecutionStatus,
  Proposal,
  ProposalTransaction,
  ProposalState,
} from '@solana/spl-governance'
import { CheckCircleIcon, PlayIcon, RefreshIcon } from '@heroicons/react/solid'
import { RpcContext } from '@solana/spl-governance'
import useRealm from '../../../../hooks/useRealm'
import useWalletStore from '../../../../stores/vote/useWalletStore'
import { ProgramAccount } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { getProgramVersionForRealm } from '../../../../apis/registry/api'
import { notify } from '../../../../utils/vote/notifications'
import AccessibleButton from "../../elements/AccessibleButton"
import AccessibleTooltipButton from "../../elements/AccessibleTooltipButton"

export enum PlayState {
  Played,
  Unplayed,
  Playing,
  Error,
}

export function ExecuteInstructionButton({
  proposal,
  playing,
  setPlaying,
  proposalInstruction,
}: {
  proposal: ProgramAccount<Proposal>
  proposalInstruction: ProgramAccount<ProposalTransaction>
  playing: PlayState
  setPlaying: React.Dispatch<React.SetStateAction<PlayState>>
}) {
  const { realmInfo } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const refetchProposals = useWalletStore((s) => s.actions.refetchProposals)
  const connected = useWalletStore((s) => s.connected)

  const [currentSlot, setCurrentSlot] = useState(0)

  const canExecuteAt = proposal?.account.votingCompletedAt
    ? proposal.account.votingCompletedAt.toNumber() + 1
    : 0

  const ineligibleToSee = currentSlot - canExecuteAt >= 0

  const rpcContext = new RpcContext(
    new PublicKey(proposal.owner.toString()),
    getProgramVersionForRealm(realmInfo!),
    wallet!,
    connection.current,
    connection.endpoint
  )

  useEffect(() => {
    if (ineligibleToSee && proposal) {
      const timer = setTimeout(() => {
        rpcContext.connection.getSlot().then(setCurrentSlot)
      }, 5000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [ineligibleToSee, rpcContext.connection, currentSlot])

  const onExecuteInstruction = async () => {
    setPlaying(PlayState.Playing)

    try {
      await executeTransaction(rpcContext, proposal, proposalInstruction)
      await refetchProposals()
    } catch (error) {
      notify({ type: 'error', message: `error executing instruction ${error}` })
      console.log('error executing instruction', error)

      setPlaying(PlayState.Error)

      return
    }

    setPlaying(PlayState.Played)
  }

  if (
    proposalInstruction.account.executionStatus ===
    InstructionExecutionStatus.Success
  ) {
    return (
      <AccessibleTooltipButton
        className='mx_ExecuteInstructionButton'
        title="instruction executed successfully" 
        onClick={null}
      >
        <CheckCircleIcon className="mx_ExecuteInstructionButton_icon" />
      </AccessibleTooltipButton>
    )
  }

  if (
    proposal.account.state !== ProposalState.Executing &&
    proposal.account.state !== ProposalState.ExecutingWithErrors &&
    proposal.account.state !== ProposalState.Succeeded
  ) {
    return null
  }

  if (ineligibleToSee) {
    return null
  }

  if (
    playing === PlayState.Unplayed &&
    proposalInstruction.account.executionStatus !==
      InstructionExecutionStatus.Error
  ) {
    return (
      <AccessibleButton className='mx_ExecuteInstructionButton' disabled={!connected} onClick={onExecuteInstruction}>
        Execute
      </AccessibleButton>
    )
  }

  if (playing === PlayState.Playing) {
    return <PlayIcon className="mx_ExecuteInstructionButton_icon" />
  }

  if (
    playing === PlayState.Error ||
    proposalInstruction.account.executionStatus ===
      InstructionExecutionStatus.Error
  ) {
    return (
      <AccessibleTooltipButton className='mx_ExecuteInstructionButton' title="retry to execute instruction" onClick={null}>
        <RefreshIcon
          onClick={onExecuteInstruction}
          className="mx_ExecuteInstructionButton_icon"
        />
      </AccessibleTooltipButton>
    )
  }

  return <CheckCircleIcon className="mx_ExecuteInstructionButton_icon" key="played" />
}
