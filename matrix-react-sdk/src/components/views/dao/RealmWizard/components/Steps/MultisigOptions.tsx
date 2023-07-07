import React, { useEffect } from 'react'
import { RealmWizardStepComponentProps } from '../../interfaces/Realm'
import TeamWalletField from '../TeamWalletField'

import ApprovalQuorumInput from '../ApprovalQuorumInput'
import useWalletStore from '../../../../../../stores/vote/useWalletStore'
import Field from '../../../../elements/Field'

/**
 * This is the Step One for the Realm Wizard.
 *
 * This step will set up the Realm name and the team member wallets.
 * Then the parent should trigger the contracts creation.
 *
 * @param param0 the form data and form handler.
 */
const MultisigOptions: React.FC<RealmWizardStepComponentProps> = ({
  setForm,
  form,
}) => {
  const DEFAULT_APPROVAL_QUORUM = 60
  const { current: wallet } = useWalletStore((s) => s)

  const handleInsertTeamWallet = (wallets: string[]) => {
    const teamWallets: string[] = form?.teamWallets ?? []

    wallets.forEach((wallet) => {
      if (!teamWallets.find((addr) => addr === wallet)) {
        teamWallets.push(wallet)
      }
    })
    setForm({ teamWallets })
  }

  const handleRemoveTeamWallet = (index: number) => {
    if (form?.teamWallets && form.teamWallets[index]) {
      const teamWallets = form.teamWallets
      teamWallets.splice(index, 1)
      setForm({ teamWallets })
    }
  }

  const addCurrentWallet = () => {
    if (wallet?.publicKey) {
      handleInsertTeamWallet([wallet.publicKey?.toBase58()])
    }
  }

  useEffect(() => {
    addCurrentWallet()
  }, [wallet?.publicKey])

  useEffect(() => {
    addCurrentWallet()
  }, [])

  return (
    <div className='mx_MultisigOptions'>
      <Field
        className="mx_MultisigOptions_nameField"
        required
        type="text"
        value={form.name}
        label={"DAO Name"}
        placeholder={"(e.g. Cafeteria DAO)"}
        onChange={($e) => {
          setForm({
            name: $e.target.value,
          })
        }}
        maxLength={30}
      />
      <div className="mx_MultisigOptions_approvalQuorumWrap">
        <ApprovalQuorumInput
          value={form.yesThreshold}
          onChange={($e) => {
            setForm({ yesThreshold: $e })
          }}
          onBlur={() => {
            if (
              !form.yesThreshold ||
              form.yesThreshold.toString().match(/\D+/gim)
            ) {
              setForm({
                yesThreshold: DEFAULT_APPROVAL_QUORUM,
              })
            }
          }}
        />
      </div>
      <div className="mx_MultisigOptions_teamWalletWrap">
        <TeamWalletField
          onInsert={handleInsertTeamWallet}
          onRemove={handleRemoveTeamWallet}
          wallets={form?.teamWallets ?? []}
        />
      </div>
    </div>
  )
}

export default MultisigOptions
