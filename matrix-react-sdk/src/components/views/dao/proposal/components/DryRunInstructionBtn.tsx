import { getExplorerInspectorUrl } from '../../explorer/tools'
import { getInstructionDataFromBase64 } from '@solana/spl-governance'
import { SimulatedTransactionResponse, Transaction } from '@solana/web3.js'
import { notify } from '../../../../../utils/vote/notifications'
import { UiInstruction } from '../../../../../utils/vote/uiTypes/proposalCreationTypes'
import { dryRunInstruction } from '../../../../../actions/dryRunInstruction'
import React, { useState } from 'react'
import useWalletStore from '../../../../../stores/vote/useWalletStore'
import AccessibleButton from '../../../elements/AccessibleButton'
import Spinner from '../../../elements/Spinner'
import BaseDialog from "../../../dialogs/BaseDialog"

const DryRunInstructionBtn = ({
  getInstructionDataFcn,
  btnClassNames,
}: {
  getInstructionDataFcn: (() => Promise<UiInstruction>) | undefined
  btnClassNames: string
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<{
    response: SimulatedTransactionResponse
    transaction: Transaction
  } | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const onInspect = () => {
    if (result) {
      const inspectUrl = getExplorerInspectorUrl(
        connection.endpoint,
        result.transaction
      )
      window.open(inspectUrl, '_blank')
    } else {
      notify({ type: 'error', message: 'no results to inspect' })
    }
  }
  const handleDryRun = async () => {
    try {
      if (!getInstructionDataFcn) {
        throw 'No get instructionDataFcn provided'
      }
      setIsPending(true)
      const instructionData = await getInstructionDataFcn()
      const prerequisiteInstructionsToRun =
        instructionData.prerequisiteInstructions
      if (!instructionData?.isValid) {
        setIsPending(false)
        throw new Error('Invalid instruction')
      }
      const result = await dryRunInstruction(
        connection.current,
        wallet!,
        getInstructionDataFromBase64(instructionData?.serializedInstruction),
        prerequisiteInstructionsToRun
      )
      setResult(result)
      setIsOpen(true)
    } catch (ex) {
      notify({
        type: 'error',
        message: `Can't simulate transaction`,
        description: 'The instruction is invalid',
      })
      console.error('Simulation error', ex)
    } finally {
      setIsPending(false)
    }
  }
  const onClose = () => {
    setIsOpen(false)
    setResult(null)
  }
  function getLogTextType(text: string) {
    // Use some heuristics to highlight  error and success log messages

    text = text.toLowerCase()

    if (text.includes('failed')) {
      return 'text-red'
    }

    if (text.includes('success')) {
      return 'text-green'
    }
  }
  return (
    <>
      <AccessibleButton
        className={btnClassNames}
        onClick={handleDryRun}
        disabled={isPending || !wallet?.connected}
      >
        {isPending ? <Spinner/> : 'Preview instruction'}
      </AccessibleButton>

      {result?.response && (
        <BaseDialog onClose={onClose} isOpen={isOpen}>
          <h2>
            {result?.response.err
              ? 'Simulation error'
              : 'Simulation successful'}
          </h2>
          <ul className="break-all instruction-log-list text-sm">
            {result?.response.logs?.map((log, i) => (
              <li className="mb-3" key={i}>
                <div className={getLogTextType(log)}>{log}</div>
              </li>
            ))}
          </ul>
          <div className="flex items-center pt-3">
            <AccessibleButton onClick={onInspect}>Inspect</AccessibleButton>
            <AccessibleButton className="font-bold ml-4" onClick={onClose}>
              Close
            </AccessibleButton>
          </div>
        </BaseDialog>
      )}
    </>
  )
}

export default DryRunInstructionBtn
