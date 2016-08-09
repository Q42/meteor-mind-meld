
Meteor.methods({
  mm_export(collectionName, password) {
    check(collectionName, String);
    check(password, String);

    if (!Meteor.settings.MIND_MELD_TOKEN)
      throw new Meteor.Error('no token set');

    if (password !== Meteor.settings.MIND_MELD_TOKEN)
      throw new Meteor.Error('incorrect password: ' + password);

    return MindMeld.export(collectionName);
  },


  mm_import(url, collections, password1, password2) {
    check(collections, [String]);
    check(password1, String);
    check(password2, String);

    if (!Meteor.settings.MIND_MELD_TOKEN)
      throw new Meteor.Error('no token set');
      
    if (Meteor.isProduction)
      throw new Meteor.Error('importing not allowed on production deployment, to secure your data');

    if (password1 !== Meteor.settings.MIND_MELD_TOKEN)
      throw new Meteor.Error('incorrect password: ' + password1);

    MindMeld.import(url, collections, password2);
  }
});


MindMeld = {
  export(collectionName) {
    const collection = Mongo.Collection.get(collectionName);
    if (!collection || !(collection instanceof Mongo.Collection ))
      throw new Meteor.Error(collectionName + ' is not a valid collection');

    console.log("dumping " + collectionName);
    return collection.find({}).fetch();
  },

  import(url, collections, password) {
    const connection = DDP.connect(url);
    collections.forEach( col => MindMeld.importCollection(connection, col, password) );
    console.log('done!');
  },

  importCollection(connection, collectionName, password) {
    const collection = Mongo.Collection.get(collectionName);
    if (!collection instanceof Mongo.Collection)
      throw new Error(collectionName + ' is not a valid collection');

    const dump = connection.call("mm_export", collectionName, password);
    if (!dump || !dump.length) {
      console.log('nothing to import');
      return;
    }

    console.log('importing ' + dump.length + ' items into ' + collectionName);
    collection.remove({});

    dump.forEach(record => {
      console.log(record._id);
      try {
        collection.insert(record);
      } catch (e) {
        console.warn('error while inserting ' + record._id + ' into ' + collectionName);
        console.warn(e);
      }
    });
  }

};

Meteor.startup(() => !Meteor.settings.MIND_MELD_TOKEN && console.warn('MindMeld: no token set'));
