import { cryptoKey, hideRooms, pass, verifiedUsersAndRooms } from "../@types/variables";
import { BLOCKCHAINNETWORKS } from "../@variables/common";
var CryptoJS = require("crypto-js");

export const checkVerifiedUserOrRoom = (
    id: string,
    name: string = null,
) => {
    let index1 = verifiedUsersAndRooms.indexOf(id);
    let index2 = verifiedUsersAndRooms.indexOf(name);
    if(index1 === -1 && index2 === -1) return false;
    else return true;
}

export const checkHideRoom = (
    name: string
) => {
    let index = hideRooms.indexOf(name)
    if(index === -1) return false
    else return true
}

export const checkPasswordForJoin = (
    password: string
) => {
    let result = false;
    pass.forEach(p => {
        let bytes = CryptoJS.AES.decrypt(p, cryptoKey);
        let decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        if (password === decryptedData) {
            result = true;
        }
    })
    return result;
}

export const checkIsDisplayName = (
    str: string
) => {
    let index = str.indexOf("main.cafeteria.gg");
    return (index === -1)
} 

export const getProtocol = (
    currency: string
) => {
    switch(currency) {
        case "Solana":
        case "Kin":
            return BLOCKCHAINNETWORKS.Solana;
        case "Ethereum":
            return BLOCKCHAINNETWORKS.Ethereum;
        case "Matic":
            return BLOCKCHAINNETWORKS.Polygon;
        case "BNB":
            return BLOCKCHAINNETWORKS.BSC;
        case "Aptos":
            return BLOCKCHAINNETWORKS.Aptos
        default :
            return ""
    }
}