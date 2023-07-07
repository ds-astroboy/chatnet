import * as BufferLayout from "buffer-layout";

const publicKey = (property = "publicKey") => {
    return BufferLayout.blob(32, property);
};

const uint64 = (property = "uint64") => {
    return BufferLayout.blob(8, property);
};

export const ESCROW_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
    BufferLayout.u8("isInitialized"),
    BufferLayout.u8("amount_x"),
    BufferLayout.u8("amount_y"),
    BufferLayout.u8("sol_dir"),
    uint64("sol_amount"),
    publicKey("initPubkey"),
    publicKey("takerPubkey"),
    publicKey("ata_e_Pubkey1"),
    uint64("lamports_1"),
    publicKey("ata_e_Pubkey2"),
    uint64("lamports_2"),
    publicKey("ata_e_Pubkey3"),
    uint64("lamports_3"),
    publicKey("ata_e_Pubkey4"),
    uint64("lamports_4"),
    publicKey("ata_e_Pubkey5"),
    uint64("lamports_5"),
    publicKey("ata_e_Pubkey6"),
    uint64("lamports_6"),
    publicKey("ata_b_Pubkey7"),
    uint64("lamports_7"),
    publicKey("ata_b_Pubkey8"),
    uint64("lamports_8"),
    publicKey("ata_b_Pubkey9"),
    uint64("lamports_9"),
    publicKey("ata_b_Pubkey10"),
    uint64("lamports_10"),
    publicKey("ata_b_Pubkey11"),
    uint64("lamports_11"),
    publicKey("ata_b_Pubkey12"),
    uint64("lamports_12"),
]);