/**
 * Created by m.chekryshov on 12.12.16.
 */
import entityApi from './entity-api';
import {configureCRUDListReducerExtension} from './configure-reducer';
import configureReducer from './configure-reducer';
import reduxApiMiddleware from 'redux-api-middleware';

export {configureReducer, configureCRUDListReducerExtension, entityApi, reduxApiMiddleware}

export default entityApi;
