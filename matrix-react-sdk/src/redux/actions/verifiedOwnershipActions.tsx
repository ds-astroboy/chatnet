import { VERIFIEDOWNERSHIPTYPE } from "./actionTypes";

const addUser = (id, verifiedId) => {
    return {
      type: VERIFIEDOWNERSHIPTYPE.ADD_USER,
      id,
      verifiedId
    };
};
  
export default {
    addUser
};