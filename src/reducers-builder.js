/**
 * Created by m.chekryshov on 18.12.16.
 */

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
  static buildCRUDextensionsForList({createSuccess, updateSuccess, deleteSuccess}) {
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
   * @param {Function} [reducerExtensions]
   * @param {Object} [initialState= {}]
   * @returns {Function} reducer
   */
  static build(actionsTypesTree, reducerExtensions, initialState = {}) {
    const _reduceRequest = this._reduceRequest;
    const _reduceSuccess = this._reduceSuccess;
    const _reduceFail = this._reduceFail;

    return function(state = initialState, action = {}) {
      switch (action.type) {
        /**
         * LOAD
         */
        case actionsTypesTree.LOAD.REQUEST:
          return _reduceRequest(state, action);
        case actionsTypesTree.LOAD.SUCCESS:
          return _reduceSuccess(state, action);
        case actionsTypesTree.LOAD.FAIL:
          return _reduceFail(state, action);
        /**
         * UPDATE
         */
        case actionsTypesTree.UPDATE.REQUEST:
          return _reduceRequest(state, action);
        case actionsTypesTree.UPDATE.SUCCESS:
          return _reduceSuccess(state, action);
        case actionsTypesTree.UPDATE.FAIL:
          return _reduceFail(state, action);
        /**
         * CREATE
         */
        case actionsTypesTree.CREATE.REQUEST:
          return _reduceRequest(state, action);
        case actionsTypesTree.CREATE.SUCCESS:
          return Object.assign({}, state, {
            pending: false,
            error: false,
            data: action.payload.result,
            meta: action.meta
          });
        case actionsTypesTree.CREATE.FAIL:
          return _reduceFail(state, action);
        /**
         * REMOVE
         */
        case actionsTypesTree.REMOVE.REQUEST:
          return _reduceRequest(state, action);
        case actionsTypesTree.REMOVE.SUCCESS:
          return initialState;
        case actionsTypesTree.REMOVE.FAIL:
          return _reduceFail(state, action);


        /**
         * Silent actions, with
         */

        case actionsTypesTree.RESET:
          return initialState;


        case actionsTypesTree.SET:
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

  //
  // Common reducer functions
  //

  static _reduceRequest(state, action) {
    return Object.assign({}, state, {
      pending: true,
      meta: action.meta,
      // status 500 is not fail for fetch, see explanations https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
      error: !!action.error,
      data: state.data,
      messages: action.payload ? action.payload.messages : []
    });
  }

  static _reduceSuccess(state, action) {
    return Object.assign({}, state, {
      pending: false,
      error: false,
      data: action.payload.result,
      meta: action.meta,
      totals: action.payload.totals
    });
  }

  static _reduceFail(state, action) {
    return Object.assign({}, state, {
      pending: false,
      error: true,
      messages: action.payload.messages,
      data: state.data,
      meta: action.meta
    });
  }
}

export default ReducersBuilder;
