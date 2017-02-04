import EntityApi from '../../lib';

describe('EntityApi', () => {
  const resourceKey = 'testResKey';
  let store,
    apiInstance,
    ActionsTypes,
    expectedResource;

  beforeEach(() => {
    store = mockStore({entities: {TEST: {}}});
    //store.dispatch = jest.fn(store.dispatch);

    apiInstance = new EntityApi({
      entityName: 'TEST',
      endpointUrl: '/test'
    });

    expectedResource = {id: 1, title: 'TITLE'};
    ActionsTypes = apiInstance.actionsTypes;
  })

  afterEach(()=> {
    mockAxios.reset();
  })

  // --------------------- LOAD --------------------------

  it('should be able to load resource', () => {
    mockAxios.onGet('/test').reply(200, {[resourceKey]: expectedResource});

    const expectedActions = [
      {type: ActionsTypes.LOAD.REQUEST},
      {type: ActionsTypes.LOAD.SUCCESS, payload: {[resourceKey]: expectedResource}}
    ];

    return store.dispatch(apiInstance.actions.load()).then(res => {
      return expect(store.getActions()).toEqual(expectedActions);
    });
  })

  it('should be able to load resource by id', () => {
    const expectedActions = [
      {type: ActionsTypes.LOAD.REQUEST},
      {type: ActionsTypes.LOAD.SUCCESS, payload: {[resourceKey]: expectedResource}}
    ];

    mockAxios.onGet('/test/1').reply(200, {[resourceKey]: expectedResource});

    return store.dispatch(apiInstance.actions.load(1)).then(res => {
      return expect(store.getActions()).toEqual(expectedActions);
    });
  })

  // todo: need research axions mock doesn't work with params
  xit('should be able to load resource by id with params', () => {
    const expectedActions = [
      {type: ActionsTypes.LOAD.REQUEST},
      {type: ActionsTypes.LOAD.SUCCESS, payload: {[resourceKey]: expectedResource}}
    ];

    mockAxios.onGet('/test/1?param1=1').reply(200, {[resourceKey]: expectedResource});
    // mockAxios.onGet().reply(config=> {
    //   console.log(config);
    // });

    return store.dispatch(apiInstance.actions.load({id: 1, param1: 1})).then(() => {
      return expect(store.getActions()).toEqual(expectedActions);
    });
  })

  // todo: need research axions mock doesn't work with params
  xit('should be able to load resource with complex param', () => {
    const expectedActions = [
      {type: ActionsTypes.LOAD.REQUEST},
      {type: ActionsTypes.LOAD.SUCCESS, payload: {[resourceKey]: expectedResource}}
    ];

    mockAxios.onGet('/test?filter[order]=1').reply(200, {[resourceKey]: expectedResource});

    return store.dispatch(apiInstance.actions.load({'filter[order]': '1'})).then(() => {
      return expect(store.getActions()).toEqual(expectedActions);
    });
  })

  it('should be able to process load fail', () => {
    mockAxios.onGet('/test/2').reply(500, {});

    return store.dispatch(apiInstance.actions.load(2)).catch(res => {
      let lastAction = store.getActions();
      lastAction = lastAction[lastAction.length - 1];

      const hasError = !!lastAction.error;
      const isFailed = lastAction.type === ActionsTypes.LOAD.FAIL;

      return expect(isFailed && hasError && res.response.status == 500).toEqual(true);
    });
  })


  // --------------------- CREATE --------------------------

  it('should be able to create resource', () => {
    const expectedActions = [
      {type: ActionsTypes.CREATE.REQUEST},
      {type: ActionsTypes.CREATE.SUCCESS, payload: {[resourceKey]: expectedResource}}
    ];

    mockAxios.onPost('/test').reply(200, {[resourceKey]: expectedResource});

    return store.dispatch(apiInstance.actions.create(expectedResource)).catch(res => {
      const actions = store.getActions();

      return expect(actions).toEqual(expectedActions);
    });
  })

  it('should be able to process create fail', () => {
    mockAxios.onPost('/test').reply(500, {});

    return store.dispatch(apiInstance.actions.create()).catch(res => {
      let lastAction = store.getActions();
      lastAction = lastAction[lastAction.length - 1];

      return expect(!!lastAction.error &&
        lastAction.type === ActionsTypes.CREATE.FAIL &&
        res.response.status == 500
      ).toEqual(true);
    });
  })


  // --------------------- UPDATE --------------------------

  it('should be able to update resource', () => {
    mockAxios.onPatch('/test/1').reply(200, {[resourceKey]: expectedResource});

    return store.dispatch(apiInstance.actions.update(1)).then(res => {
      const actions = store.getActions();
      const lastAction = actions[actions.length - 1];

      return expect(lastAction.type === ActionsTypes.UPDATE.SUCCESS).toEqual(true);
    });
  })

  it('should be able to process create fail', () => {
    mockAxios.onPatch('/test/44').reply(500, {});

    return store.dispatch(apiInstance.actions.update(44)).catch(res => {
      let lastAction = store.getActions();
      lastAction = lastAction[lastAction.length - 1];

      return expect(!!lastAction.error &&
        lastAction.type === ActionsTypes.UPDATE.FAIL &&
        res.response.status == 500
      ).toEqual(true);
    });
  })

  // --------------------- DELETE --------------------------

  it('should be able remove source', () => {
    mockAxios.onAny('/test/1').reply(200, {});

    return store.dispatch(apiInstance.actions.remove(1)).then(res => {
      const actions = store.getActions();
      const lastAction = actions[actions.length - 1];

      return expect(lastAction.type).toEqual(ActionsTypes.REMOVE.SUCCESS);
    });
  })

  it('should be able to process remove fail', () => {
    mockAxios.onAny('/test/44').reply(500, {});

    return store.dispatch(apiInstance.actions.remove(44)).catch(res => {
      let lastAction = store.getActions();
      lastAction = lastAction[lastAction.length - 1];

      return expect(!!lastAction.error &&
        lastAction.type === ActionsTypes.REMOVE.FAIL &&
        res.response.status == 500
      ).toEqual(true);
    });
  })


  describe('should provide ability to override http method for ', ()=> {

    beforeEach(()=> {
      apiInstance = new EntityApi({
        entityName: 'TEST',
        endpointUrl: '/test',
        restHttpMethods: {create: 'put', update: 'post'}
      });
    })

    it('update', () => {
      mockAxios.onPost('/test/1').reply(200, {[resourceKey]: expectedResource});

      return store.dispatch(apiInstance.actions.update(1)).then(res => {
        const actions = store.getActions();
        const lastAction = actions[actions.length - 1];

        return expect(lastAction.type).toEqual(ActionsTypes.UPDATE.SUCCESS);
      });
    })

    it('create', () => {
      const expectedActions = [
        {type: ActionsTypes.CREATE.REQUEST},
        {type: ActionsTypes.CREATE.SUCCESS, payload: {[resourceKey]: expectedResource}}
      ];

      mockAxios.onPut('/test').reply(200, {[resourceKey]: expectedResource});

      return store.dispatch(apiInstance.actions.create(expectedResource)).catch(res => {
        const actions = store.getActions();

        return expect(actions).toEqual(expectedActions);
      });
    })

  });

  describe('should provide ability to use axios config for', ()=> {
    const axiosConfig = {timeout: 99};

    beforeEach(()=> {
      apiInstance = new EntityApi({
        entityName: 'TEST',
        endpointUrl: '/test',
        axiosConfig
      });

      mockAxios.onAny().reply(config=>[200, config]);
    })

    it('load', () => {
      return store.dispatch(apiInstance.actions.load(1)).then(config => {
        return expect(config.value.timeout).toEqual(axiosConfig.timeout);
      });
    });

    it('update', () => {
      return store.dispatch(apiInstance.actions.update(1)).then(config => {
        return expect(config.value.timeout).toEqual(axiosConfig.timeout);
      });
    });

    it('remove', () => {
      return store.dispatch(apiInstance.actions.remove(1)).then(config => {
        return expect(config.value.timeout).toEqual(axiosConfig.timeout);
      });
    });

    it('create', () => {
      return store.dispatch(apiInstance.actions.create(1)).then(config => {
        return expect(config.value.timeout).toEqual(axiosConfig.timeout);
      });
    });
  });
})
