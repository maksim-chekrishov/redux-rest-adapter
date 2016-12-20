import {CALL_API} from '../redux-api-middleware';
import ReducersBuilderDefault from './reducers-builder';

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
   * Default api options
   *
   * @type {Object}
   * @private
   */
  _apiOptions = {
    headers: {'Accept': 'application/json'},
  }

  _resourceKey = 'data'

  /**
   * Constructor
   *
   * @param {Object} options
   * @param {string} options.entityName - will be used for naming actionTypes
   * @param {string} options.endpointUrl
   * @param {class} [options.ReducersBuilderCustom = ReducersBuilderDefault]
   * @param {Object} [options.apiOptions = _apiOptions] - options for redux-api-middleware
   * @param {string} [options.resourceKey = _resourceKey] - payload resource key (entity data key)
   */
  constructor(options) {
    if (!options || !options.entityName || !options.endpointUrl) {
      throw new Error('entityName and endpointUrl are required');
    }

    this._entityName = options.entityName;
    this._endpointUrl = options.endpointUrl;

    // Options with default values
    this.ReducersBuilder = options.ReducersBuilderCustom || ReducersBuilderDefault;
    this._apiOptions = options.apiOptions || this._apiOptions;
    this._resourceKey = options.resourceKey || this._resourceKey;
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

  generateRequestActionsOptions(methodName, meta) {
    return orderedRequestStatusesArray.map(eventName => ({
      type: `${this._entityName}_${methodName.toUpperCase()}_${eventName}`,
      meta
    }));
  }

  generateSilentActionType(methodName) {
    return `${this._entityName}_${methodName.toUpperCase()}`;
  }

  /**
   * Generate reducer for current api instance
   * @param {Function} [reducerExtension]
   * @param {Object} [initialState = {}]
   */
  configureReducer(reducerExtension, initialState = {}) {
    return this.ReducersBuilder.build(this.actionsTypes, reducerExtension, this._resourceKey, initialState);
  }

  configureCRUDExtensionsForList() {

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
        method: 'GET',
        ...this._apiOptions
      }
    };
  }

  [RestMethods.CREATE](entity) {
    return {
      [CALL_API]: {
        types: this.generateRequestActionsOptions(RestMethods.CREATE, entity),
        endpoint: this._endpointUrl,
        method: 'POST',
        body: JSON.stringify(entity),
        ...this._apiOptions
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
        ...this._apiOptions
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
        method: 'DELETE',
        ...this._apiOptions
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
  [SilentMethods.SET](resource) {
    return {
      type: this.generateSilentActionType(SilentMethods.SET),
      payload: {
        [this._apiOptions.resourceKey]: resource
      }
    };
  }

  /**
   * Provide ability to reset resource in entity storage
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
