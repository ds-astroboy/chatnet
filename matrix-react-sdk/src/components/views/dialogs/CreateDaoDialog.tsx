import React, { FC, useEffect } from "react";

import { _t } from "../../../languageHandler";
import RealmWizard from "../dao/RealmWizard/RealmWizard";
import BaseDialog from "../dialogs/BaseDialog";

interface IProps {
  onFinished(proceed: boolean, domainName?: string): void;
}

const CreateDaoDialog: FC<IProps> = ({ onFinished }) => {

  useEffect(() => {
    console.log("========================", window.crypto.subtle);
  }, [])
  return (
    <BaseDialog
      className="mx_CreateDaoDialog"
      title={"Create DAO"}
      onFinished={onFinished}
    >
        <RealmWizard onFinished={onFinished}/>
    </BaseDialog>
  );
};
export default CreateDaoDialog;
