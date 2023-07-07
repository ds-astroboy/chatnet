import React, { FC, useState } from "react";
import StyledCheckbox from "../../../elements/StyledCheckbox";

const rewardsInfo = [
    {
        label: "Sign Up",
        credits: 100
    }
    ,
    {
        label: "Create a Room",
        credits: 15
    },
    {
        label: "Connect Your Wallet",
        credits: 25
    }
];

const RewardsTap: FC = () => {
    const [checkboxFlag, setCheckboxFlag] = useState<boolean[]>(new Array(3).fill(false));

    const onChangeCheck = (checked: boolean, index: number) => {
        let flags = checkboxFlag.slice();
        flags[index] = checked;
        setCheckboxFlag(flags);
    }

    return (
        <div className="mx_SettingsTab mx_RewardsTap">
            {/* <div className="mx_SettingsTab_heading">Get Rewarded <span className="badge">Beta</span></div> */}
            <div className="mx_SettingsTab_SubHeading">
                Want to fill your bag with some free Cafeteria Credits? Completing the tasks below is a super easy way to grow your balance...
            </div>
            <div className='mx_SettingsTab_section pt-4'>
                {rewardsInfo.map((reward, index: number) => (
                    <div className="mx_RewardsTap_item d-flex align-items-center my-4">
                        {/* <StyledCheckbox
                            checked={checkboxFlag[index]}
                            onChange={(ev) => onChangeCheck(ev.target.checked, index)}
                            className="mx_RewardsTap_item_checkbox dark bold"
                        > */}
                        <div className="mx_RewardsTap_item_checkbox dark bold">
                            {reward.label}
                        </div>
                        {/* </StyledCheckbox> */}
                        <div className="mx_RewardsTap_item_credit d-flex align-items-center">
                            <div className="mx_RewardsTap_item_credit_logo img-fill"></div>
                            <div className="mx_RewardsTap_item_credit_amount bold dark">{reward.credits}</div>
                        </div>
                    </div>
                ))}                
            </div>
        </div>
    )
}

export default RewardsTap