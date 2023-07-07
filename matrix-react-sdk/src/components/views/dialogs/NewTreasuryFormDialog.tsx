import React, { FC } from "react";

import { _t } from "../../../languageHandler";
import NewTreasuryAccountForm from "../dao/treasury/NewTreasuryAccountForm";
import BaseDialog from "../dialogs/BaseDialog";

interface IProps {
  onFinished(): void;
}

const NewTreasuryFormDialog: FC<IProps> = ({ onFinished }) => {
  return (
    <BaseDialog
      className="mx_NewTreasuryFormDialog"
      title={"Create new treasury account"}
      onFinished={onFinished}
    >
        <NewTreasuryAccountForm/>
    </BaseDialog>
  );
};
export default NewTreasuryFormDialog;
