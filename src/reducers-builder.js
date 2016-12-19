/**
 * Created by m.chekryshov on 18.12.16.
 */

import {containsString} from './utils';

class ReducersBuilder {
  /**
   * Configure default list reducer extension with basic reactions on CRUD actions
   *
   * @param {Object} actionsTypes - at least one of actions types is required
   * @param {string || Array.<string>} [actionsTypes.createSuccess]
   * @param {string || Array.<string>} [actionsTypes.updateSuccess]
   * @param {string || Array.<string>} [actionsTypes.deleteSuccess]
   * @returns {Function} reducerExtension
   */
  static buildCRUDExtensionsForList({createSuccess, updateSuccess, deleteSuccess}) {
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

  /**
   * Generate reducers for supplied entity api
   *
   * @param {Object} actionsTypesTree
   * @param {Function | Array.<Function>} [reducerExtensions]
   * @param {Object} [initialState= {}]
   * @param {String} [operationsFlags="CRUD"]
   * @returns {Function} reducer
   */
  static build(actionsTypesTree, reducerExtensions, initialState = {}, operationsFlags = 'CRUDS') {
    const normalizedFlags = operationsFlags.toLowerCase();

    const reducerParts = [];

    containsString(normalizedFlags, 'c') && reducerParts.push(this._buildReducerForOperation(actionsTypesTree.CREATE));
    containsString(normalizedFlags, 'r') && reducerParts.push(this._buildReducerForOperation(actionsTypesTree.LOAD));
    containsString(normalizedFlags, 'u') && reducerParts.push(this._buildReducerForOperation(actionsTypesTree.UPDATE));
    containsString(normalizedFlags, 'd') && reducerParts.push(this._buildReducerForOperation(actionsTypesTree.REMOVE));

    // Silent actions
    containsString(normalizedFlags, 's') && reducerParts.push(this._buildSilentActionsReducer(actionsTypesTree));

    if (reducerExtensions) {
      Array.isArray(reducerExtensions)
        ? reducerParts.push(...reducerExtensions)
        : reducerParts.push(reducerExtensions);
    }

    return function(state = initialState, action = {}) {
      let _state = state;

      reducerParts.forEach((reduce)=> {
        _state = reduce(_state, action);
      });

      return _state;
    };
  }

  static _buildSilentActionsReducer(actionsTypesTree) {
    return (state, action) => {
      switch (action.type) {

        case actionsTypesTree.RESET:
          return initialState;


        case actionsTypesTree.SET:
          return Object.assign({}, state, {
            data: Array.isArray(state.data)
              ? [].concat(action.payload.result)
              : Object.assign({}, state.data, action.payload.result)
          });

        default:
          return state;
      }
    }
  }

  static _buildReducerForOperation(operationActionsTypes) {
    return (state, action) => {
      const actionType = action.type;

      if (operationActionsTypes.REQUEST === actionType) {
        return this._reduceRequest(state, action);
      } else if (operationActionsTypes.SUCCESS === actionType) {
        return this._reduceSuccess(state, action);
      } else if (operationActionsTypes.FAIL === actionType) {
        return this._reduceFail(state, action);
      }
      return state;
    };
  }


  //
  // Common reducer functions
  //

  static _reduceRequest(state, action) {
    return Object.assign({}, state, {
      pending: true,
      meta: action.meta,
      // status 500 is not fail for fetch, see explanations https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
      error: !!action.error,
      messages: action.payload ? action.payload.messages : [],
      data: state.data
    });
  }

  static _reduceSuccess(state, action) {
    return Object.assign({}, state, {
      pending: false,
      meta: action.meta,
      error: false,
      data: action.payload.result,
      totals: action.payload.totals
    });
  }

  static _reduceFail(state, action) {
    return Object.assign({}, state, {
      pending: false,
      meta: action.meta,
      error: true,
      messages: action.payload ? action.payload.messages : [],
      data: state.data
    });
  }
}

export default ReducersBuilder;
