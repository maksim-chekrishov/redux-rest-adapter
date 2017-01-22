/**
 * Created by m.chekryshov on 12.12.16.
 */
import EntityApi, {RequestStatusesDefault} from './entity-api';
import ReducersBuilder from './reducers-builder';
import reduxPromiseMiddleware from 'redux-promise-middleware';

export {promiseMiddleware, ReducersBuilder, EntityApi};

export default EntityApi;

/**
 *
 * @param {Object} options - reduxPromiseMiddleware options
 */
function promiseMiddleware(options) {
  const optionsDefault = {
    promiseTypeSuffixes: [RequestStatusesDefault.REQUEST, RequestStatusesDefault.SUCCESS, RequestStatusesDefault.FAIL]
  };

  return reduxPromiseMiddleware({...optionsDefault, ...options})
}
