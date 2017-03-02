/**
 * Created by m.chekryshov on 03.10.16.
 */
import {EntityApi, ReducersBuilder} from '../../lib';
import _ from 'lodash';

describe('EntityApi', ()=> {
  let entityApiInstance = new EntityApi({
    entityName: 'TEST',
    endpointUrl: 'test'
  });

  const resourceKey = 'resourceKey';
  const idKey = 'idKey'

  it('should be able to reset item', ()=> {
    const initialState = {1: 1};
    const reducer = entityApiInstance.configureReducer(null, initialState);
    const stateBeforeAction = {2: 2};
    const stateAfterAction = reducer(stateBeforeAction, entityApiInstance.reset());

    expect(stateAfterAction).toEqual(initialState);
  });

  it('should be able to set item', ()=> {
    const resourceToSet = {1: 1};
    const reducer = entityApiInstance.configureReducer(null, resourceToSet);
    const stateBeforeAction = {data: 1};
    const stateAfterAction = reducer(stateBeforeAction, entityApiInstance.set(resourceToSet));

    expect(stateAfterAction.data).toEqual(resourceToSet);
  });

  describe('CRUD list extended reducer', ()=> {
    const {CreatedActionType, UpdatedActionType, DeletedActionType} = {
      CreatedActionType: 'CREATE_SUCCESS',
      UpdatedActionType: 'UPDATE_SUCCESS',
      DeletedActionType: ['DELETE_SUCCESS', 'ANOTHER_DELETE_SUCCESS']
    };

    const crudReducerExtension = ReducersBuilder.buildCRUDExtensionsForList({
      createSuccess: CreatedActionType,
      updateSuccess: UpdatedActionType,
      deleteSuccess: DeletedActionType
    }, resourceKey, idKey);

    const crudReducer = entityApiInstance.configureReducer(crudReducerExtension);

    let itemToRemove;
    let existedItem;
    let itemToCreate;
    let stateBeforeAction;

    beforeEach(()=> {
      itemToRemove = {[idKey]: 1};
      existedItem = {[idKey]: 2};
      itemToCreate = {[idKey]: 3};

      stateBeforeAction = {[resourceKey]: [itemToRemove, existedItem]};
    });

    it('should be able to remove item from list', ()=> {
      const action = {
        type: DeletedActionType[0],
        meta: itemToRemove
      };

      const stateAfterAction = crudReducer(stateBeforeAction, action);

      expect(stateAfterAction[resourceKey].indexOf(itemToRemove)).toEqual(-1);
      expect(stateAfterAction[resourceKey].length).toEqual(stateBeforeAction[resourceKey].length - 1);
    });

    it('should be able reduce several action types to one state', ()=> {
      const action = {
        type: DeletedActionType[1],
        meta: itemToRemove
      };

      const stateAfterAction = crudReducer(stateBeforeAction, action);

      expect(stateAfterAction[resourceKey].indexOf(itemToRemove)).toEqual(-1);
      //expect(stateAfterAction[resourceKey].length).toEqual(stateBeforeAction[resourceKey].length - 1);
    });

    it('should be able to update item at the list', ()=> {
      const updatedTag = {[idKey]: itemToRemove[idKey], name: 'updatedName'};

      const action = {
        type: UpdatedActionType,
        payload: {[resourceKey]: updatedTag}
      };

      const stateAfterAction = crudReducer(stateBeforeAction, action);
      const tagAfterAction = _.find(stateAfterAction[resourceKey], item=>item[idKey] === updatedTag[idKey]);

      expect(tagAfterAction.name).toEqual(updatedTag.name);
      expect(itemToRemove).not.toEqual(updatedTag.name);
      expect(stateAfterAction[resourceKey].length).toEqual(stateBeforeAction[resourceKey].length);
    });

    it('should be able to add new item to the list', ()=> {
      const action = {
        type: CreatedActionType,
        payload: {[resourceKey]: itemToCreate}
      };

      expect(stateBeforeAction[resourceKey].some(item=> item[idKey] === itemToCreate[idKey])).toBeFalsy();

      const stateAfterAction = crudReducer(stateBeforeAction, action);
      const tagAfterAction = stateAfterAction[resourceKey].filter(item=>item[idKey] === itemToCreate[idKey]);

      expect(tagAfterAction).toBeDefined();
      expect(stateAfterAction[resourceKey].length).toEqual(stateBeforeAction[resourceKey].length + 1);
    });
  });
});
