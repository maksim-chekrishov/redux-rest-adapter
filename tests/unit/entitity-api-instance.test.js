import EntityApi from '../../lib';

describe('EntityApi', ()=> {
  let apiInstance;

  beforeEach(()=> {
    apiInstance = new EntityApi({
      entityName: 'TEST',
      endpointUrl: 'test'
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

  it('should be able to configure reducer', ()=> {
    expect(typeof apiInstance.configureReducer() === 'function').toBeTruthy();
  });

  describe('should be able to parse load options when consumer use', ()=> {

    it('empty string', ()=> {
      const parsed = apiInstance._parseLoadOptions('');
      expect(parsed.queryString).toEqual('');
      expect(parsed.params).toEqual({});
    });

    it('not empty string', ()=> {
      const parsed = apiInstance._parseLoadOptions('1');
      expect(parsed.queryString).toEqual('/1');
      expect(parsed.params).toEqual({});
    });

    it('number', ()=> {
      const parsed = apiInstance._parseLoadOptions(1);
      expect(parsed.queryString).toEqual('/1');
      expect(parsed.params).toEqual({});
    });

    it('object without params and path', ()=> {
      const parsed = apiInstance._parseLoadOptions({id: 1});
      expect(parsed.queryString).toEqual('');
      expect(parsed.params).toEqual({id: 1});
    });

    it('object with params only', ()=> {
      const parsed = apiInstance._parseLoadOptions({params: {id: 1}});
      expect(parsed.queryString).toEqual('');
      expect(parsed.params).toEqual({id: 1});
    });

    it('object with path only', ()=> {
      const parsed = apiInstance._parseLoadOptions({path: '1'});
      expect(parsed.queryString).toEqual('/1');
      expect(parsed.params).toEqual({});
    });

    it('object with path and params', ()=> {
      const options = {path: 'path/1', params: {id: 1, mode: 'short'}};
      const parsed = apiInstance._parseLoadOptions(options);
      expect(parsed.queryString).toEqual(`/${options.path}`);
      expect(parsed.params).toEqual(options.params);
    });


  });


});
