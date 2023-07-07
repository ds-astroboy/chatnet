import { CurrencyBarrierType, NftBarrierType } from "./barrier";


export interface PublicRoomType {
    avatar_url?: string;
    barrierInfo:  CurrencyBarrierType | undefined;
    canonical_alias: string;
    categoryName?: string;
    guest_can_join: boolean;
    join_rule: string;
    name: string;
    room_id: string;
    topic?: string;
    num_joined_members: boolean;
    world_readable: boolean;
}