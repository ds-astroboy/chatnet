import {
    ComponentInstructionData,
    Instructions,
} from '../../../../../utils/vote/uiTypes/proposalCreationTypes'
import React from 'react'
import DryRunInstructionBtn from './DryRunInstructionBtn'
  
  const InstructionContentContainer = ({
    children,
    idx,
    instructionsData,
  }: {
    children: any
    idx: number
    instructionsData: ComponentInstructionData[]
  }) => {
    const currentInstruction = instructionsData ? instructionsData[idx] : null
  
    return (
      <div className="mx_InstructionContentContainer">
        {children}
  
        {/* {currentInstruction?.type?.id !== Instructions.None && (
          <DryRunInstructionBtn
            btnClassNames=""
            getInstructionDataFcn={currentInstruction?.getInstruction}
          />
        )} */}
      </div>
    )
  }
  
  export default InstructionContentContainer
  