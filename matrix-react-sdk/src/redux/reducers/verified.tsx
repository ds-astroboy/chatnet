import { VERIFIEDACTIONTYPE } from "../actions/actionTypes";

const initialState = {
    verifiedList: {}
};

const addOne = (state, id, key, data) => {
  let item = state.verifiedList[id];
  if(item) {
    item = {...item, [key]: data};
  }
  else {
    item = {
      [key]: data
    }
  }
  const verifiedList = { ...state.verifiedList, [id]: item };
  return { ...state, verifiedList: verifiedList }
}

const verified = (state = initialState, action) => {
    switch (action.type) {
      case VERIFIEDACTIONTYPE.ADD_ONE:
        return addOne(state, action.id, action.key, action.data)
      default:
        return state;
    }
};
  
export default verified;