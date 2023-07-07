import React, { useContext, useEffect, useState } from 'react'
import { AccountInfo } from '@solana/spl-token'
import { getMintMinAmountAsDecimal } from '../../../../../tools/sdk/units'
import { PublicKey } from '@solana/web3.js'
import { precision } from '../../../../../utils/vote/formatting'
import { tryParseKey } from '../../../../../tools/validators/pubkey'
import useWalletStore from '../../../../../stores/vote/useWalletStore'
import {
  GovernedMintInfoAccount,
  GovernedMultiTypeAccount,
  TokenProgramAccount,
  tryGetTokenAccount,
} from '../../../../../utils/vote/tokens';
import { UiInstruction, MintForm } from '../../../../../utils/vote/uiTypes/proposalCreationTypes'
import { debounce } from '../../../../../utils/vote/debounce'
import { NewProposalContext } from '../NewProposal'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useGovernanceAssets from '../../../../../hooks/useGovernanceAssets'
import { getMintSchema } from '../../../../../utils/vote/validations'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { getMintInstruction } from '../../../../../utils/vote/instructionTools'
import useRealm from '../../../../../hooks/useRealm'
import { getAccountName } from '../../instructions/tools'
import Field from '../../../elements/Field'
const Mint = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const { realmInfo } = useRealm()
  const { getMintWithGovernances } = useGovernanceAssets()
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<MintForm>({
    destinationAccount: '',
    // No default mint amount
    amount: undefined,
    mintAccount: undefined,
    programId: programId?.toString(),
  })
  const wallet = useWalletStore((s) => s.current)
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [
    destinationAccount,
    setDestinationAccount,
  ] = useState<TokenProgramAccount<AccountInfo> | null>(null)
  const [formErrors, setFormErrors] = useState({})
  const [
    mintGovernancesWithMintInfo,
    setMintGovernancesWithMintInfo,
  ] = useState<GovernedMintInfoAccount[]>([])
  const mintMinAmount = form.mintAccount
    ? getMintMinAmountAsDecimal(form.mintAccount.mintInfo)
    : 1
  const currentPrecision = precision(mintMinAmount)
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const setAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
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
  async function getInstruction(): Promise<UiInstruction> {
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

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])
  useEffect(() => {
    if (form.destinationAccount) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.destinationAccount)
        if (pubKey) {
          const account = await tryGetTokenAccount(connection.current, pubKey)
          setDestinationAccount(account ? account : null)
        } else {
          setDestinationAccount(null)
        }
      })
    } else {
      setDestinationAccount(null)
    }
  }, [form.destinationAccount])
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [form, governedAccount])
  useEffect(() => {
    setGovernedAccount(form?.mintAccount?.governance)
  }, [form.mintAccount])
  useEffect(() => {
    async function getMintWithGovernancesFcn() {
      const resp = await getMintWithGovernances()
      setMintGovernancesWithMintInfo(resp)
    }
    getMintWithGovernancesFcn()
  }, [])
  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)
  const schema = getMintSchema({ form, connection })

  return (
    <div className='mx_Mint'>
      <GovernedAccountSelect
        label="Mint"
        governedAccounts={
          mintGovernancesWithMintInfo as GovernedMultiTypeAccount[]
        }
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'mintAccount' })
        }}
        value={form.mintAccount}
        error={formErrors['mintAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <Field
        className='mx_Mint_destinationAccount'
        label="Destination account"
        value={form.destinationAccount}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'destinationAccount',
          })
        }
      />
      {destinationAccount && (
        <div className=''>
          <div className="pb-0.5 text-fgd-3 text-xs">Account owner</div>
          <div className="text-xs">
            {destinationAccount.account.owner.toString()}
          </div>
        </div>
      )}
      {destinationAccountName && (
        <div>
          <div className="pb-0.5 text-fgd-3 text-xs">Account name</div>
          <div className="text-xs">{destinationAccountName}</div>
        </div>
      )}
      <Field
        className='mx_Mint_Amount'
        min={mintMinAmount}
        label="Amount"
        value={form.amount}
        type="number"
        onChange={setAmount}
        step={mintMinAmount}
        onBlur={validateAmountOnBlur}
      />
    </div>
  )
}

export default Mint
