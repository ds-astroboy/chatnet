import { ChevronDownIcon } from '@heroicons/react/outline'
import useRealm from '../../../hooks/useRealm'
import VoteBySwitch from './proposal/components/VoteBySwitch'
import React, { useState } from 'react'
import AccessibleButton from '../elements/AccessibleButton'
import Field from '../elements/Field'

const AdditionalProposalOptions = ({
  title,
  description,
  setTitle,
  setDescription,
  defaultTitle,
  voteByCouncil,
  setVoteByCouncil,
}: {
  title: string
  description: string
  setTitle: (evt) => void
  setDescription: (evt) => void
  defaultTitle: string
  voteByCouncil: boolean
  setVoteByCouncil: (val) => void
}) => {
  const [showOptions, setShowOptions] = useState(false)
  const { canChooseWhoVote } = useRealm()
  return (
    <>
      <AccessibleButton
        className="flex items-center text-primary-light my-5"
        onClick={() => setShowOptions(!showOptions)}
      >
        {showOptions ? 'Less Options' : 'More Options'}
        <ChevronDownIcon
          className={`default-transition h-5 w-5 ml-1 ${
            showOptions ? 'transform rotate-180' : 'transform rotate-360'
          }`}
        />
      </AccessibleButton>
      {showOptions && (
        <div className="space-y-4">
          <Field
            label="Proposal Title"
            placeholder={defaultTitle}
            value={title}
            type="text"
            onChange={setTitle}
          />
          <Field
            element='textarea'
            label="Proposal Description"
            placeholder={
              'Description of your proposal or use a github gist link (optional)'
            }
            value={description}
            onChange={setDescription}
          />
          {canChooseWhoVote && (
            <VoteBySwitch
              checked={voteByCouncil}
              onChange={() => {
                setVoteByCouncil(!voteByCouncil)
              }}
            />
          )}
        </div>
      )}
    </>
  )
}

export default AdditionalProposalOptions
