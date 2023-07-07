export interface CurrencyBarrierType {
    room_id: string;
    type: string;
    creator?: string;
    currency_type?: string;
    amount?: number;
    nft_update_auth_addr?: string;
    uri?: string;
}

export interface NftBarrierType {
    room_id: string;
    type: string;
    nft_update_auth_addr: string;
    uri: string;
}

export const BarrierType  = {
    WalletPay: "wallet.pay",
    WalletCheck: "wallet.check",
    PointsPay: "points.pay",
    PointsCheck: "points.check",
    NFTCheck: "nft.check",
    DomainCheck: "domain.check",
    NFTSoftBarrier: "nft.softBarrier",
}

export const BarrierTootip = {
    [BarrierType.WalletPay]: "Crypto(Sol) Barrier Room(Pay)",
    [BarrierType.WalletCheck]: "Crypto(Sol) Barrier Room(Check)",
    [BarrierType.PointsPay]: "Cafeteria Credits Barrier Room(Pay)",
    [BarrierType.PointsCheck]: "Cafeteria Credits Barrier Room(Check)",
    [BarrierType.NFTCheck]: "NFT Barrier Room(Check)",
    [BarrierType.DomainCheck]: "Domain Barrier Room(Check)",
}