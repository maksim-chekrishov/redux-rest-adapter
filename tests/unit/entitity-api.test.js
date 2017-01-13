import EntityApi from '../../lib';
import {CALL_API} from '../../redux-api-middleware';

describe('EntityApi', ()=> {
  let apiInstance;

  beforeEach(()=> {
    apiInstance = new EntityApi({
      entityName: 'TEST',
      endpointUrl: 'test',
      apiOptions: {test: 'test'}
    });
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
  });

  it('should should be able to use custom option for api', ()=> {
    expect(apiInstance.load(1).test).toBe('test');
  });
});
