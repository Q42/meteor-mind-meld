
Meteor.methods({
  mm_export(collectionName, password) {
    return MindMeld.export(collectionName, password);
  },

  mm_import(options) {
    if (!Meteor.settings.mindMeld || !Meteor.settings.mindMeld.password)
      throw new Meteor.Error('no password set in Meteor.settings.mindMeld.password, not importing');

    if (options.localPassword !== Meteor.settings.mindMeld.password)
      throw new Meteor.Error('incorrect localPassword');

    MindMeld.import(options);
  }
});


MindMeld = {
  export(collectionName, password) {
    check(collectionName, String);
    check(password, String);

    if (!Meteor.settings.mindMeld || !Meteor.settings.mindMeld.password)
      throw new Meteor.Error('no password set in Meteor.settings.mindMeld.password, not exporting');

    if (password !== Meteor.settings.mindMeld.password)
      throw new Meteor.Error('incorrect export password');

    return MindMeld._export(collectionName);
  },

  import(options) {
    check(options, {
      sourceUrl: String,
      sourcePassword: String,
      collections: [String],
      localPassword: Match.Optional(String), // only if running from the client

      keepCurrentData: Match.Optional(Boolean),
      bypassCollection2: Match.Optional(Boolean), // enables https://github.com/aldeed/meteor-collection2#inserting-or-updating-bypassing-collection2-entirely
      enableHooks: Match.Optional(Boolean) // enables https://github.com/matb33/meteor-collection-hooks#direct-access-circumventing-hooks
    });

    if (!Meteor.settings.mindMeld || !Meteor.settings.mindMeld.password)
      throw new Meteor.Error('no password set in Meteor.settings.mindMeld.password, not importing');

    if (!Meteor.settings.mindMeld || !Meteor.settings.mindMeld.allowImport)
      throw new Meteor.Error('import not allowed according to Meteor.settings.mindMeld.allowImport');

    MindMeld._import(options);
  },

  _export(collectionName) {
    const collection = Mongo.Collection.get(collectionName);
    if (!collection || !(collection instanceof Mongo.Collection ))
      throw new Meteor.Error(collectionName + ' is not a valid collection');

    const result = collection.find({}).fetch();
    console.log("[MindMeld] dumping " + result.length + " records for " + collectionName);
    return result;
  },

  _import(options) {
    const connection = DDP.connect(options.sourceUrl);
    options.collections.forEach( col => MindMeld._importCollection(connection, col, options) );
    console.log('[MindMeld] done!');
  },

  _importCollection(connection, collectionName, options) {
    const collection = Mongo.Collection.get(collectionName);
    if (!collection instanceof Mongo.Collection)
      throw new Error(collectionName + ' is not a valid collection');

    const dump = connection.call("mm_export", collectionName, options.sourcePassword);
    if (!dump || !dump.length) {
      console.log('[MindMeld] nothing to import for ' + collectionName);
      return;
    }

    if (!options.keepCurrentData) {
      console.log('[MindMeld] removing all local records from ' + collectionName);
      collection.remove({});
    }

    console.log('[MindMeld] importing ' + dump.length + ' items into ' + collectionName);
    dump.forEach(record => {
      console.log('[MindMeld] importing ' + collectionName + ' ' + record._id);
      const insertOptions = options.bypassCollection2 ? {bypassCollection2:true} : null;
      try {
        if (options.enableHooks || !collection.direct) {
          collection.insert(record, insertOptions);
        } else {
          collection.direct.insert(record, insertOptions);
        }
      } catch (e) {
        console.warn('[MindMeld] error while inserting ' + record._id + ' into ' + collectionName);
        console.warn(e);
      }
    });
  }

};

Meteor.startup(() => !(Meteor.settings.mindMeld && Meteor.settings.mindMeld.password) && console.warn('MindMeld: no password set at Meteor.settings.mindMeld.password'));
