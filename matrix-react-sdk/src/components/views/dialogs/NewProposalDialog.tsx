import React, { FC } from "react";

import { _t } from "../../../languageHandler";
import NewProposal from "../dao/proposal/NewProposal";
import BaseDialog from "../dialogs/BaseDialog";

interface IProps {
  onFinished(): void;
}

const NewProposalDialog: FC<IProps> = ({ onFinished }) => {
  return (
    <BaseDialog
      className="mx_NewProposalDialog"
      title={"Create New Proposal"}
      onFinished={onFinished}
    >
        <NewProposal onFinished={onFinished}/>
    </BaseDialog>
  );
};
export default NewProposalDialog;
