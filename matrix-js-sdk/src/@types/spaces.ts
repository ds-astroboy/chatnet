/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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

import { IPublicRoomsChunkRoom } from "../client";

// Types relating to Rooms of type `m.space` and related APIs

/* eslint-disable camelcase */
export interface ISpaceSummaryRoom extends IPublicRoomsChunkRoom {
    num_refs: number;
    room_type: string;
}

export interface ISpaceSummaryEvent {
    room_id: string;
    event_id: string;
    origin_server_ts: number;
    type: string;
    state_key: string;
    content: {
        order?: string;
        suggested?: boolean;
        auto_join?: boolean;
        via?: string[];
    };
}
/* eslint-enable camelcase */
