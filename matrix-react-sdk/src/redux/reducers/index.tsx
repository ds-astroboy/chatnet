import { combineReducers } from "redux";
import users from "./users";
import verified from "./verified";
import verifiedOwnership from "./verifiedOwnership";
import wallet from "./wallet";

const rootReducer = combineReducers({
    users,
    verified,
    verifiedOwnership,
    wallet
});

export default rootReducer;