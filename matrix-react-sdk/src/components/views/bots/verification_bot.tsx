import * as React from "react";
import axios from "axios";

export const getUserActivated = async (userId, roomId) => {
    var activated;
    // Check for being activated
    const userHumanVerified = await axios.get(
        `https://node-main.cafeteria.gg/v1/bots/humanVerificationBot/${roomId}/getUserVerified/${userId}`,
        { validateStatus: false } // Accept 404 as a response code
    )
    if (userHumanVerified.status == 200){
        activated = true
    } else {
        activated = false
    }

    return activated
}

export const getRoomHasVerificationEnabled = async (roomId) => {
    // // Database check if room has verification bot activated
    var enabled;
    const roomVerificationBotEnabled = await axios.get(
        `https://node-main.cafeteria.gg/v1/bots/humanVerificationBot/${roomId}/getBotEnabled`,
        { validateStatus: false } // Accept 404 as a response code
    )
    if (roomVerificationBotEnabled.status == 200){
        enabled = roomVerificationBotEnabled.data
    } else {
        enabled = false
    }

    return enabled
}