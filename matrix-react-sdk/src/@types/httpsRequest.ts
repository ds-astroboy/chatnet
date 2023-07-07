export const httpsRequest = {
    RoomBarrier: "https://main.cafeteria.gg/api/room_barrier",
    PayPointForBarrier: "https://main.cafeteria.gg/api/room_entry_pay_points",
    GetUserPoints: "https://main.cafeteria.gg/dashboard/api/total_user_points",
    PayPointsToRoom: "https://main.cafeteria.gg/api/room_entry_pay_points/",
    tipPoints: "https://main.cafeteria.gg/api/user_tip_points/",
    GetAllCategories: "https://main.cafeteria.gg/api/room_categories/",
    GetCategoryForRoom: "https://main.cafeteria.gg/api/room_category",
    SetCategoryForRoom: "https://main.cafeteria.gg/api/room_category",
    SavePointsPresentTip: "https://main.cafeteria.gg/api/present_points/",
    saveCryptoPresentTip: "https://main.cafeteria.gg/api/present_crypto/",
    CheckTransactionSolscan: "https://public-api.solscan.io/transaction",
    GetBackgrounds: "https://main.cafeteria.gg/api/backgrounds/",
    CheckVerifiedNFT: "https://main.cafeteria.gg/api/verify_nft/",
    SaveUserStatus: "https://main.cafeteria.gg/api/status_message/",
    GetUserStatus: "https://main.cafeteria.gg/api/user_status",
    PublicRooms: "https://main.cafeteria.gg:8448/_matrix/client/r0/publicRooms",
    SpecificPublicRooms: "https://main.cafeteria.gg/api/public_rooms",
    FanTip: "https://main.cafeteria.gg/api/fun_tip/",
    PMSetting: "https://main.cafeteria.gg/api/pm_flag/",
    GetPMSettingForUser: "https://main.cafeteria.gg/api/user_pm_flag",
    VerifyWeb2UserEmail: "https://node-main.cafeteria.gg/v1/auth/web2/verify/email",
    SignInWeb2UserEmail: "https://node-main.cafeteria.gg/v1/auth/web2/email",
    VerifySolanaWalletAddress: "https://node-main.cafeteria.gg/v1/auth/web3/verify/solana",
    VerifyAptosWalletAddress: "https://node-main.cafeteria.gg/v1/auth/web3/verify/aptos",
    SignInViaSolanaWallet: "https://node-main.cafeteria.gg/v1/auth/web3/solana",
    SignInViaAptosWallet: "https://node-main.cafeteria.gg/v1/auth/web3/aptos",
    VerifyEthWalletAddress: "https://node-main.cafeteria.gg/v1/auth/web3/verify/ethereum",
    SignInViaEthWallet: "https://node-main.cafeteria.gg/v1/auth/web3/ethereum",
    PostFeedback: "https://main.cafeteria.gg/api/feedback/",
    DomainName: "https://main.cafeteria.gg/api/domain_displayname/",
    CheckDomainName: "https://main.cafeteria.gg/api/check_displayname/",
    NftAvatar: "https://main.cafeteria.gg/api/nft_avatar/",
    CheckNftAvatar: "https://main.cafeteria.gg/api/check_avatar/",
    GetMatrixUserInfoById: "https://main.cafeteria.gg/api/user_info",
    EmailSubscription: "https://forms.cafeteria.gg/v1/forms/subscriptions",
    CreateGroup: "https://node-main.cafeteria.gg/v1/rooms",
    VerifiedUser: "https://main.cafeteria.gg/api/user_verified",
    SoftBarrierVerify: "https://main.cafeteria.gg/api/soft_barrier_verify",
    GetLatestModal: "https://node-main.cafeteria.gg/v1/modals/latest",
    MCDVerify: "https://main.cafeteria.gg/api/user_mcd_verified",
    getWalleAddresstUrl: (username: string, protocol: string) => {
        return `https://node-main.cafeteria.gg/v1/users/${username}/wallet/${protocol}`
    },
    getUserIdUrl: (username: string) => {
        return `https://node-main.cafeteria.gg/v1/users/${username}/userId`
    },
    getConnectWalletByUserNameUrl: (username: string, protocol: string) => {
        return `https://node-main.cafeteria.gg/v1/users/${username}/connect/wallet/${protocol}`
    },
    getUserDetailUrl: (username: string) => {
        return `https://node-main.cafeteria.gg/v1/users/${username}/details`
    },
    getConnectEmailByUserNameUrl: (username: string) => {
        return `https://node-main.cafeteria.gg/v1/users/${username}/connect/email`
    },
    getEmailAddressByUserNameUrl: (username: string) => {
        return `https://node-main.cafeteria.gg/v1/users/${username}/email`
    },
    getUsersByRoomIdUrl: (roomId: string) => {
        return `https://node-main.cafeteria.gg/v1/rooms/${roomId}/users`
    },
    getTilesByRoomId: (roomId: string) => {
        return `https://node-main.cafeteria.gg/v1/rooms/${roomId}/tiles`
    },
    getRoomCreatorUsername: (roomId: string) => {
        return `https://node-main.cafeteria.gg/v1/rooms/${roomId}/creator/username`
    }    
}