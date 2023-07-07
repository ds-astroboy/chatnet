import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { createAssociatedTokenAccount } from '../../../../../utils/vote/associated'
import { isFormValid } from '../../../../../utils/vote/formValidation'
import { getSplTokenMintAddressByUIName, SPL_TOKENS } from '../../../../../utils/vote/splTokens'
import {
  CreateAssociatedTokenAccountForm,
  UiInstruction,
} from '../../../../../utils/vote/uiTypes/proposalCreationTypes'

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { NewProposalContext } from '../NewProposal'
import GovernedAccountSelect from '../GovernedAccountSelect'
import useGovernedMultiTypeAccounts from '../../../../../hooks/useGovernedMultiTypeAccounts'
import useRealm from '../../../../../hooks/useRealm'
import useWalletStore from '../../../../../stores/vote/useWalletStore'

const CreateAssociatedTokenAccount = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()

  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()

  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<CreateAssociatedTokenAccountForm>({})
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()

    if (
      !connection ||
      !isValid ||
      !programId ||
      !form.governedAccount?.governance?.account ||
      !form.splTokenMintUIName ||
      !wallet?.publicKey
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    const [tx] = await createAssociatedTokenAccount(
      // fundingAddress
      wallet.publicKey,

      // walletAddress
      form.governedAccount.governance.pubkey,

      // splTokenMintAddress
      getSplTokenMintAddressByUIName(form.splTokenMintUIName)
    )

    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [programId])

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    splTokenMintUIName: yup.string().required('SPL Token Mint is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={governedMultiTypeAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />

      <select
        value={form.splTokenMintUIName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'splTokenMintUIName' })
        }
      >
        {Object.entries(SPL_TOKENS).map(([key, { name, mint }]) => (
          <option key={key} value={name}>
            <div className="flex flex-col">
              <span>{name}</span>

              <span className="text-gray-500 text-sm">{mint.toString()}</span>
            </div>
          </option>
        ))}
      </select>
    </>
  )
}

export default CreateAssociatedTokenAccount
