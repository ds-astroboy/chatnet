/*
Copyright 2019 - 2021 The Matrix.org Foundation C.I.C.

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

import React, { ErrorInfo } from 'react';

import { _t } from '../../../languageHandler';
import { replaceableComponent } from "../../../utils/replaceableComponent";
const errorScreen = require('../../../../res/img/cafeteria-errorscreen.svg');


/**
 * This error boundary component can be used to wrap large content areas and
 * catch exceptions during rendering in the component tree below them.
 */
@replaceableComponent("views.elements.PageNotFound")
export default class PageNotFound extends React.PureComponent<{}, {}> {
    render() {
        return <div className="mx_ErrorBoundary">
            <div className="mx_ErrorBoundary_body">
                <div className='mx_ErrorBoundary_img'>
                    <img src={errorScreen}/>
                </div>
                <div className='mx_ErrorBoundary_header'>Oops!</div>
                <div className='mx_ErrorBoundary_content'>The page you're looking for does not exist</div>
            </div>
        </div>;
    }
}
