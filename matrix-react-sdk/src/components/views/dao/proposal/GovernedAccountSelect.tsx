import { Governance, GovernanceAccountType } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import {
  getMintAccountLabelInfo,
  getSolAccountLabel,
  getTokenAccountLabelInfo,
  GovernedMultiTypeAccount,
} from '../../../../utils/vote/tokens'
import React, { useEffect } from 'react'
import { getProgramName } from '../instructions/programs/names'
import Dropdown from "../../elements/Dropdown";

const GovernedAccountSelect = ({
  onChange,
  value,
  error,
  governedAccounts = [],
  shouldBeGoverned,
  governance,
  label,
  noMaxWidth,
}: {
  onChange
  value
  error?
  governedAccounts: GovernedMultiTypeAccount[]
  shouldBeGoverned?
  governance?: ProgramAccount<Governance> | null | undefined
  label?
  noMaxWidth?: boolean
}) => {
  function getLabel(value: GovernedMultiTypeAccount) {
    if (value) {
      const accountType = value.governance.account.accountType
      switch (accountType) {
        case GovernanceAccountType.MintGovernanceV1:
        case GovernanceAccountType.MintGovernanceV2:
          return getMintAccountLabelComponent(getMintAccountLabelInfo(value))
        case GovernanceAccountType.TokenGovernanceV1:
        case GovernanceAccountType.TokenGovernanceV2:
          return getTokenAccountLabelComponent(
            value.isSol
              ? getSolAccountLabel(value)
              : getTokenAccountLabelInfo(value)
          )
        case GovernanceAccountType.ProgramGovernanceV1:
        case GovernanceAccountType.ProgramGovernanceV2:
          return getProgramAccountLabel(value.governance)
        default:
          return value.governance.account.governedAccount.toBase58()
      }
    } else {
      return null
    }
  }
  //TODO refactor both methods (getMintAccountLabelComponent, getTokenAccountLabelComponent) make it more common
  function getMintAccountLabelComponent({
    account,
    tokenName,
    mintAccountName,
    amount,
    imgUrl,
  }) {
    return (
      <div className="mx_GovernedAccountSelect_option">
        {account && <div>{`${account}(Supply: ${amount})`}</div>}
        <div>{mintAccountName}</div>
        <div>
          {tokenName && (
            <div>
              Token: <img src={imgUrl} />
              {tokenName}
            </div>
          )}
        </div>
      </div>
    )
  }
  function getTokenAccountLabelComponent({
    tokenAccount,
    tokenAccountName,
    tokenName,
    amount,
  }) {
    return (
      <div className="mx_GovernedAccountSelect_option">
        {tokenAccountName && <div>{`${tokenAccountName}(Bal: ${amount})`}</div>}
        <div>{tokenAccount}</div>
        <div>
          {tokenName && (
            <div>
              Token:
              <span>{tokenName}</span>
            </div>
          )}
        </div>
      </div>
    )
  }
  function getProgramAccountLabel(val: ProgramAccount<Governance>) {
    const name = val ? getProgramName(val.account.governedAccount) : ''
    return (
      <div className="mx_GovernedAccountSelect_option">
        {name && <div>{name}</div>}
        <div>{val?.account?.governedAccount?.toBase58()}</div>
      </div>
    )
  }
  useEffect(() => {
    if (governedAccounts.length == 1) {
      //wait for microtask queue to be empty
      setTimeout(() => {
        onChange(governedAccounts[0])
      })
    }
  }, [JSON.stringify(governedAccounts)])
  return (
    <Dropdown
      className="mx_GovernedAccountSelect"
      label={label}
      onOptionChange={(val) => {
        let acc = governedAccounts.find(acc => acc.governance?.account.governedAccount.toBase58() === val);
        onChange(acc);
      }}
      componentLabel={getLabel(value)}
      value={value?.governance?.account.governedAccount.toBase58()}
    >
      {governedAccounts
        .filter((x) =>
          !shouldBeGoverned
            ? !shouldBeGoverned
            : x?.governance?.pubkey.toBase58() ===
              governance?.pubkey?.toBase58()
        )
        .map((acc) => {
          return (
            <div
              className="border-red"
              key={acc.governance?.account.governedAccount.toBase58()}
            >
              {getLabel(acc)}
            </div>
          )
        })}
    </Dropdown>
  )
}

export default GovernedAccountSelect
