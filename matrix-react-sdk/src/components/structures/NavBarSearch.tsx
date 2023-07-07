/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2020 The Matrix.org Foundation C.I.C.

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

import React, { createRef, RefObject } from 'react';
import AccessibleButton from "../views/elements/AccessibleButton";
import classNames from "classnames";
import { _t } from '../../languageHandler';
import { Key } from "../../Keyboard";
import DesktopBuildsNotice, { WarningKind } from "../views/elements/DesktopBuildsNotice";
import { replaceableComponent } from "../../utils/replaceableComponent";

interface IProps {
    onCancelClick: () => void;
    onSearch: (query: string) => void;
    searchInProgress?: boolean;
    isRoomEncrypted?: boolean;
    
}

interface IState {
    isCancelShow: boolean;
}

export enum SearchScope {
    Room = "Room",
    All = "All",
}

@replaceableComponent("structures.NavBarSearch")
export default class NavBarSearch extends React.Component<IProps, IState> {
    private searchTerm: RefObject<HTMLInputElement> = createRef();

    constructor(props: IProps) {
        super(props);
        this.state = {
            isCancelShow: false,
        };        
        this.searchTerm?.current?.blur();

    }

    private onSearchChange = (e) => {
        this.onSearch();
        if(this.searchTerm.current.value) {
            this.setState({isCancelShow: true});
        }
        else {
            this.setState({isCancelShow: false})
        }
        switch (e.key) {
            case Key.ESCAPE:
                this.props.onCancelClick();
                break;
        }
    };

    private onSearch = (): void => {
        this.props.onSearch(this.searchTerm.current.value);
    };

    public render() {
        return (
            <>
                <div className="mx_SearchBar">
                    <div className="mx_SearchBar_input mx_textinput">
                        <input
                            ref={this.searchTerm}
                            type="text"
                            placeholder={"Search Groups…"}
                            onKeyUp={this.onSearchChange}
                        />
                        {
                            this.state.isCancelShow? 
                            <AccessibleButton 
                                className="mx_SearchBar_cancel" 
                                onClick={() => {
                                    this.searchTerm.current.value = "";
                                    this.setState({isCancelShow: false})
                                    this.props.onCancelClick();
                                }}
                            />
                            :
                            false
                        }
                    </div>
                </div>
            </>
        );
    }
}
