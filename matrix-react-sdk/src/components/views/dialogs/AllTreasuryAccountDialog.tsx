import React, { FC } from "react";

import { _t } from "../../../languageHandler";
import AllTreasucyAccounts from "../dao/treasury/AllTreasuryAccounts";
import BaseDialog from "../dialogs/BaseDialog";

interface IProps {
  onFinished(): void;
}

const AllTreasuryAccountDialog: FC<IProps> = ({ onFinished }) => {
  return (
    <BaseDialog
      className="mx_AllTreasuryAccountDialog"
      title={"Treasury"}
      onFinished={onFinished}
    >
      <AllTreasucyAccounts/>
    </BaseDialog>
  );
};
export default AllTreasuryAccountDialog;
