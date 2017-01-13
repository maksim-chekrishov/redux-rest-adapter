import EntityApi from '../../lib';
import axios from 'axios';


xdescribe('EntityApi', () => { // wait for solving issue wit axios mock
  const resourceKey = 'testResKey';
  let store,
    apiInstance,
    ActionsTypes,
    expectedResource;


  afterEach(() => {
    mockAxios.reset();
    //moxios.uninstall()
  })

  beforeEach(() => {
    //moxios.install()

    store = mockStore({entities: {TEST: {}}});
    store.dispatch = jest.fn(store.dispatch);

    apiInstance = new EntityApi({
      entityName: 'TEST',
      endpointUrl: '/test',
      apiOptions: {test: 'test'}
    });

    expectedResource = {id: 1, title: 'TITLE'};
    ActionsTypes = apiInstance.actionsTypes;
  })

  // --------------------- LOAD --------------------------

  it('should be able to load resource', () => {
    const expectedActions = [
      {type: ActionsTypes.LOAD.REQUEST},
      {type: ActionsTypes.LOAD.SUCCESS, payload: {[resourceKey]: expectedResource}}
    ];
    mockAxios
      .onGet('/test')
      .reply(config => {
        return [
          200,
          {[resourceKey]: expectedResource}
        ];
      });

    // moxios.wait(() => {
    //   const request = moxios.requests.mostRecent()
    //
    //   request.respondWith({
    //     status: 200,
    //     response: {[apiInstance._resourceKey]: expectedResource}
    //   }).then(function() {
    //     expect(store.getActions()).toEqual(1);
    //   });
    // });

    axios.get('/test').catch(function(response) {
      console.log(response.data);
    });

    store.dispatch(apiInstance.actions.load()).then(res => {
      expect(store.getActions()).toEqual(1);
    });
  })

  it('should be able to load resource by id', () => {
    const expectedActions = [
      {type: ActionsTypes.LOAD.REQUEST},
      {type: ActionsTypes.LOAD.SUCCESS, payload: {[resourceKey]: expectedResource}}
    ];

    // mockAxios
    //   .onGet('/test/1')
    //   .reply(config => {
    //     return [
    //       200,
    //       {[resourceKey]: expectedResource}
    //     ];
    //   });

    store.dispatch(apiInstance.actions.load(1)).then(res => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  })

  it('should be able to process load fail', () => {
    const expectedAction = {
      type: ActionsTypes.LOAD.FAIL,
      error: true
    };

    // mockAxios
    //   .onGet('/test')
    //   .reply(config => {
    //     return [
    //       500,
    //       {[resourceKey]: expectedResource}
    //     ];
    //   });

    store.dispatch(apiInstance.actions.load()).catch(res => {
      let lastAction = store.getActions();
      lastAction = lastAction[lastAction.length - 1];
      expect(lastAction.error).toEqual(true);
      expect(lastAction.type).toEqual(ActionsTypes.LOAD.FAIL);
    });
  })

  // --------------------- CREATE --------------------------

  xit('should be able to create resource', () => {
    const expectedActions = [
      {type: ActionsTypes.CREATE.REQUEST},
      {type: ActionsTypes.CREATE.SUCCESS, payload: {[resourceKey]: expectedResource}}
    ];

    // mockAxios.onAny().reply(500);

    axios.post('/test')
      .catch(function(response) {
        console.log(response);
      });

    store.dispatch(apiInstance.actions.create(expectedResource)).catch(res => {
      const actions = store.getActions();
      // console.log(apiInstance.actions.create(expectedResource));
      // console.log(actions);
      expect(actions).toEqual(expectedActions);
    });
  })

  xit('should be able to process create fail', () => {
    const expectedAction = {
      type: ActionsTypes.CREATE.FAIL,
      error: true
    };

    // mockAxios
    //   .onPost('/test')
    //   .reply(config => {
    //     return [
    //       500,
    //       {[resourceKey]: expectedResource}
    //     ];
    //   });


    store.dispatch(apiInstance.actions.create()).catch(res => {
      let lastAction = store.getActions();
      lastAction = lastAction[lastAction.length - 1];

      expect(lastAction.error).toEqual(true);
      expect(lastAction.type).toEqual(ActionsTypes.CREATE.FAIL);
    });
  })


  // --------------------- UPDATE --------------------------

  xit('should be able to up resource', () => {
    const expectedActions = [
      {type: ActionsTypes.UPDATE.REQUEST},
      {type: ActionsTypes.UPDATE.SUCCESS, payload: {[resourceKey]: expectedResource}}
    ];

    // mockAxios
    //   .onAny('/test')
    //   .reply(config => {
    //     return [
    //       200,
    //       {[resourceKey]: expectedResource}
    //     ];
    //   });

    store.dispatch(apiInstance.actions.update()).then(res => {
      const actions = store.getActions();

      expect(actions[actions.length - 1].method).toEqual('put');
      expect(actions).toEqual(expectedActions);
    });
  })

  xit('should be able to process create fail', () => {
    const expectedAction = {
      type: ActionsTypes.CREATE.FAIL,
      error: true
    };

    // mockAxios
    //   .onPost('/test')
    //   .reply(config => {
    //     return [
    //       500,
    //       {[resourceKey]: expectedResource}
    //     ];
    //   });

    store.dispatch(apiInstance.actions.update()).catch(res => {
      let lastAction = store.getActions();
      lastAction = lastAction[lastAction.length - 1];

      expect(lastAction.error).toEqual(true);
      expect(lastAction.type).toEqual(ActionsTypes.CREATE.FAIL);
      expect(lastAction.method).toEqual('put');
    });
  })

})
