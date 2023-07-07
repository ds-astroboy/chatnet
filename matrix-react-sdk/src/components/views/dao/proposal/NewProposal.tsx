import React, { createContext, FC, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  ArrowLeftIcon,
  PlusCircleIcon,
  XCircleIcon,
} from '@heroicons/react/outline'
import {
  getInstructionDataFromBase64,
  Governance,
  GovernanceAccountType,
  ProgramAccount,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { formValidation, isFormValid } from '../../../../utils/vote/formValidation'
import {
  ComponentInstructionData,
  Instructions,
  InstructionsContext,
  UiInstruction,
} from '../../../../utils/vote/uiTypes/proposalCreationTypes'
import useWalletStore from '../../../../stores/vote/useWalletStore'
import { notify } from '../../../../utils/vote/notifications'
import Clawback from '../../../../VoteStakeRegistry/components/instructions/Clawback'
import Grant from '../../../../VoteStakeRegistry/components/instructions/Grant'
import InstructionContentContainer from './components/InstructionContentContainer'
import ProgramUpgrade from './instructions/bpfUpgradeableLoader/ProgramUpgrade'
import CreateAssociatedTokenAccount from './instructions/CreateAssociatedTokenAccount'
import CustomBase64 from './instructions/CustomBase64'
import Empty from './instructions/Empty'
import MakeChangeMaxAccounts from './instructions/Mango/MakeChangeMaxAccounts'
import MakeChangeReferralFeeParams from './instructions/Mango/MakeChangeReferralFeeParams'
import Mint from './instructions/Mint'
import CreateObligationAccount from './instructions/Solend/CreateObligationAccount'
import DepositReserveLiquidityAndObligationCollateral from './instructions/Solend/DepositReserveLiquidityAndObligationCollateral'
import InitObligationAccount from './instructions/Solend/InitObligationAccount'
import RefreshObligation from './instructions/Solend/RefreshObligation'
import RefreshReserve from './instructions/Solend/RefreshReserve'
import WithdrawObligationCollateralAndRedeemReserveLiquidity from './instructions/Solend/WithdrawObligationCollateralAndRedeemReserveLiquidity'
import SplTokenTransfer from './instructions/SplTokenTransfer'
import VoteBySwitch from './components/VoteBySwitch'
import FriktionDeposit from './instructions/Friktion/FriktionDeposit'
import CreateNftPluginRegistrar from './instructions/NftVotingPlugin/CreateRegistrar'
import CreateNftPluginMaxVoterWeightRecord from './instructions/NftVotingPlugin/CreateMaxVoterWeightRecord'
import ConfigureNftPluginCollection from './instructions/NftVotingPlugin/ConfigureCollection'
import FriktionWithdraw from './instructions/Friktion/FriktionWithdraw'
import MakeChangePerpMarket from './instructions/Mango/MakeChangePerpMarket'
import MakeAddOracle from './instructions/Mango/MakeAddOracle'
import MakeAddSpotMarket from './instructions/Mango/MakeAddSpotMarket'
import MakeChangeSpotMarket from './instructions/Mango/MakeChangeSpotMarket'
import MakeCreatePerpMarket from './instructions/Mango/MakeCreatePerpMarket'
import useCreateProposal from '../../../../hooks/useCreateProposal'
import RealmConfig from './instructions/RealmConfig'
import useGovernanceAssets from '../../../../hooks/useGovernanceAssets'
import useRealm from '../../../../hooks/useRealm'
import { getTimestampFromDays } from '../../../../tools/sdk/units'
import Field from '../../elements/Field'
import AccessibleButton from '../../elements/AccessibleButton'
import Dropdown from "../../elements/Dropdown";
import Spinner from '../../elements/Spinner'
import dis from "../../../../dispatcher/dispatcher";

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
})
const defaultGovernanceCtx: InstructionsContext = {
  instructionsData: [],
  handleSetInstructions: () => null,
  governance: null,
  setGovernance: () => null,
}
export const NewProposalContext = createContext<InstructionsContext>(
  defaultGovernanceCtx
)

// Takes the first encountered governance account
function extractGovernanceAccountFromInstructionsData(
  instructionsData: ComponentInstructionData[]
): ProgramAccount<Governance> | null {
  return (
    instructionsData.find((itx) => itx.governedAccount)?.governedAccount ?? null
  )
}

