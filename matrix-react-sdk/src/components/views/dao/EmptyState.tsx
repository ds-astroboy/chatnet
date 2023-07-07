import React, { FunctionComponent, ReactNode } from 'react'
import AccessibleButton from '../elements/AccessibleButton'
import AccessibleTooltipButton from '../elements/AccessibleTooltipButton'

interface EmptyStateProps {
  buttonText?: string
  disableButton?: boolean
  icon?: ReactNode
  onClickButton?: () => void
  desc?: string
  title?: string
  toolTipContent?: string
}

const EmptyState: FunctionComponent<EmptyStateProps> = ({
  buttonText,
  disableButton,
  icon,
  onClickButton,
  desc,
  title,
  toolTipContent,
}) => {
  let Button: React.ComponentType<React.ComponentProps<typeof AccessibleButton>> = AccessibleButton;
  if(toolTipContent) {
    Button = AccessibleTooltipButton
  }

  return (
    <div className="mx_EmptyState">
      {icon ? <div className="mx_EmptyState_icon">{icon}</div> : null}
      {title ? <h2 className="mx_EmptyState_title">{title}</h2> : null}
      {desc ? (
        <div className="mx_EmptyState_mainContent">
          {desc}
        </div>
      ) : null}
      {buttonText && onClickButton ? (
          <Button
            title={toolTipContent}
            className="mx_EmptyState_button"
            disabled={disableButton}
            onClick={onClickButton}
          >
            {buttonText}
          </Button>
      ) : null}
    </div>
  )
}

export default EmptyState
