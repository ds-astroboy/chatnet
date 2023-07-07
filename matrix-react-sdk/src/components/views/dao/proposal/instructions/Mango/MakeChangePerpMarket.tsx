/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '../../../../../../hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '../../../../../../utils/vote/formValidation'
import {
  UiInstruction,
  MangoMakeChangePerpMarketForm,
} from '../../../../../../utils/vote/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../NewProposal'
import useGovernanceAssets from '../../../../../../hooks/useGovernanceAssets'
import { Governance, GovernanceAccountType } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from '../../../../../../stores/vote/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { GovernedMultiTypeAccount } from '../../../../../../utils/vote/tokens'
import {
  BN,
  Config,
  I80F48,
  makeChangePerpMarketParams2Instruction,
  optionalBNFromString,
} from '@blockworks-foundation/mango-client'
import Field from '../../../../elements/Field'

const MakeChangePerpMarket = ({
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
  const [form, setForm] = useState<MangoMakeChangePerpMarketForm>({
    governedAccount: undefined,
    programId: programId?.toString(),
    mangoGroup: undefined,
    perpMarket: undefined,
    mngoPerPeriod: undefined,
    maxDepthBps: undefined,
    lmSizeShift: undefined,
    makerFee: undefined,
    takerFee: undefined,
    maintLeverage: undefined,
    initLeverage: undefined,
    liquidationFee: undefined,
    rate: undefined,
    exp: undefined,
    targetPeriodLength: undefined,
    version: undefined,
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
      const mangoGroup = new PublicKey(form.mangoGroup!)
      const perpMarket = new PublicKey(form.perpMarket!)
      const groupConfig = Config.ids().groups.find((c) =>
        c.publicKey.equals(mangoGroup)
      )!

      const instruction = makeChangePerpMarketParams2Instruction(
        groupConfig.mangoProgramId,
        mangoGroup,
        perpMarket,
        form.governedAccount.governance.pubkey,
        I80F48.fromOptionalString(form.maintLeverage),
        I80F48.fromOptionalString(form.initLeverage),
        I80F48.fromOptionalString(form.liquidationFee),
        I80F48.fromOptionalString(form.makerFee),
        I80F48.fromOptionalString(form.takerFee),
        I80F48.fromOptionalString(form.rate),
        I80F48.fromOptionalString(form.maxDepthBps),
        optionalBNFromString(form.targetPeriodLength),
        form.mngoPerPeriod
          ? new BN(
              Math.round(
                ((form.mngoPerPeriod as any) as number) * Math.pow(10, 6)
              )
            )
          : undefined,
        optionalBNFromString(form.exp),
        optionalBNFromString(form.version),
        optionalBNFromString(form.lmSizeShift)
      )

      serializedInstruction = serializeInstructionToBase64(instruction)
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

  const recommendedLmSizeShift =
    form.maxDepthBps &&
    Math.floor(Math.log2((form.maxDepthBps as any) as number) - 3)

  const recommendedMaintLeverage =
    form.initLeverage && ((form.initLeverage as any) as number) * 2

  const recommendedLiquidationFee =
    form.initLeverage && 1 / (((form.initLeverage as any) as number) * 4)

  return (
    <>
      {/* if you need more fields add theme to interface MangoMakeChangeMaxAccountsForm
        then you can add inputs in here */}
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
        name="Perp market"
        value={form.perpMarket}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'perpMarket',
          })
        }
      />

      <Field
        name="Mango per period"
        value={form.mngoPerPeriod}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'mngoPerPeriod',
          })
        }
      />
      <Field
        name="Max depth contracts"
        value={form.maxDepthBps}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'maxDepthBps',
          })
        }
      />

      <Field
        name={`Liquidity mining size shift (recommended: ${recommendedLmSizeShift})`}
        value={form.lmSizeShift}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'lmSizeShift',
          })
        }
      />
      <Field
        name="Maker fee"
        value={form.makerFee}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'makerFee',
          })
        }
      />
      <Field
        name="Taker fee"
        value={form.takerFee}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'takerFee',
          })
        }
      />

      <Field
        name="Initial leverage"
        value={form.initLeverage}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'initLeverage',
          })
        }
      />
      <Field
        name={`Maintenance leverage (recommended: ${recommendedMaintLeverage}`}
        value={form.maintLeverage}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'maintLeverage',
          })
        }
      />
      <Field
        name={`Liquidation fee (recommended: ${recommendedLiquidationFee}`}
        value={form.liquidationFee}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'liquidationFee',
          })
        }
      />

      <Field
        name="Rate (reset to 0.03 to prevent slow first block)"
        value={form.rate}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'rate',
          })
        }
      />

      <Field
        name="Exponent"
        value={form.exp}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'exp',
          })
        }
      />

      <Field
        name="Target period length in seconds"
        value={form.targetPeriodLength}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'targetPeriodLength',
          })
        }
      />

      <Field
        name="Version"
        value={form.version}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'version',
          })
        }
      />
    </>
  )
}

export default MakeChangePerpMarket
