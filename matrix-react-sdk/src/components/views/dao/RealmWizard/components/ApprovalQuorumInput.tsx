import React from 'react'
import Field from '../../../elements/Field'

const ApprovalQuorumInput: React.FC<{
  onChange: (amount: number) => void
  onBlur?: () => void
  value?: number
  slider?: boolean
}> = ({ onChange, onBlur, value, slider = true }) => {
    const sliderChange = (e) => {
        onChange(e.target.value);
    }

  return (
    <div className='mx_ApprovalQuorumInput'>
      <div className='mx_ApprovalQuorumInput_header'>Approval quorum (%)</div>
      <Field
        className='mx_ApprovalQuorumInput_percentField'
        required
        type="number"
        value={value.toString()}
        min={1}
        max={100}
        onBlur={onBlur}
        onChange={($e) => {
          let yesThreshold: string = $e.target.value
          if (yesThreshold.length) {
            yesThreshold =
              +yesThreshold < 1 ? `1` : +yesThreshold > 100 ? `100` : yesThreshold
          }
          onChange(+parseInt(yesThreshold))
        }}
      />
      {slider && (
        <input
          className='mx_ApprovalQuorumInput_percentSlider'
          type='range'
          value={value ?? 60}
          disabled={false}
          onChange={sliderChange}
        />
      )}
    </div>
  )
}

export default ApprovalQuorumInput
