/*
Copyright 2019 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

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

import React, { useState, useMemo, useEffect, FC } from 'react';
import { getWalletAddress } from '../../../../apis';
import { useLocalStorageState } from '../../../../hooks/useLocalStorageState';
import { _t } from "../../../../languageHandler";
import { MatrixClientPeg } from "../../../../MatrixClientPeg";
import { getUserNameFromId } from '../../../../utils/strings';
import Field from "../../elements/Field";

/*
TODO: Improve the UX for everything in here.
It's very much placeholder, but it gets the job done. The old way of handling
email addresses in user settings was to use dialogs to communicate state, however
due to our dialog system overriding dialogs (causing unmounts) this creates problems
for a sane UX. For instance, the user could easily end up entering an email address
and receive a dialog to verify the address, which then causes the component here
to forget what it was doing and ultimately fail. Dialogs are still used in some
places to communicate errors - these should be replaced with inline validation when
that is available.
 */

interface IProps {
    protocol: string;
    wallets: any;
}

const WalletAddress: FC<IProps> = (props) => {
    const [walletAddress, setWalletAddress] = useState("");
    const userId = MatrixClientPeg.get().getUserId();
    const [userData, ] = useLocalStorageState("userData", null);

    useEffect(() => {
        if(!props.wallets) return;
        const wallet = props.wallets?.find(wallet => wallet.type === props.protocol);
        if(!wallet) return;
        const userName = getUserNameFromId(userId);
        getWalletAddress(userName, props.protocol, userData).then(response => {
            if(response.success) {
                setWalletAddress(response.wallets[props.protocol]);
            }
        })
    }, [])

    return (
        <div className="mx_EmailAddresses mt-4">
            <form
                autoComplete="off"
                noValidate={true}
                className="mx_EmailAddresses_new"
            >
                <Field
                    type="text"
                    label={"Wallet Address"}
                    autoComplete="off"
                    value={walletAddress}
                    disabled
                />
            </form>
        </div>
    );
}

export default WalletAddress;