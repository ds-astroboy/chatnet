/*
Copyright 2017 Vector Creations Ltd

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

import React from 'react';
import { _t } from '../../../languageHandler';
import { replaceableComponent } from "../../../utils/replaceableComponent";
import TextInputDialog from "./TextInputDialog";

interface IProps {
    onFinished: (success: boolean) => void;
    className?: string;
    disableTextArea?: boolean;
    content?: string;
}

/*
 * A dialog for confirming a redaction.
 */
@replaceableComponent("views.dialogs.ConfirmRedactDialog")
export default class ConfirmRedactDialog extends React.Component<IProps> {
    render() {
        return (
            <TextInputDialog onFinished={this.props.onFinished}
                title={_t("Confirm Removal")}
                description={this.props.content}
                placeholder={_t("Reason (optional)")}
                focus
                button={_t("Remove")}
                className={this.props.className}
                disableTextArea={this.props.disableTextArea}
            >
            </TextInputDialog>
        );
    }
}
