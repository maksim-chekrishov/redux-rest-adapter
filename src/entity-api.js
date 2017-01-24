import reducersBuilderDefault from './reducers-builder';
import axios from 'axios';

export const RestMethods = {
  LOAD: 'load',
  CREATE: 'create',
  UPDATE: 'update',
  REMOVE: 'remove'
};

export const RestHttpMethodsDefault = {
  'create': 'post',
  'update': 'patch'
};

export const SilentMethods = {
  SET: 'set',
  RESET: 'reset'
};

export const RequestStatusesDefault = {
  REQUEST: 'REQUEST',
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL'
};


export default class EntityApi {

  _resourceKey = 'data'

  _requestStatuses = [RequestStatusesDefault.REQUEST, RequestStatusesDefault.SUCCESS, RequestStatusesDefault.FAIL];

  _reducersBuilder = reducersBuilderDefault;

  _restHttpMethods = RestHttpMethodsDefault;

  _axiosConfig = {};

  _idKey = 'id'

  /**
   * Constructor
   *
   * @param {Object} options
   * @param {string} options.entityName - will be used for naming actionTypes
   * @param {string} options.endpointUrl
   * @param {class} [options.reducersBuilderCustom = reducersBuilderDefault]
   * @param {Object} [options.axiosConfig = _axiosConfig] - options for redux-api-middleware
   * @param {string} [options.resourceKey = _resourceKey] - payload resource key (entity data key)
   * @param {string} [options.idKey = _idKey] - payload id key (entity id key)
   */
  constructor(options) {
    if (!options || !options.entityName || !options.endpointUrl) {
      throw new Error('entityName and endpointUrl are required');
    }

    this._entityName = options.entityName;
    this._endpointUrl = options.endpointUrl;

    // Options with default values
    this._reducersBuilder = options.reducersBuilderCustom || reducersBuilderDefault;
    this._apiOptions = options.apiOptions || this._apiOptions;
    this._resourceKey = options.resourceKey || this._resourceKey;
    this._restHttpMethods = options.restHttpMethods || this._restHttpMethods;
    this._idKey = options.idKey || this._idKey;
    this._axiosConfig = options.axiosConfig || this._axiosConfig;
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

        this._requestStatuses.map((status, i)=> {
          res[status] = requestStatusActionsOptions[i].type;
        });

        _this._actionsTypes[key] = res;
      }

      for (let key in SilentMethods) {
        _this.actionsTypes[key] = _this._getActionTypeForMethod(SilentMethods[key])
      }
    }

    return this._actionsTypes;
  }

  _getActionTypeForMethod(apiMethodName) {
    return `${this._entityName}_${apiMethodName.toUpperCase()}`
  }

  generateRequestActionsOptions(methodName) {
    return this._requestStatuses.map(eventName => ({
      type: `${this._entityName}_${methodName.toUpperCase()}_${eventName}`
    }));
  }

  /**
   * Generate reducer for current api instance
   * @param {Function} [reducerExtension]
   * @param {Object} [initialState = {}]
   */
  configureReducer(reducerExtension, initialState = {}) {
    return this._reducersBuilder.build(this.actionsTypes, reducerExtension, this._resourceKey, initialState);
  }

  /**
   * Load entity
   *
   * @param {Object|Number} params
   * @returns {Object}
   */
  [RestMethods.LOAD](params) {
    let queryString = '';
    let _params = {...params};

    const paramsType = typeof params;

    switch (paramsType) {
      case 'string':
      case 'number':
        queryString = `/${params}`;
        _params = undefined;
        break;
      case 'object':
        if (!Array.isArray(params)) {
          queryString = `/${params[this._idKey]}`;
          _params[this._idKey] = undefined;
        }
        break;
      default:
        break;
    }

    const config = Object.assign({}, this._axiosConfig, {params: _params});

    return {
      type: this._getActionTypeForMethod(RestMethods.LOAD),
      payload: axios.get(`${this._endpointUrl}${queryString}`, config)
        .then(res => res.data)
    };
  }

  [RestMethods.CREATE](entity) {
    const createMethodName = this._restHttpMethods.create;
    const data = {[this._resourceKey]: entity};

    return {
      type: this._getActionTypeForMethod(RestMethods.CREATE),
      payload: axios[createMethodName](this._endpointUrl, data, this._axiosConfig)
        .then(res => res.data)
    };
  }

  [RestMethods.UPDATE](id, entity) {
    const updateMethodName = this._restHttpMethods.update;
    const data = {[this._resourceKey]: entity};

    return {
      type: this._getActionTypeForMethod(RestMethods.UPDATE),
      payload: axios[updateMethodName](`${this._endpointUrl}/${id}`, data, this._axiosConfig)
        .then(res => res.data)
    };
  }

  /**
   * Remove entity by id or entity object
   *
   * @param {string} [id='']
   * @returns {Object}
   */
  [RestMethods.REMOVE](id = '') {
    return {
      type: this._getActionTypeForMethod(RestMethods.REMOVE),
      payload: axios.delete(`${this._endpointUrl}/${id}`, this._axiosConfig).then(res => res.data),
      meta: {[this._idKey]: id}
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
      type: this._getActionTypeForMethod(SilentMethods.SET),
      payload: {
        [this._resourceKey]: resource
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
      type: this._getActionTypeForMethod(SilentMethods.RESET)
    };
  }
}
