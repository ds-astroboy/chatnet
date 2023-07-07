import {
    MangoAccount,
    makeSetDelegateInstruction,
  } from '@blockworks-foundation/mango-client'
  import useCreateProposal from '../../hooks/useCreateProposal'
  import useGovernanceAssets from '../../hooks/useGovernanceAssets'
  import useRealm from '../../hooks/useRealm'
  import {
    ProgramAccount,
    Governance,
    getInstructionDataFromBase64,
    serializeInstructionToBase64,
  } from '@solana/spl-governance'
  import { PublicKey } from '@solana/web3.js'
  import { abbreviateAddress } from '../../utils/vote/formatting'
  import { validateInstruction } from '../../utils/vote/instructionTools'
  import { notify } from '../../utils/vote/notifications'
  import { getValidatedPublickKey } from '../../utils/vote/validations'
  import { InstructionDataWithHoldUpTime } from '../../actions/createProposal'
  import React, { useState } from 'react'
  import { MarketStore } from '../store/marketStore'
  import * as yup from 'yup'
import AdditionalProposalOptions from '../../components/views/dao/AdditionalProposalOptions'
import Field from '../../components/views/elements/Field'
import AccessibleButton from '../../components/views/elements/AccessibleButton'
import AccessibleTooltipButton from '../../components/views/elements/AccessibleTooltipButton'
import Spinner from '../../components/views/elements/Spinner'
  
  const DelegateForm = ({
    selectedMangoAccount,
    governance,
    market,
  }: {
    selectedMangoAccount: MangoAccount
    governance: ProgramAccount<Governance>
    market: MarketStore
  }) => {
    const { symbol } = useRealm()
    const { handleCreateProposal } = useCreateProposal()
    const { canUseTransferInstruction } = useGovernanceAssets()
    const groupConfig = market.groupConfig!
    const [voteByCouncil, setVoteByCouncil] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [form, setForm] = useState({
      title: '',
      description: '',
      delegateAddress: '',
    })
    const [formErrors, setFormErrors] = useState({})
    const proposalTitle = `Set delegate for MNGO account: ${abbreviateAddress(
      selectedMangoAccount?.publicKey
    )}`
    const handleSetForm = ({ propertyName, value }) => {
      setFormErrors({})
      setForm({ ...form, [propertyName]: value })
    }
  
    const handleProposeDelegate = async () => {
      const isValid = await validateInstruction({ schema, form, setFormErrors })
      if (!isValid) {
        return
      }
      setIsLoading(true)
      const delegateMangoAccount = makeSetDelegateInstruction(
        groupConfig.mangoProgramId,
        groupConfig.publicKey,
        selectedMangoAccount!.publicKey,
        governance!.pubkey,
        new PublicKey(form.delegateAddress)
      )
      try {
        const instructionData: InstructionDataWithHoldUpTime = {
          data: getInstructionDataFromBase64(
            serializeInstructionToBase64(delegateMangoAccount)
          ),
          holdUpTime: governance!.account!.config.minInstructionHoldUpTime,
          prerequisiteInstructions: [],
        }
        const proposalAddress = await handleCreateProposal({
          title: form.title || proposalTitle,
          description: form.description,
          instructionsData: [instructionData],
          governance: governance!,
          voteByCouncil,
        })
        // const url = fmtUrlWithCluster(
        //   `/dao/${symbol}/proposal/${proposalAddress}`
        // )
        // router.push(url)
      } catch (e) {
        console.log(e)
        notify({ type: 'error', message: "Can't create proposal" })
      }
    }
    const schema = yup.object().shape({
      delegateAddress: yup
        .string()
        .test(
          'accountTests',
          'Delegate address validation error',
          function (val: string) {
            if (val) {
              try {
                return !!getValidatedPublickKey(val)
              } catch (e) {
                console.log(e)
                return this.createError({
                  message: `${e}`,
                })
              }
            } else {
              return this.createError({
                message: `Delegate address is required`,
              })
            }
          }
        ),
    })
    let Button: React.ComponentType<React.ComponentProps<typeof AccessibleButton>> = AccessibleButton;
    if(!canUseTransferInstruction || !form.delegateAddress) {
        Button = AccessibleTooltipButton;
    }
    return (
      <div>
        <Field
          label={'Delegate address'}
          value={form.delegateAddress}
          type="text"
          onChange={(e) =>
            handleSetForm({
              value: e.target.value,
              propertyName: 'delegateAddress',
            })
          }
        />
        <AdditionalProposalOptions
          title={form.title}
          description={form.description}
          defaultTitle={proposalTitle}
          setTitle={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'title',
            })
          }
          setDescription={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'description',
            })
          }
          voteByCouncil={voteByCouncil}
          setVoteByCouncil={setVoteByCouncil}
        />
        <Button
          className="w-full mt-6"
          onClick={handleProposeDelegate}
          disabled={
            !form.delegateAddress || !canUseTransferInstruction || isLoading
          }
          title={
            !canUseTransferInstruction
              ? 'Please connect wallet with enough voting power to create treasury proposals'
              : !form.delegateAddress
              ? 'Please input address'
              : ''
          }
        >
          
            {!isLoading ? 'Propose delegate' : <Spinner/>}
        </Button>
      </div>
    )
  }
  
  export default DelegateForm
  