import { USERSACTIONTYPE } from "./actionTypes";

const addUser = (userId, userInfo) => {
    return {
      type: USERSACTIONTYPE.ADD_USER,
      userId,
      userInfo
    };
};
  
export default {
    addUser
};