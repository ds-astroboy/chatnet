/*
Copyright 2017 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2020, 2021 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React, { useState, useEffect, FunctionComponent } from "react";

import { _t } from "../../../languageHandler";
import BaseDialog from "../dialogs/BaseDialog";
import dis from "../../../dispatcher/dispatcher";
import AccessibleButton from "../elements/AccessibleButton";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import Lottie, { LottieComponentProps } from "lottie-react";
import cancelLottie from "../../../../res/img/lottie/close-animation.json";
import successLottie from "../../../../res/img/lottie/success-animation.json";

interface IProps {
  type: string;
  onFinished(): void;
  tradeUserId?: string;
}

const ResultDialog: FunctionComponent<IProps> = ({
  type,
  onFinished,
  tradeUserId
}) => {
  const [waitingSecond, setWaitingSecond] = useState(30);
  const [tradeUser, setTradeUser] = useState(null);
  let lottieAnimation;
  let statement;
  let buttonsGroup;

  const countTime = () => {
    if (waitingSecond == 0) {
      onFinished();
      return;
    }
    setWaitingSecond(waitingSecond - 1);
  };

  switch(type) {
    case "cancel":
      lottieAnimation = (
        <Lottie
          animationData={cancelLottie}
          loop={false}
          className="mx_ResultDialog_lottie_animation_item"
        />
      );
      statement = (
        <div className="mx_ResultDialog_statement">
          Your trading session has ended
        </div>
      );
      buttonsGroup = (
        <div className="mx_ResultDialog_Buttons_Group cancel">
          <AccessibleButton
            className="mx_ResultDialog_Button close"
            onClick={onFinished}
          >
            close
          </AccessibleButton>
        </div>
      );
      break;
    case "success": 
      lottieAnimation = (
        <Lottie
          animationData={successLottie}
          loop={false}
          className="mx_ResultDialog_lottie_animation_item"
        />
      );
      statement = (
        <div className="mx_ResultDialog_statement">
          {`Your trade with ${
            tradeUser ? tradeUser.displayName : ""
          } was successful`}
        </div>
      );
      buttonsGroup = (
        <div className="mx_ResultDialog_Buttons_Group success">
          <AccessibleButton
            className="mx_ResultDialog_Button close"
            onClick={onFinished}
          >
            close
          </AccessibleButton>
          <AccessibleButton
            className="mx_ResultDialog_Button trade"
            onClick={null}
          >
            Trade again
          </AccessibleButton>
        </div>
      );
      break;
    case "failed":
      lottieAnimation = (
        <Lottie
          animationData={cancelLottie}
          loop={false}
          className="mx_ResultDialog_lottie_animation_item"
        />
      );
      statement = (
        <div className="mx_ResultDialog_statement">
          {`Your trade with ${
            tradeUser ? tradeUser.displayName : ""
          } was failed`}
        </div>
      );
      buttonsGroup = (
        <div className="mx_ResultDialog_Buttons_Group success">
          <AccessibleButton
            className="mx_ResultDialog_Button close"
            onClick={onFinished}
          >
            close
          </AccessibleButton>
          <AccessibleButton
            className="mx_ResultDialog_Button trade"
            onClick={null}
          >
            Trade again
          </AccessibleButton>
        </div>
      );
  }

  let subStatement = (
    <div className="mx_ResultDialog_subStatement">
      This window will close automatically in {waitingSecond} seconds
    </div>
  );

  useEffect(() => {
    if (tradeUserId) {
      let user2 = MatrixClientPeg.get().getUser(tradeUserId);
      setTradeUser(user2);
    }
  }, []);

  useEffect(() => {
    setTimeout(countTime, 1000);
  }, [waitingSecond]);

  return (
    <BaseDialog
      className="mx_ResultDialog"
      title={"Trade Closed"}
      onFinished={onFinished}
    >
      <div className="mx_ResultDialog_lottie_animation">{lottieAnimation}</div>
      <div className="mx_ResultDialog_discription">
        {statement}
        {subStatement}
      </div>
      {buttonsGroup}
    </BaseDialog>
  );
};
export default ResultDialog;
