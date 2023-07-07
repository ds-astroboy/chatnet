import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
} from '@solana/spl-governance'
import { validateInstruction } from '../../../../../utils/vote/instructionTools'
import {
  Base64InstructionForm,
  UiInstruction,
} from '../../../../../utils/vote/uiTypes/proposalCreationTypes'

import useWalletStore from '../../../../../stores/vote/useWalletStore'

import { NewProposalContext } from '../NewProposal'
import GovernedAccountSelect from '../GovernedAccountSelect'
import useGovernedMultiTypeAccounts from '../../../../../hooks/useGovernedMultiTypeAccounts'
import useRealm from '../../../../../hooks/useRealm'
import Field from '../../../elements/Field'

const CustomBase64 = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { ownVoterWeight } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()
  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<Base64InstructionForm>({
    governedAccount: undefined,
    base64: '',
    holdUpTime: 0,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      serializedInstruction = form.base64
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
      customHoldUpTime: form.holdUpTime,
    }
    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    base64: yup
      .string()
      .required('Instruction is required')
      .test('base64Test', 'Invalid base64', function (val: string) {
        if (val) {
          try {
            getInstructionDataFromBase64(val)
            return true
          } catch (e) {
            return false
          }
        } else {
          return this.createError({
            message: `Instruction is required`,
          })
        }
      }),
  })
  const validateAmountOnBlur = () => {
    const value = form.holdUpTime

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(0),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
        ).toFixed()
      ),
      propertyName: 'holdUpTime',
    })
  }
  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={governedMultiTypeAccounts.filter((x) =>
          ownVoterWeight.canCreateProposal(x.governance.account.config)
        )}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />
      <Field
        min={0}
        label="Hold up time (days)"
        value={form.holdUpTime?.toString()}
        type="number"
        onChange={(event) => {
          handleSetForm({
            value: event.target.value,
            propertyName: 'holdUpTime',
          })
        }}
        step={1}
        onBlur={validateAmountOnBlur}
      />
      <textarea
        name="Instruction"
        placeholder="Base64 encoded serialized Solana instruction"
        value={form.base64}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'base64',
          })
        }
      ></textarea>
    </>
  )
}

export default CustomBase64
