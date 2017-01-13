/**
 * Created by m.chekryshov on 21.12.16.
 */
import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import configureMockStore from 'redux-mock-store';
import {promiseMiddleware} from '../../lib'

global.mockAxios = new AxiosMockAdapter(axios);

global.mockStore = configureMockStore([promiseMiddleware]);
