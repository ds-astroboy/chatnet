import { USERSACTIONTYPE } from "../actions/actionTypes";

const initialState = {
    usersInfo: {}
};

const addUser = (state, userId, userInfo) => {
    const usersInfo = { ...state.usersInfo, [userId]: userInfo };
    return { ...state, usersInfo: usersInfo }
}

const users = (state = initialState, action) => {
    switch (action.type) {
      case USERSACTIONTYPE.ADD_USER:
        return addUser(state, action.userId, action.userInfo)
      default:
        return state;
    }
};
  
export default users;