import React, { FC } from "react";

import { _t } from "../../../languageHandler";
import DaoMembersContainer from "../dao/members/DaoMembersContainer";
import BaseDialog from "../dialogs/BaseDialog";

interface IProps {
  onFinished(): void;
}

const DaoMembersDialog: FC<IProps> = ({ onFinished }) => {
  return (
    <BaseDialog
      className="mx_DaoMembersDialog"
      title={"Members"}
      onFinished={onFinished}
    >
      <DaoMembersContainer onParentFinished={onFinished}/>
    </BaseDialog>
  );
};
export default DaoMembersDialog;
