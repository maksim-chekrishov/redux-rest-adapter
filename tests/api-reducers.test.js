/**
 * Created by m.chekryshov on 03.10.16.
 */
import EntityApi from '../lib';
import ReducersBuilder from  '../lib/reducers-builder';
import _ from 'lodash';

describe('EntityApi', ()=> {
  let entityApiInstance = new EntityApi({entityName: 'TEST', endpointUrl: 'test'});

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
    });

    const crudReducer = entityApiInstance.configureReducer(crudReducerExtension);

    let itemToRemove;
    let existedItem;
    let itemToCreate;
    let stateBeforeAction;

    beforeEach(()=> {
      itemToRemove = {id: 1};
      existedItem = {id: 2};
      itemToCreate = {id: 3};

      stateBeforeAction = {data: [itemToRemove, existedItem]};
    });

    it('should be able to remove item from list', ()=> {
      const action = {
        type: DeletedActionType[0],
        meta: itemToRemove
      };

      const stateAfterAction = crudReducer(stateBeforeAction, action);

      expect(stateAfterAction.data.indexOf(itemToRemove)).toEqual(-1);
      expect(stateAfterAction.data.length).toEqual(stateBeforeAction.data.length - 1);
    });

    it('should be able reduce several action types to one state', ()=> {
      const action = {
        type: DeletedActionType[1],
        meta: itemToRemove
      };

      const stateAfterAction = crudReducer(stateBeforeAction, action);

      expect(stateAfterAction.data.indexOf(itemToRemove)).toEqual(-1);
      expect(stateAfterAction.data.length).toEqual(stateBeforeAction.data.length - 1);
    });

    it('should be able to update item at the list', ()=> {
      const updatedTag = {id: itemToRemove.id, name: 'updatedName'};

      const action = {
        type: UpdatedActionType,
        payload: {result: updatedTag}
      };

      const stateAfterAction = crudReducer(stateBeforeAction, action);
      const tagAfterAction = _.find(stateAfterAction.data, item=>item.id === updatedTag.id);

      expect(tagAfterAction.name).toEqual(updatedTag.name);
      expect(itemToRemove).not.toEqual(updatedTag.name);
      expect(stateAfterAction.data.length).toEqual(stateBeforeAction.data.length);
    });

    it('should be able to add new item to the list', ()=> {
      const action = {
        type: CreatedActionType,
        payload: {result: itemToCreate}
      };

      expect(stateBeforeAction.data.some(item=> item.id === itemToCreate.id)).toBeFalsy();

      const stateAfterAction = crudReducer(stateBeforeAction, action);
      const tagAfterAction = stateAfterAction.data.filter(item=>item.id === itemToCreate.id);

      expect(tagAfterAction).toBeDefined();
      expect(stateAfterAction.data.length).toEqual(stateBeforeAction.data.length + 1);
    });
  });
});
