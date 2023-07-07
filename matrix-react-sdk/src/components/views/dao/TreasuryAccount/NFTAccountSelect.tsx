import React from 'react';
import AccountItemNFT from './AccountItemNFT'
import Dropdown from "../../elements/Dropdown";

const NFTAccountSelect = ({
  onChange,
  nftsGovernedTokenAccounts,
  currentAccount,
}) => {
  return (
    <Dropdown
      noMaxWidth={true}
      className="mx_NFTAccountSelect"
      onOptionChange={(value) => {
        let account;
        nftsGovernedTokenAccounts.map((accountWithGovernance) => {
          if(accountWithGovernance?.governance?.pubkey.toBase58() === value) {
            account = accountWithGovernance;
          }
        })
        onChange(account);
      }}
      value={currentAccount?.governance?.pubkey.toBase58()}
      componentLabel={
        currentAccount && (
          <AccountItemNFT
            onClick={() => null}
            governedAccountTokenAccount={currentAccount}
          ></AccountItemNFT>
        )
      }
    >
      {nftsGovernedTokenAccounts.map((accountWithGovernance) => (
        <div
          key={accountWithGovernance?.governance?.pubkey.toBase58()}
        >
          <AccountItemNFT
            onClick={() => null}
            governedAccountTokenAccount={accountWithGovernance}
          />
        </div>
      ))}
    </Dropdown>
  )
}

export default NFTAccountSelect
