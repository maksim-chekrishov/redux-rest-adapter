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
   * @param {string} [resourceKey= 'data'] - response resource prop name
   * @param {string} [idKey='id'] - resource id prop name
   * @returns {Function} reducerExtension
   */
  static buildCRUDExtensionsForList({createSuccess, updateSuccess, deleteSuccess}, resourceKey, idKey) {
    resourceKey = resourceKey || 'data';
    idKey = idKey || 'id';

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
        id = action.meta[idKey];
        clone = Object.assign({}, state);
        clone[resourceKey] = clone[resourceKey] ? clone[resourceKey].filter(item=> item[idKey] !== id) : [];
        return clone;
      } else if (updateSuccess && updateSuccess.indexOf(actionType) !== -1) {
        /**
         * after successfully update we need update item at the list
         */
        id = action.payload[resourceKey][idKey];
        result = action.payload[resourceKey];
        clone = Object.assign({}, state);
        clone[resourceKey] = clone[resourceKey] ? clone[resourceKey].map((item)=>(item[idKey] !== id ? item : result)) : [];
        return clone;
      } else if (createSuccess && createSuccess.indexOf(actionType) !== -1) {
        /**
         * after creation new item we need add it to the list
         */
        result = action.payload[resourceKey];
        clone = Object.assign({}, state);
        clone[resourceKey] = clone[resourceKey] ? clone[resourceKey].concat([result]) : [];
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
   * @param {string} [resourceKey= 'data'] - response resource prop name
   * @param {Object} [initialState= {}]
   * @param {String} [operationsFlags="CRUD"]
   * @returns {Function} reducer
   */
  static build(actionsTypesTree, reducerExtensions, resourceKey = 'data', initialState = {}, operationsFlags = 'CRUDS') {
    const normalizedFlags = operationsFlags.toLowerCase();

    const reducerParts = [];


    //  Extension has top level priority to provide ability override default behaviour
    if (reducerExtensions) {
      Array.isArray(reducerExtensions)
        ? reducerParts.push(...reducerExtensions)
        : reducerParts.push(reducerExtensions);
    }

    containsString(normalizedFlags, 'c') && reducerParts.push(this._buildReducerForOperation(actionsTypesTree.CREATE));
    containsString(normalizedFlags, 'r') && reducerParts.push(this._buildReducerForOperation(actionsTypesTree.LOAD));
    containsString(normalizedFlags, 'u') && reducerParts.push(this._buildReducerForOperation(actionsTypesTree.UPDATE));
    containsString(normalizedFlags, 'd') && reducerParts.push(this._buildReducerForOperation(actionsTypesTree.REMOVE));

    // Silent actions
    containsString(normalizedFlags, 's') && reducerParts.push(this._buildSilentActionsReducer(actionsTypesTree, resourceKey));

    return function(state = initialState, action = {}) {
      let _state = state;

      reducerParts.forEach((reduce)=> {
        _state = reduce(_state, action);
      });

      return _state;
    };
  }

  static _buildSilentActionsReducer(actionsTypesTree, resourceKey) {
    return (state, action) => {
      switch (action.type) {

        case actionsTypesTree.RESET:
          return initialState;


        case actionsTypesTree.SET:
          return Object.assign({}, state, {
            [resourceKey]: Array.isArray(state[resourceKey])
              ? [].concat(action.payload[resourceKey])
              : Object.assign({}, state[resourceKey], action.payload[resourceKey])
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
      _pending: true,
      _actionMeta: action.meta,
      _error: !!action.error,
      ...action.payload
    });
  }

  static _reduceSuccess(state, action) {
    return Object.assign({}, state, {
      _pending: false,
      _actionMeta: action.meta,
      _error: false,
      ...action.payload
    });
  }

  static _reduceFail(state, action) {
    return Object.assign({}, state, {
      _pending: false,
      _actionMeta: action.meta,
      _error: true,
      ...action.payload
    });
  }
}

export default ReducersBuilder;
