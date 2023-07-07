import { VERIFIEDOWNERSHIPTYPE } from "../actions/actionTypes";

const initialState = {
    verifiedOwnershipList: {}
};

const addUser = (state, id, verifiedId) => {
    const verifiedOwnershipList = { ...state.verifiedOwnershipList, [id]: verifiedId };
    return { ...state, verifiedOwnershipList: verifiedOwnershipList }
}

const verifiedOwnership = (state = initialState, action) => {
    switch (action.type) {
      case VERIFIEDOWNERSHIPTYPE.ADD_USER:
        return addUser(state, action.id, action.verifiedId)
      default:
        return state;
    }
};
  
export default verifiedOwnership;