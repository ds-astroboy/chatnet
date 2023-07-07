import useProposal from '../../../../hooks/useProposal'
import InstructionCard from './instructionCard'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import React, { useEffect, useRef, useState } from 'react'
import useWalletStore from '../../../../stores/vote/useWalletStore'
import { RpcContext } from '@solana/spl-governance'
import useRealm from '../../../../hooks/useRealm'
import { getProgramVersionForRealm } from '../../../../apis/registry/api'
import {
  ExecuteAllInstructionButton,
  PlayState,
} from './ExecuteAllInstructionButton'

export function InstructionPanel() {
  const { instructions, proposal } = useProposal()
  const { realmInfo } = useRealm()
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)

  const [currentSlot, setCurrentSlot] = useState(0)

  const canExecuteAt = proposal!.account.votingCompletedAt
    ? proposal!.account.votingCompletedAt.toNumber() + 1
    : 0

  const ineligibleToSee = currentSlot - canExecuteAt >= 0

  useEffect(() => {
    if (ineligibleToSee && proposal) {
      const rpcContext = new RpcContext(
        proposal?.owner,
        getProgramVersionForRealm(realmInfo!),
        wallet!,
        connection.current,
        connection.endpoint
      )

      const timer = setTimeout(() => {
        rpcContext.connection
          .getSlot()
          .then((resp) => (mounted.current ? setCurrentSlot(resp) : null))
      }, 5000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [ineligibleToSee, connection, currentSlot])

  if (Object.values(instructions).length === 0) {
    return null
  }

  const proposalInstructions = Object.values(instructions).sort(
    (i1, i2) => i1.account.instructionIndex - i2.account.instructionIndex
  )

  const [playing, setPlaying] = useState(
    proposalInstructions.every((x) => x.account.executedAt)
      ? PlayState.Played
      : PlayState.Unplayed
  )

  return (
    <div className='mx_InstructionPanel'>
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button
              className={`mx_InstructionPanel_button ${
                open ? 'opened' : ''
              }`}
            >
              <div className="mx_InstructionPanel_button_content">
                Instructions
              </div>
              <ChevronDownIcon
                className={`mx_InstructionPanel_button_icon ${
                  open ? 'bottom' : 'top'
                }`}
              />
            </Disclosure.Button>
            <Disclosure.Panel
              className={`mx_InstructionPanel_body`}
            >
              {proposalInstructions.map((pi, idx) => (
                <div key={pi.pubkey.toBase58()}>
                  {proposal && (
                    <InstructionCard
                      proposal={proposal}
                      index={idx + 1}
                      proposalInstruction={pi}
                    />
                  )}
                </div>
              ))}

              {proposal && proposalInstructions.length > 1 && (
                <div className="mx_InstructionPanel_body_buttonGroup">
                  <ExecuteAllInstructionButton
                    proposal={proposal}
                    proposalInstructions={proposalInstructions}
                    playing={playing}
                    setPlaying={setPlaying}
                  />
                </div>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  )
}
