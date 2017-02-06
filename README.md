# redux-rest-adapter

[![npm version](https://badge.fury.io/js/redux-rest-adapter.svg)](https://badge.fury.io/js/redux-rest-adapter)

redux-rest-adapter is a tool for easy connection your REST api with redux store.

Compatible with [json.api specification](http://jsonapi.org/)

##Main points
- Write **code** instead of reducers and actions for trivial data operations.

##Changelog

Starts from v2.0.0 redux-rest-adapter based on
[axios](https://www.npmjs.com/package/axios) and
[promise-middleware](https://www.npmjs.com/package/promise-middleware)
for easy access to promises and better experience with isomorphic app.

[Versions 1.x.x](https://raw.githubusercontent.com/maksim-chekrishov/redux-rest-adapter/master/readme-src/readme-1v.md)

##Setup

###known-entities-api.js

```js
import EntityApi from 'redux-rest-adapter';

export const KnownEntitiesUrls = {
  NEWS_TAGS: 'news-tags',
  NEWS_TAG_FOR_EDIT: 'news-tags',
  //..
};
export default _.mapValues(KnownEntitiesUrls, (url, name) => new EntityApi({
  entityName: name,
  endpointUrl: 'api/v2/' + url
}));
```

###api-reducer.js

```js
// Ability to extend default api reducers
const apiReducersExtensions = {
  NEWS_TAGS: tagsReducer
}

const apiReducers = _.mapValues(knownEntitiesApi, (api, key) => api.configureReducer(apiReducersExtensions[key]));

export default combineReducers(entitiesReducers);
```

###your-index-reducer.js

```js
export default combineReducers({
  api: apiReducers
  //..
});
```

###configure-store.js

```js
import {promiseMiddleware} from 'redux-rest-adapter';
//..
export default function configureStore(initialState) {
  return createStore(
    yourIndexReducer,
    initialState,
    applyMiddleware(promiseMiddleware())
  );
}
```

###entities-actions.js

```js
export default _.mapValues(knownEntitiesApi, entityApi => entityApi.actions);
```


##Adapter is ready

![Image devTools](https://raw.githubusercontent.com/maksim-chekrishov/redux-rest-adapter/master/readme-src/dev-tools.png)

##Usage

###Actions

```js
import entitesActions from 'entities-actions';

dispatch(entitesActions.NEWS_TAG.load());                          // GET:    api/v2/news-tags
dispatch(entitesActions.NEWS_TAG.load(1));                         // GET:    api/v2/news-tags/1

// --- NOTE: HTTP methods for create and update operations can be configured
dispatch(entitesActions.NEWS_TAG.update(1, {name: 'new tag'}));    // PATCH:  api/v2/news-tags/1
dispatch(entitesActions.NEWS_TAG.create({name: 'new tag'}));       // POST:   api/v2/news-tags
dispatch(entitesActions.NEWS_TAG.remove(1));                       // DELETE: api/v2/news-tags/1

// --- Silent methods for changing store without sync with backend
dispatch(entitesActions.NEWS_TAG.set({name: 'new tag'}));          // data propety will be updated
dispatch(entitesActions.NEWS_TAG.reset());                         // reset to initial state

```

###React component example
```js
class TagsComponent extends Component {
  componentWillMount() {
    this.props.loadList();
  }

  //..

  componentWillUnmount() {
    this.props.resetEntryForEdit();
  }

  onTagFormSubmit = ()=> {
    const data = this.props.tagForEdit;
    if (data.id) {
      this.props.updateTag(data.id, data);
    } else {
      this.props.createTag(data);
    }
  }

  render() {
    return (
      this.props._pending ?
        <Loading/> :
        <div>
           {/*...*/}
        </div>
    );
  }
}

const mapStateToProps = (state) => ({
  list: state.entities.NEWS_TAGS.data || [],
  pending: state.entities.NEWS_TAGS.pending,
  tagForEdit: state.entities.NEWS_TAG_FOR_EDIT.data || {}
});

const mapDispatchToProps = {
  createTag: entitiesActions.NEWS_TAG_FOR_EDIT.create,
  updateTag: entitiesActions.NEWS_TAG_FOR_EDIT.update,
  resetEntryForEdit: entitiesActions.NEWS_TAG_FOR_EDIT.reset,
  loadList: entitiesActions.NEWS_TAGS.load
};

const TagsContainer = connect(mapStateToProps, mapDispatchToProps)(TagsComponent);

export {TagsComponent, TagsContainer};
```

##Configuration

###EntityApi constructor options

| Name | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `entityName` | `String` |  | **Required.** will be used for naming state and actionTypes. |
| `endpointUrl` | `String`|  | **Required.** endpointUrl |
| `reducersBuilderCustom` | `Object`| `reducersBuilderDefault` | Customer can redefine interface of reducers-builder.js|
| `axiosConfig` | `Object`| `{}` | [axios config](https://github.com/mzabriskie/axios#request-config)|
| `resourceKey` | `String`| `'data'` | Name of data property key at response object |
| `idKey` | `String`| `'id'` | Name of id property key at response data object. Required for CRUD reducer extensions|
| `restHttpMethods` | `Object`| `{create:'post', update:'patch'}` | Customer can change HTTP methods used for create and update actions |

##TODO

Example of generated list reducer (basic CRUD operations)

###See also

[redux-localstorage-adapter](https://www.npmjs.com/package/redux-localstorage-adapter)
