/*
Copyright 2020-2021 Tulir Asokan <tulir@maunium.net>

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

import React from "react";
import MImageBody from "./MImageBody";
import { presentableTextForFile } from "./MFileBody";
import { IMediaEventContent } from "../../../customisations/models/IMediaEventContent";
import SenderProfile from "./SenderProfile";

const FORCED_IMAGE_HEIGHT = 44;

export default class MImageReplyBody extends MImageBody {
    public onClick = (ev: React.MouseEvent): void => {
        ev.preventDefault();
    };

    public wrapImage(contentUrl: string, children: JSX.Element): JSX.Element {
        return children;
    }

    // Don't show "Download this_file.png ..."
    public getFileBody(): JSX.Element {
        return <>{ presentableTextForFile(this.props.mxEvent.getContent()) }</>;
    }

    render() {
        if (this.state.error !== null) {
            return super.render();
        }

        const content = this.props.mxEvent.getContent<IMediaEventContent>();

        const contentUrl = this.getContentUrl();
        const thumbnail = this.messageContent(contentUrl, this.getThumbUrl(), content, FORCED_IMAGE_HEIGHT);
        const fileBody = this.getFileBody();
        const sender = <SenderProfile
            mxEvent={this.props.mxEvent}
            enableFlair={false}
        />;

        return <div className="mx_MImageReplyBody">
            <div className="mx_MImageReplyBody_info">
                <div className="mx_MImageReplyBody_sender">{ sender }</div>
                <div className="mx_MImageReplyBody_filename">{ fileBody }</div>
            </div>
            { thumbnail }
        </div>;
    }
}
