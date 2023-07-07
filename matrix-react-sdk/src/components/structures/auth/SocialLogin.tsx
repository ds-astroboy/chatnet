import React, { FC } from "react";
import AccessibleTooltipButton from "../../views/elements/AccessibleTooltipButton";
import classnames from 'classnames';

interface IProps {
    className: string;
}

const SocialLogin: FC<IProps> = ({className}) => {
    const classname = classnames(className, "mx_Social_login");

    return (
        <div className={classname}>
            <div className='mx_Social_login_content grey bold'>Sign in with ...</div>
            <div className='mx_Social_login_buttons'>
                <AccessibleTooltipButton
                    title='Sign in with Facebook'
                    className='mx_Social_login_button p-3 mx-2 facebook' 
                    onClick={null}
                />
                <AccessibleTooltipButton
                    title='Sign in with Discord'
                    className='mx_Social_login_button p-3 mx-2 discord' 
                    onClick={null}
                />
                <AccessibleTooltipButton 
                    title='Sign in with Twitter'
                    className='mx_Social_login_button p-3 mx-2 twitter'
                    onClick={null}
                />
            </div>
        </div>
    )
}

export default SocialLogin