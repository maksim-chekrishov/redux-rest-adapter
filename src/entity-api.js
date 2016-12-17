import {CALL_API} from '../redux-api-middleware';
import configureReducer from './configure-reducer.js';

export const RestMethods = {
  LOAD: 'load',
  CREATE: 'create',
  UPDATE: 'update',
  REMOVE: 'remove'
};

export const SilentMethods = {
  SET: 'set',
  RESET: 'reset'
};

export const RequestStatuses = {
  REQUEST: 'REQUEST',
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL'
};

export const orderedRequestStatusesArray = [RequestStatuses.REQUEST, RequestStatuses.SUCCESS, RequestStatuses.FAIL];

export default class EntityApi {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {string} options.entityName - will be used for naming actionTypes
   * @param {string} options.endpointUrl
   */
  constructor(options) {
    if (!options || !options.entityName || !options.endpointUrl) {
      throw new Error('entityName and endpointUrl are required');
    }

    this.entityName = options.entityName;
    this._endpointUrl = options.endpointUrl;
  }

  /**
   * Provide actions for api instance
   *
   * @returns {Object}
   */
  get actions() {
    const _this = this;
    const actions = {};

    const allMethods = {...RestMethods, ...SilentMethods};

    for (let key in allMethods) {
      const methodName = allMethods[key];
      actions[methodName] = _this[methodName].bind(_this);
    }

    return actions;
  }

  get actionsTypes() {
    const _this = this;

    // Private property for lazy getter
    if (!this._actionsTypes) {
      this._actionsTypes = {};

      for (let key in RestMethods) {
        const methodName = RestMethods[key];
        const requestStatusActionsOptions = _this.generateRequestActionsOptions(methodName);
        const res = {};

        orderedRequestStatusesArray.map((status, i)=> {
          res[status] = requestStatusActionsOptions[i].type;
        });

        _this._actionsTypes[key] = res;
      }

      for (let key in SilentMethods) {
        _this.actionsTypes[key] = _this.generateSilentActionType(SilentMethods[key])
      }
    }

    return this._actionsTypes;
  }

  get _requestHeaders() {
    return {
      'Accept': 'application/json'
    };
  }

  generateRequestActionsOptions(methodName, meta) {
    return orderedRequestStatusesArray.map(eventName => ({
      type: `${this.entityName}_${methodName.toUpperCase()}_${eventName}`,
      meta
    }));
  }

  generateSilentActionType(methodName) {
    return `${this.entityName}_${methodName.toUpperCase()}`;
  }

  /**
   * Generate reducer for current api instance
   * @param {Function} [reducerExtension]
   * @param {Object} [initialState = {}]
   */
  configureReducer(reducerExtension, initialState = {}) {
    return configureReducer(this, reducerExtension, initialState);
  }

  configureCRUDListReducer(reducerExtension, initialState = {}) {
    return configureReducer(this, reducerExtension, initialState);
  }

  serialize(obj) {
    if (!obj) {
      return '';
    }
    return '/?' + Object.keys(obj).map(key => key + '=' + encodeURIComponent(obj[key])).join('&');
  }

  /**
   * Load entity
   *
   * @param {Object} params
   * @returns {Object}
   */
  [RestMethods.LOAD](params) {
    const queryString = parseInt(params, 10) ? '/' + params : this.serialize(params);
    return {
      [CALL_API]: {
        types: this.generateRequestActionsOptions(RestMethods.LOAD, params),
        endpoint: this._endpointUrl + queryString,
        headers: this._requestHeaders,
        method: 'GET',
        credentials: 'include'
      }
    };
  }

  [RestMethods.CREATE](entity) {
    return {
      [CALL_API]: {
        types: this.generateRequestActionsOptions(RestMethods.CREATE, entity),
        endpoint: this._endpointUrl,
        method: 'POST',
        headers: this._requestHeaders,
        body: JSON.stringify(entity),
        credentials: 'include'
      }
    };
  }

  [RestMethods.UPDATE](id, entity) {
    return {
      [CALL_API]: {
        types: this.generateRequestActionsOptions(RestMethods.UPDATE, entity),
        endpoint: this._endpointUrl + '/' + id,
        method: 'PUT',
        body: JSON.stringify(entity),
        credentials: 'include'
      }
    };
  }

  /**
   * Remove entity by id or entity object
   *
   * @param {string} [id='']
   * @returns {Object}
   */
  [RestMethods.REMOVE](id = '') {
    const queryString = id ? '/' + id : id;
    return {
      [CALL_API]: {
        types: this.generateRequestActionsOptions(RestMethods.REMOVE, {id: id}),
        endpoint: this._endpointUrl + queryString,
        headers: this._requestHeaders,
        method: 'DELETE',
        credentials: 'include'
      }
    };
  }

  /**
   * Provide ability to set data into entity storage
   * without server synchronization
   *
   * @param data
   * @returns {{type: string, payload: {result: *}}}
   * @constructor
   */
  [SilentMethods.SET](data) {
    return {
      type: this.generateSilentActionType(SilentMethods.SET),
      payload: {
        result: data
      }
    };
  }

  /**
   * Provide ability to reset data in entity storage
   * without server synchronization
   *
   * @returns {{type: string, payload: {result: *}}}
   * @constructor
   */
  [SilentMethods.RESET]() {
    return {
      type: this.generateSilentActionType(SilentMethods.RESET)
    };
  }
}
