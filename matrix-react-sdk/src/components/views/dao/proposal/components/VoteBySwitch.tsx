import React from 'react'
import useRealm from '../../../../../hooks/useRealm'
import LabelledToggleSwitch from '../../../elements/LabelledToggleSwitch'

const VoteBySwitch = ({ checked, onChange }) => {
  const { toManyCouncilOutstandingProposalsForUse } = useRealm()
  return !toManyCouncilOutstandingProposalsForUse ? (
    <div className="mx_VoteBySwitch">
      <div className="mx_VoteBySwitch_content">Vote by council</div>
        <LabelledToggleSwitch
            className='mx_VoteBySwitch_button'
            label={""}
            onChange={onChange}
            value={checked}
        />
    </div>
  ) : null
}

export default VoteBySwitch