const NewProposal: FC<{onFinished: () => void}> = ({
  onFinished
}) => {
  const { handleCreateProposal } = useCreateProposal()
  const { symbol, realm, realmDisplayName, canChooseWhoVote } = useRealm()

  const { getAvailableInstructions } = useGovernanceAssets();
  const availableInstructions = getAvailableInstructions()
  const {
    fetchRealmGovernance,
    fetchTokenAccountsForSelectedRealmGovernances,
  } = useWalletStore((s) => s.actions)
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [
    governance,
    setGovernance,
  ] = useState<ProgramAccount<Governance> | null>(null)
  const [isLoadingSignedProposal, setIsLoadingSignedProposal] = useState(false)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const isLoading = isLoadingSignedProposal || isLoadingDraft
  const customInstructionFilterForSelectedGovernance = (
    instructionType: Instructions
  ) => {
    if (!governance) {
      return true
    } else {
      const governanceType = governance.account.accountType
      const instructionsAvailiableAfterProgramGovernance = [Instructions.Base64]
      switch (governanceType) {
        case GovernanceAccountType.ProgramGovernanceV1:
        case GovernanceAccountType.ProgramGovernanceV2:
          return instructionsAvailiableAfterProgramGovernance.includes(
            instructionType
          )
        default:
          return true
      }
    }
  }

  const getAvailableInstructionsForIndex = (index) => {
    if (index === 0) {
      return availableInstructions
    } else {
      return availableInstructions.filter((x) =>
        customInstructionFilterForSelectedGovernance(x.id)
      )
    }
  }
  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: availableInstructions[0] }])
  const handleSetInstructions = (val: any, index) => {
    const newInstructions = [...instructionsData]
    newInstructions[index] = { ...instructionsData[index], ...val }
    setInstructions(newInstructions)
  }
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const setInstructionType = ({ availableInstructionsForIdx, value, idx }) => {
    let val = availableInstructionsForIdx?.find(item => item.name === value);
    const newInstruction = {
      type: val,
    }
    handleSetInstructions(newInstruction, idx)
  }
  const addInstruction = () => {
    setInstructions([...instructionsData, { type: undefined }])
  }
  const removeInstruction = (idx) => {
    setInstructions([...instructionsData.filter((x, index) => index !== idx)])
  }
  const handleGetInstructions = async () => {
    const instructions: UiInstruction[] = []
    for (const inst of instructionsData) {
      if (inst.getInstruction) {
        const instruction: UiInstruction = await inst?.getInstruction()
        instructions.push(instruction)
      }
    }
    return instructions
  }
  const handleTurnOffLoaders = () => {
    setIsLoadingSignedProposal(false)
    setIsLoadingDraft(false)
  }
  const handleCreate = async (isDraft) => {
    setFormErrors({})
    if (isDraft) {
      setIsLoadingDraft(true)
    } else {
      setIsLoadingSignedProposal(true)
    }

    const { isValid, validationErrors }: formValidation = await isFormValid(
      schema,
      form
    )

    const instructions: UiInstruction[] = await handleGetInstructions()
    let proposalAddress: PublicKey | null = null
    if (!realm) {
      handleTurnOffLoaders()
      throw 'No realm selected'
    }

    if (isValid && instructions.every((x: UiInstruction) => x.isValid)) {
      let selectedGovernance = governance
      if (!governance) {
        handleTurnOffLoaders()
        throw Error('No governance selected')
      }
      const instructionsData = instructions.map((x) => {
        return {
          data: x.serializedInstruction
            ? getInstructionDataFromBase64(x.serializedInstruction)
            : null,
          holdUpTime: x.customHoldUpTime
            ? getTimestampFromDays(x.customHoldUpTime)
            : selectedGovernance?.account?.config.minInstructionHoldUpTime,
          prerequisiteInstructions: x.prerequisiteInstructions || [],
          chunkSplitByDefault: x.chunkSplitByDefault || false,
          signers: x.signers,
          shouldSplitIntoSeparateTxs: x.shouldSplitIntoSeparateTxs,
        }
      })

      try {
        // Fetch governance to get up to date proposalCount
        selectedGovernance = (await fetchRealmGovernance(
          governance.pubkey
        )) as ProgramAccount<Governance>

        proposalAddress = await handleCreateProposal({
          title: form.title,
          description: form.description,
          governance: selectedGovernance,
          instructionsData,
          voteByCouncil,
          isDraft,
        })

        onFinished();
        console.log("============proposalAddress===========", proposalAddress.toBase58());
        dis.dispatch({
          action: "show_dao_proposal",
          proposalPk: proposalAddress.toBase58(),
          symbol
        })
      } catch (ex) {
        notify({ type: 'error', message: `${ex}` })
      }
    } else {
      setFormErrors(validationErrors)
    }
    handleTurnOffLoaders()
  }
  useEffect(() => {
    setInstructions([instructionsData[0]])
  }, [instructionsData[0].governedAccount?.pubkey])

  useEffect(() => {
    const governedAccount = extractGovernanceAccountFromInstructionsData(
      instructionsData
    )

    setGovernance(governedAccount)
  }, [instructionsData])

  useEffect(() => {
    //fetch to be up to date with amounts
    fetchTokenAccountsForSelectedRealmGovernances()
  }, [])

  const getCurrentInstruction = ({ typeId, idx }) => {
    switch (typeId) {
      case Instructions.Transfer:
        return (
          <SplTokenTransfer
            index={idx}
            governance={governance}
          ></SplTokenTransfer>
        )
      case Instructions.ProgramUpgrade:
        return (
          <ProgramUpgrade index={idx} governance={governance}></ProgramUpgrade>
        )
      case Instructions.CreateAssociatedTokenAccount:
        return (
          <CreateAssociatedTokenAccount index={idx} governance={governance} />
        )
      case Instructions.DepositIntoVolt:
        return <FriktionDeposit index={idx} governance={governance} />
      case Instructions.WithdrawFromVolt:
        return <FriktionWithdraw index={idx} governance={governance} />
      case Instructions.CreateSolendObligationAccount:
        return <CreateObligationAccount index={idx} governance={governance} />
      case Instructions.InitSolendObligationAccount:
        return <InitObligationAccount index={idx} governance={governance} />
      case Instructions.DepositReserveLiquidityAndObligationCollateral:
        return (
          <DepositReserveLiquidityAndObligationCollateral
            index={idx}
            governance={governance}
          />
        )
      case Instructions.RefreshSolendObligation:
        return <RefreshObligation index={idx} governance={governance} />
      case Instructions.RefreshSolendReserve:
        return <RefreshReserve index={idx} governance={governance} />
      case Instructions.WithdrawObligationCollateralAndRedeemReserveLiquidity:
        return (
          <WithdrawObligationCollateralAndRedeemReserveLiquidity
            index={idx}
            governance={governance}
          />
        )
      case Instructions.Mint:
        return <Mint index={idx} governance={governance}></Mint>
      case Instructions.Base64:
        return <CustomBase64 index={idx} governance={governance}></CustomBase64>
      case Instructions.CreateNftPluginRegistrar:
        return (
          <CreateNftPluginRegistrar
            index={idx}
            governance={governance}
          ></CreateNftPluginRegistrar>
        )
      case Instructions.ConfigureNftPluginCollection:
        return (
          <ConfigureNftPluginCollection
            index={idx}
            governance={governance}
          ></ConfigureNftPluginCollection>
        )
      case Instructions.CreateNftPluginMaxVoterWeight:
        return (
          <CreateNftPluginMaxVoterWeightRecord
            index={idx}
            governance={governance}
          ></CreateNftPluginMaxVoterWeightRecord>
        )
      case Instructions.None:
        return <Empty index={idx} governance={governance}></Empty>
      case Instructions.MangoAddOracle:
        return (
          <MakeAddOracle index={idx} governance={governance}></MakeAddOracle>
        )
      case Instructions.MangoAddSpotMarket:
        return (
          <MakeAddSpotMarket
            index={idx}
            governance={governance}
          ></MakeAddSpotMarket>
        )
      case Instructions.MangoChangeMaxAccounts:
        return (
          <MakeChangeMaxAccounts
            index={idx}
            governance={governance}
          ></MakeChangeMaxAccounts>
        )
      case Instructions.MangoChangePerpMarket:
        return (
          <MakeChangePerpMarket
            index={idx}
            governance={governance}
          ></MakeChangePerpMarket>
        )
      case Instructions.MangoChangeReferralFeeParams:
        return (
          <MakeChangeReferralFeeParams
            index={idx}
            governance={governance}
          ></MakeChangeReferralFeeParams>
        )
      case Instructions.MangoChangeSpotMarket:
        return (
          <MakeChangeSpotMarket
            index={idx}
            governance={governance}
          ></MakeChangeSpotMarket>
        )
      case Instructions.MangoCreatePerpMarket:
        return (
          <MakeCreatePerpMarket
            index={idx}
            governance={governance}
          ></MakeCreatePerpMarket>
        )
      case Instructions.RealmConfig:
        return <RealmConfig index={idx} governance={governance}></RealmConfig>
      case Instructions.Grant:
        return <Grant index={idx} governance={governance}></Grant>
      case Instructions.Clawback:
        return <Clawback index={idx} governance={governance}></Clawback>
      default:
        null
    }
  }

  return (
    <div className="mx_NewProposal">
      <div className='mx_NewProposal_header'>
        <div className='mx_NewProposal_backButton'>
            <ArrowLeftIcon className="mx_NewProposal_backButton_icon" />
            <div className='mx_NewProposal_backButton_content'>Back</div>
        </div>
        <div className="mx_NewProposal_header_title">
            Add a proposal
            {realmDisplayName ? ` to ${realmDisplayName}` : ``}{' '}
        </div>
      </div>
      <div className="mx_NewProposal_body">
        <Field
          className='mx_NewProposal_title'
          label="Title"
          placeholder="Title of your proposal"
          value={form.title}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'title',
            })
          }
        />
        <Field
          className="mx_NewProposal_description"
          label="Description"
          placeholder="Description of your proposal"
          type='text'
          element='textarea'
          value={form.description}
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'description',
            })
          }
        />
        {/* {true && ( */}
        {canChooseWhoVote && (
          <VoteBySwitch
            checked={voteByCouncil}
            onChange={() => {
              setVoteByCouncil(!voteByCouncil)
            }}
          ></VoteBySwitch>
        )}
        <NewProposalContext.Provider
          value={{
            instructionsData,
            handleSetInstructions,
            governance,
            setGovernance,
          }}
        >
          <div className='mx_NewProposal_instructions'>
            <div className='mx_NewProposal_instructions_title'>Instructions</div>
            {instructionsData.map((instruction, idx) => {
              const availableInstructionsForIdx = getAvailableInstructionsForIndex(
                idx
              )
              return (
                <div 
                  key={idx}
                  className="mx_NewProposal_instruction"
                >
                  <div className='mx_NewProposal_instruction_title'>
                    {`Instruction ${idx + 1}`}
                  </div>
                  <Dropdown
                    className="mx_NewProposal_instruction_dropdown"
                    disabled={!getAvailableInstructionsForIndex.length}
                    onOptionChange={(value) => setInstructionType({ availableInstructionsForIdx, value, idx })}
                    value={instruction.type?.name}
                  >
                    {availableInstructionsForIdx.map((inst) => (
                      <div key={inst.name} className="mx_NewProposal_instruction_dropdown_option">
                        <div className='mx_NewProposal_instruction_dropdown_mainContent'>{inst.name}</div>
                      </div>
                    ))}
                  </Dropdown>
                  <div>
                    <InstructionContentContainer
                      idx={idx}
                      instructionsData={instructionsData}
                    >
                      {getCurrentInstruction({
                        typeId: instruction.type?.id,
                        idx,
                      })}
                    </InstructionContentContainer>
                    {idx !== 0 && (
                      <AccessibleButton
                        className="mx_NewProposal_instruction_button remove"
                        onClick={() => removeInstruction(idx)}
                      >
                        <XCircleIcon className="mx_NewProposal_instruction_button_icon" />
                        <div className='mx_NewProposal_instruction_button_content'>
                          Remove
                        </div>
                      </AccessibleButton>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </NewProposalContext.Provider>
        <div className="">
          <AccessibleButton
            className="mx_NewProposal_addInstruction"
            onClick={addInstruction}
          >
            <PlusCircleIcon className="mx_NewProposal_addInstruction_icon" />
            <div className='mx_NewProposal_addInstruction_content'>
              Add instruction
            </div>
          </AccessibleButton>
        </div>        
      </div>
      <div className='mx_NewProposal_footer'>
        {
          isLoading?
          <Spinner/>
          :
          (
            <div className="mx_NewProposal_buttonGroup">
              {/* <AccessibleButton
                className='mx_NewProposal_button draft'
                disabled={isLoading}
                onClick={() => handleCreate(true)}
              >
                Save draft
              </AccessibleButton> */}
              <AccessibleButton
                className='mx_NewProposal_button add'
                disabled={isLoading}
                onClick={() => handleCreate(false)}
              >
                Add proposal
              </AccessibleButton>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default NewProposal
