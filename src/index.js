/**
 * Created by m.chekryshov on 12.12.16.
 */
import EntityApi, {RequestStatuses} from './entity-api';
import ReducersBuilder from './reducers-builder';
import _promiseMiddleware from 'redux-promise-middleware';

const promiseMiddleware = _promiseMiddleware({
  promiseTypeSuffixes: [RequestStatuses.REQUEST, RequestStatuses.SUCCESS, RequestStatuses.FAIL]
});

export {promiseMiddleware, ReducersBuilder, EntityApi};

export default EntityApi;
