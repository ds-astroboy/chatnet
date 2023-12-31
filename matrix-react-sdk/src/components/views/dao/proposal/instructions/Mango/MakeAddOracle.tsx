/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '../../../../../../hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '../../../../../../utils/vote/formValidation'
import {
  UiInstruction,
  MangoMakeAddOracleForm,
} from '../../../../../../utils/vote/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../NewProposal'
import useGovernanceAssets from '../../../../../../hooks/useGovernanceAssets'
import { Governance, GovernanceAccountType } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from '../../../../../../stores/vote/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { GovernedMultiTypeAccount } from '../../../../../../utils/vote/tokens'
import { makeAddOracleInstruction } from '@blockworks-foundation/mango-client'
import Field from '../../../../elements/Field'

const MakeAddOracle = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { getGovernancesByAccountTypes } = useGovernanceAssets()
  const governedProgramAccounts = getGovernancesByAccountTypes([
    GovernanceAccountType.ProgramGovernanceV1,
    GovernanceAccountType.ProgramGovernanceV2,
  ]).map((x) => {
    return {
      governance: x,
    }
  })
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<MangoMakeAddOracleForm>({
    governedAccount: undefined,
    programId: programId?.toString(),
    mangoGroup: undefined,
    oracleAccount: undefined,
  })
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
    let serializedInstruction = ''
    if (
      isValid &&
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      //Mango instruction call and serialize
      const addOracleIx = makeAddOracleInstruction(
        form.governedAccount.governance.account.governedAccount,
        new PublicKey(form.mangoGroup!),
        new PublicKey(form.oracleAccount!),
        form.governedAccount.governance.pubkey
      )

      serializedInstruction = serializeInstructionToBase64(addOracleIx)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }
  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape({
    bufferAddress: yup.number(),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Program"
        governedAccounts={governedProgramAccounts as GovernedMultiTypeAccount[]}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <Field
        name="Mango group"
        value={form.mangoGroup}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'mangoGroup',
          })
        }
      />
      <Field
        name="Oracle account"
        value={form.oracleAccount}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'oracleAccount',
          })
        }
      />
    </>
  )
}

export default MakeAddOracle
