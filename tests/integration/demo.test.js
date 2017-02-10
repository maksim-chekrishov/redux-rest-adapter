/**
 * Created by m.chekryshov on 10.02.17.
 */
import EntityApi, {promiseMiddleware} from '../../lib';
import {createStore, applyMiddleware, combineReducers} from 'redux';

describe('Demo', () => {

  afterEach(()=> {
    mockAxios.reset();
  })

  it('should work', () => {
    const expectedResource = {id: 1, title: 'TITLE'};

    mockAxios.onGet('api/v2/tags/1').reply(200, {data: expectedResource});

    const tagsApi = new EntityApi({
      entityName: 'TAGS',
      endpointUrl: 'api/v2/tags'
    });

    const apiReducers = combineReducers({
      TAGS: tagsApi.configureReducer()
    });

    const store = createStore(
      combineReducers({
        api: apiReducers
      }),
      {},
      applyMiddleware(promiseMiddleware())
    );

    return store.dispatch(tagsApi.actions.load(1)).then(()=> {
      return expect(store.getState().api.TAGS.data).toEqual(expectedResource);
    });
  })
});
