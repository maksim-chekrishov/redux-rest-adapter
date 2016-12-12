/**
 * Created by m.chekryshov on 12.12.16.
 */
import entityApi from './entity-api';
import {configureCRUDListReducerExtension} from './configure-reducer';
import configureReducer from './configure-reducer';
import {apiMiddleware} from 'redux-api-middleware';

export {apiMiddleware, configureReducer, configureCRUDListReducerExtension, entityApi}

export default entityApi;
