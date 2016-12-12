import EntityApi from '../lib';

describe('EntityApi', ()=> {
  let apiInstance;

  beforeEach(()=> {
    apiInstance = new EntityApi({entityName: 'TEST', endpointUrl: 'test'});
  });

  it('should be able to create instance', ()=> {
    expect(apiInstance).toBeDefined();
  });

  it('constructor should trow error without required params', ()=> {
    expect(()=> {
      new EntityApi();
    }).toThrow('entityName and endpointUrl are required');
  });

  it('should should be able to configure reducer', ()=> {
    expect(typeof apiInstance.configureReducer() === 'function').toBeTruthy();
    expect(typeof apiInstance.configureReducer(()=> {
      }) === 'function').toBeTruthy();
  });
});
