/*
Copyright 2016 OpenMarket Ltd
Copyright 2017 New Vector Ltd

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

interface IProps {
    // The number of elements to show before truncating. If negative, no truncation is done.
    truncateAt?: number;
    // The className to apply to the wrapping div
    className?: string;
    // A function that returns the children to be rendered into the element.
    // The start element is included, the end is not (as in `slice`).
    // If omitted, the React child elements will be used. This parameter can be used
    // to avoid creating unnecessary React elements.
    getChildren?: (start: number, end: number) => Array<React.ReactNode>;
    // A function that should return the total number of child element available.
    // Required if getChildren is supplied.
    getChildCount?: () => number;
    // A function which will be invoked when an overflow element is required.
    // This will be inserted after the children.
    createOverflowElement?: (overflowCount: number, totalCount: number) => React.ReactNode;
}

@replaceableComponent("views.elements.TruncatedList")
export default class TruncatedList extends React.Component<IProps> {
    static defaultProps ={
        truncateAt: 2,
        createOverflowElement(overflowCount, totalCount) {
            return (
                <div>{ _t("And %(count)s more...", { count: overflowCount }) }</div>
            );
        },
    };

    private getChildren(start: number, end: number): Array<React.ReactNode> {
        if (this.props.getChildren && this.props.getChildCount) {
            return this.props.getChildren(start, end);
        } else {
            // XXX: I'm not sure why anything would pass null into this, it seems
            // like a bizzare case to handle, but I'm preserving the behaviour.
            // (see commit 38d5c7d5c5d5a34dc16ef5d46278315f5c57f542)
            return React.Children.toArray(this.props.children).filter((c) => {
                return c != null;
            }).slice(start, end);
        }
    }

    private getChildCount(): number {
        if (this.props.getChildren && this.props.getChildCount) {
            return this.props.getChildCount();
        } else {
            return React.Children.toArray(this.props.children).filter((c) => {
                return c != null;
            }).length;
        }
    }

    private getBots(): Array<JSX.Element> {
        let bot = [];
        let priceBot = <div>
            <div className='mx_AccessibleButton mx_EntityTile mx_EntityTile_online_beenactive' role="button">
                <div className='mx_EntityTile_avatar'>
                    <img src={require("../../../../res/img/bots/leon1.png")} className="mx_BaseAvatar mx_BaseAvatar_image" width={36} height={36}/>
                </div>
                <div className='mx_EntityTile_details'>
                    <div className='mx_EntityTile_name bold' dir='auto'>Satoshi</div>
                </div>
                <div className='mx_EntityTile_power'>Bot</div>
            </div>
        </div>
        bot.push(priceBot);
        let verificationBot = <div>
            <div className='mx_AccessibleButton mx_EntityTile mx_EntityTile_online_beenactive' role="button">
                <div className='mx_EntityTile_avatar'>
                    <img src={require("../../../../res/img/bots/bot2.png")} className="mx_BaseAvatar mx_BaseAvatar_image" width={36} height={36}/>
                </div>
                <div className='mx_EntityTile_details'>
                    <div className='mx_EntityTile_name bold' dir='auto'>Hooman</div>
                </div>
                <div className='mx_EntityTile_power'>Bot</div>
            </div>
        </div>
        bot.push(verificationBot);
        return bot;
    }

    public render() {
        let overflowNode = null;

        const totalChildren = this.getChildCount();
        let upperBound = totalChildren;
        if (this.props.truncateAt >= 0) {
            const overflowCount = totalChildren - this.props.truncateAt;
            if (overflowCount > 1) {
                overflowNode = this.props.createOverflowElement(
                    overflowCount, totalChildren,
                );
                upperBound = this.props.truncateAt;
            }
        }
        const childNodes = this.getChildren(0, upperBound);
        const botNodes = this.getBots();

        return (
            <div className={this.props.className}>
                { childNodes }
                { botNodes }
                {/* { overflowNode } */}
            </div>
        );
    }
}
