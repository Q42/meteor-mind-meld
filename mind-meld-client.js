MindMeld = {
  export(collectionName, password, callBack) {
    Meteor.call('mm_export', collectionName, password, callBack);
  },
  import(options) {
    Meteor.call('mm_import', options);
  }
}
