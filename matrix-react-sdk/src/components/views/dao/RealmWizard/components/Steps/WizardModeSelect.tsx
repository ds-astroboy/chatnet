import React from 'react'
import { RealmWizardMode } from '../../interfaces/Realm'

const WizardModeSelect: React.FC<{
  onSelect: (option: number) => void
}> = ({ onSelect }) => {
  return (
    <div className='mx_WizardModeSelect'>
      <div
        className="mx_WizardModeSelect_mode"
        onClick={() => {
          onSelect(RealmWizardMode.BASIC)
        }}
      >
        <div className="mx_WizardModeSelect_mode_title">
          I want to create a multisig DAO
        </div>
        <div className='mx_WizardModeSelect_mode_description'>
          Multisig DAO allows you to create an organization for your team
          members and jointly own and manage shared assets like treasury
          accounts, NFTs, programs or mints.
        </div>
      </div>
      {/* <div
        className="mx_WizardModeSelect_mode"
        onClick={() => {
          onSelect(RealmWizardMode.ADVANCED)
        }}
      >
        <div className="mx_WizardModeSelect_mode_title">
          I want to create a bespoke DAO
        </div>
        <div className='mx_WizardModeSelect_mode_description'>
          Bespoke DAO is an advanced option and allows you to create a DAO
          customized for your individual requirements, community structure
          and governance token setup.
        </div>
      </div> */}
    </div>
  )
}

export default WizardModeSelect
