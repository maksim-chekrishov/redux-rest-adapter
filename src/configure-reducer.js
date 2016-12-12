/**
 * Created by m.chekryshov on 20.03.16.
 */

/**
 * Generate reducers for supplied entity api
 *
 * @param {EntityApi} entityApi
 * @param {Function} [reducerExtensions]
 * @param {Object} [initialState= {}]
 * @returns {Function} reducer
 */
export default function(entityApi, reducerExtensions, initialState = {}) {
  return function(state = initialState, action = {}) {
    let ActionsTypes = entityApi.actionsTypes;

    switch (action.type) {
      /**
       * LOAD
       */
      case ActionsTypes.LOAD.REQUEST:
        return reduceRequest(state, action);
      case ActionsTypes.LOAD.SUCCESS:
        return reduceSuccess(state, action);
      case ActionsTypes.LOAD.FAIL:
        return reduceFail(state, action);
      /**
       * UPDATE
       */
      case ActionsTypes.UPDATE.REQUEST:
        return reduceRequest(state, action);
      case ActionsTypes.UPDATE.SUCCESS:
        return reduceSuccess(state, action);
      case ActionsTypes.UPDATE.FAIL:
        return reduceFail(state, action);
      /**
       * CREATE
       */
      case ActionsTypes.CREATE.REQUEST:
        return reduceRequest(state, action);
      case ActionsTypes.CREATE.SUCCESS:
        return Object.assign({}, state, {
          pending: false,
          error: false,
          data: action.payload.result,
          meta: action.meta
        });
      case ActionsTypes.CREATE.FAIL:
        return reduceFail(state, action);
      /**
       * REMOVE
       */
      case ActionsTypes.REMOVE.REQUEST:
        return reduceRequest(state, action);
      case ActionsTypes.REMOVE.SUCCESS:
        return initialState;
      case ActionsTypes.REMOVE.FAIL:
        return reduceFail(state, action);


      /**
       * Silent actions, with
       */

      case ActionsTypes.RESET:
        return initialState;


      case ActionsTypes.SET:
        return Object.assign({}, state, {
          data: _.isArray(state.data)
            ? [].concat(action.payload.result)
            : Object.assign({}, state.data, action.payload.result)
        });

      /**
       * Reducer extensions
       */

      default :
        return reducerExtensions
          ? reducerExtensions(state, action)
          : state;
    }
  };
}

/**
 * Configure default list reducer extension with basic reactions on CRUD actions
 * @param {Object} actionsTypes - at least one of actions types is required
 * @param {string || Array.<string>} [actionsTypes.createSuccess]
 * @param {string || Array.<string>} [actionsTypes.updateSuccess]
 * @param {string || Array.<string>} [actionsTypes.deleteSuccess]
 * @returns {Function} reducerExtension
 */
export function configureCRUDListReducerExtension({createSuccess, updateSuccess, deleteSuccess}) {
  const opt = arguments[0];

  for (let key in opt) {
    if (opt.hasOwnProperty(key)) {
      // convert to array
      opt[key] = [].concat(opt[key]);
    }
  }

  return function(state = {}, action = {}) {
    let id;
    let clone;
    let result;
    const actionType = action.type;

    if (deleteSuccess && deleteSuccess.indexOf(actionType) !== -1) {
      /**
       * after success we need remove item from list
       */
      id = action.meta.id;
      clone = Object.assign({}, state);
      clone.data = clone.data ? clone.data.filter((item)=>(item.id !== id)) : [];
      return clone;
    } else if (updateSuccess && updateSuccess.indexOf(actionType) !== -1) {
      /**
       * after successfully update we need update item at the list
       */
      id = action.payload.result.id;
      result = action.payload.result;
      clone = Object.assign({}, state);
      clone.data = clone.data ? clone.data.map((item)=>(item.id !== id ? item : result)) : [];
      return clone;
    } else if (createSuccess && createSuccess.indexOf(actionType) !== -1) {
      /**
       * after creation new item we need add it to the list
       */
      result = action.payload.result;
      clone = Object.assign({}, state);
      clone.data = clone.data ? clone.data.concat([result]) : [];
      return clone;
    }
    return state;
  };
}

// Common reducer functions

function reduceRequest(state, action) {
  return Object.assign({}, state, {
    pending: true,
    meta: action.meta,
    // status 500 is not fail for fetch, see explanations https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
    error: !!action.error,
    data: state.data,
    messages: action.payload ? action.payload.messages : []
  });
}

function reduceSuccess(state, action) {
  return Object.assign({}, state, {
    pending: false,
    error: false,
    data: action.payload.result,
    meta: action.meta,
    totals: action.payload.totals
  });
}

function reduceFail(state, action) {
  return Object.assign({}, state, {
    pending: false,
    error: true,
    messages: action.payload.messages,
    data: state.data,
    meta: action.meta
  });
}
