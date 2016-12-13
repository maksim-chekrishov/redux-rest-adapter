# redux-rest-adapter
REST adapter for redux

[![npm version](https://badge.fury.io/js/redux-rest-adapter.svg)](https://badge.fury.io/js/redux-rest-adapter)

##Setup

###known-entities-api.js

```js
import EntityApi from 'redux-rest-adapter';

export const KnownEntitiesUrls = {
  NEWS_TAGS: 'news-tags',
  NEWS_TAG_FOR_EDIT: 'news-tags',
  //..
};
export default _.mapValues(KnownEntitiesUrls, (url, name)=> new EntityApi({
  entityName: name,
  endpointUrl: config.endpointRoot + url
}));
```

###entities-reducer.js

```js
// Ability to extend default api reducers
const entityReducersExtensions = {
  NEWS_TAGS: tagsReducer
}

const entitiesReducers = _.mapValues(knownEntitiesApi, (api, key) => api.configureReducer(entityReducersExtensions[key]));

export default combineReducers(entitiesReducers);
```

###entities-actions.js

```js
export default _.mapValues(knownEntitiesApi, entityApi => entityApi.actions);
```

##Adapter is ready



##Usage

###tags-container.js
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
      this.props.pending ?
        (<Loading/>) :
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
  removeTag: entitiesActions.NEWS_TAG_FOR_EDIT.remove,
  setTagForEdit: entitiesActions.NEWS_TAG_FOR_EDIT.set,
  resetEntryForEdit: entitiesActions.NEWS_TAG_FOR_EDIT.reset,
  loadList: entitiesActions.NEWS_TAGS.load
};

const TagsContainer = connect(mapStateToProps, mapDispatchToProps)(TagsComponent);

export {TagsComponent, TagsContainer};
```

##TODO
Example for CRUD list reducers
