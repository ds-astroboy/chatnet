import React, { FC, useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import useRealm from '../../../../hooks/useRealm'
import { getMintMinAmountAsDecimal } from '../../../../tools/sdk/units'
import { abbreviateAddress, precision } from '../../../../utils/vote/formatting'
import useWalletStore from '../../../../stores/vote/useWalletStore'
import { getMintSchema } from '../../../../utils/vote/validations'
import { MintForm, UiInstruction } from '../../../../utils/vote/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '../../../../hooks/useGovernanceAssets'
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
} from '@solana/spl-governance'
import { notify } from '../../../../utils/vote/notifications'
import { getMintInstruction } from '../../../../utils/vote/instructionTools'
import AddMemberIcon from './AddMemberIcon'
import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
} from '@heroicons/react/outline'
import useCreateProposal from '../../../../hooks/useCreateProposal'
import VoteBySwitch from '../proposal/components/VoteBySwitch'
import Field from '../../elements/Field'
import AccessibleButton from '../../elements/AccessibleButton'
import BaseDialog from "../../dialogs/BaseDialog"
import Spinner from '../../elements/Spinner'
import dis from "../../../../dispatcher/dispatcher"

interface AddMemberForm extends MintForm {
  description: string
  title: string
}

interface IProps {
  onFinished(): void;
  onParentFinished(): void;
}

const AddMemberForm: FC<IProps> = ({ 
  onFinished,
  onParentFinished
}) => {
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const { handleCreateProposal } = useCreateProposal()
  const routers = location.href.split("/");
  const symbol = routers? routers[5] : undefined;
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const { getMintWithGovernances } = useGovernanceAssets()

  const { realmInfo, canChooseWhoVote, councilMint, realm } = useRealm()

  const programId: PublicKey | undefined = realmInfo?.programId

  const [form, setForm] = useState<AddMemberForm>({
    destinationAccount: '',
    amount: 1,
    mintAccount: undefined,
    programId: programId?.toString(),
    description: '',
    title: '',
  })

  const schema = getMintSchema({ form, connection })

  const mintMinAmount = form.mintAccount
    ? getMintMinAmountAsDecimal(councilMint!)
    : 1

  const currentPrecision = precision(mintMinAmount)

  const proposalTitle = `Add council member ${
    form.destinationAccount
      ? abbreviateAddress(new PublicKey(form.destinationAccount))
      : ''
  }`

  const setAmount = (event) => {
    const value = event.target.value

    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
  }

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateAmountOnBlur = () => {
    const value = form.amount

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
        ).toFixed(currentPrecision)
      ),
      propertyName: 'amount',
    })
  }

  const getInstruction = async (): Promise<UiInstruction> => {
    return getMintInstruction({
      schema,
      form,
      programId,
      connection,
      wallet,
      governedMintInfoAccount: form.mintAccount,
      setFormErrors,
    })
  }

  //TODO common handle propose
  const handlePropose = async () => {
    setIsLoading(true)

    const instruction: UiInstruction = await getInstruction()

    if (instruction.isValid && wallet && realmInfo) {
      const governance = form.mintAccount?.governance

      let proposalAddress: PublicKey | null = null

      if (!realm) {
        setIsLoading(false)

        throw new Error('No realm selected')
      }
      const instructionData = {
        data: instruction.serializedInstruction
          ? getInstructionDataFromBase64(instruction.serializedInstruction)
          : null,
        holdUpTime: governance?.account?.config.minInstructionHoldUpTime,
        prerequisiteInstructions: instruction.prerequisiteInstructions || [],
      }

      try {
        const selectedGovernance = (await fetchRealmGovernance(
          governance?.pubkey
        )) as ProgramAccount<Governance>

        proposalAddress = await handleCreateProposal({
          title: form.title ? form.title : proposalTitle,
          description: form.description ? form.description : '',
          governance: selectedGovernance,
          instructionsData: [instructionData],
          voteByCouncil,
          isDraft: false,
        })

        console.log("=========proposalAddress============", proposalAddress);

        onFinished()
        onParentFinished();
        
        dis.dispatch({
          action: "show_dao_proposal",
          proposalPk: proposalAddress.toBase58(),
          symbol
        })
        // const url = fmtUrlWithCluster(
        //   `/dao/${symbol}/proposal/${proposalAddress}`
        // )

        // router.push(url)
      } catch (error) {
        console.error(error);
        notify({
          type: 'error',
          message: `${error}`,
        })

        onFinished()
      }
    }

    setIsLoading(false)
  }

  useEffect(() => {
    const initForm = async () => {
      const response = await getMintWithGovernances()

      handleSetForm({
        value: response.find(
          (x) =>
            x.governance?.account.governedAccount.toBase58() ===
            realm?.account.config.councilMint?.toBase58()
        ),
        propertyName: 'mintAccount',
      })
    }

    initForm()
  }, [])

  return (
    <BaseDialog className="mx_AddMemberForm" title={`Add new member to ${realmInfo?.displayName}`} onClick={onFinished}>
      <Field
        className="mx_AddMemberForm_field"
        label="Member's wallet"
        placeholder="(e.g. E2MMR...CKCOW)"
        value={form.destinationAccount}
        type="text"
        onChange={(event) =>
          handleSetForm({
            value: event.target.value,
            propertyName: 'destinationAccount',
          })
        }
      />

      <AccessibleButton
        className='mx_AddMemberForm_optionButton'
        onClick={() => setShowOptions(!showOptions)}
      >
        {showOptions ? (
          <ArrowCircleUpIcon className="mx_AddMemberForm_optionButton_icon" />
        ) : (
          <ArrowCircleDownIcon className="mx_AddMemberForm_optionButton_icon" />
        )}
        <div className="mx_AddMemberForm_optionButton_content">Options</div>
      </AccessibleButton>

      {showOptions && (
        <>
          <Field
            className="mx_AddMemberForm_field"
            label="Title of your proposal"
            placeholder="Title of your proposal"
            value={form.title ? form.title : proposalTitle}
            type="text"
            onChange={(event) =>
              handleSetForm({
                value: event.target.value,
                propertyName: 'title',
              })
            }
          />

          <Field
            className="mx_AddMemberForm_field"
            label="Description"
            placeholder="Description of your proposal (optional)"
            value={form.description}
            type="text"
            onChange={(event) =>
              handleSetForm({
                value: event.target.value,
                propertyName: 'description',
              })
            }
          />

          <Field
            className="mx_AddMemberForm_field"
            min={mintMinAmount}
            label="Voter weight"
            value={form.amount}
            type="number"
            onChange={setAmount}
            step={mintMinAmount}
            onBlur={validateAmountOnBlur}
          />

          {canChooseWhoVote && (
            <VoteBySwitch
              checked={voteByCouncil}
              onChange={() => {
                setVoteByCouncil(!voteByCouncil)
              }}
            />
          )}
        </>
      )}

      <div className="mx_AddMemberForm_buttonGroup">
        <AccessibleButton
          disabled={isLoading}
          className={`mx_AddMemberForm_button calcel ${isLoading? "disabled" : ""}`}
          onClick={onFinished}
        >
          Cancel
        </AccessibleButton>

        <AccessibleButton
          disabled={!form.destinationAccount || isLoading}
          className={`mx_AddMemberForm_button add ${!form.destinationAccount || isLoading? "disabled" : ""}`}
          onClick={() => handlePropose()}
        >
          {isLoading?
            <Spinner/>
            :
            "Add proposal"
          }
        </AccessibleButton>
      </div>
    </BaseDialog>
  )
}

export default AddMemberForm
