
Meteor.methods({
  mm_export(collectionName, password) {
    check(collectionName, String);
    check(password, String);

    if (!Meteor.settings.mindmeld || !Meteor.settings.mindmeld.password)
      throw new Meteor.Error('no password set in Meteor.settings.mindmeld.password');

    if (password !== Meteor.settings.mindmeld.password)
      throw new Meteor.Error('incorrect export password');

    return MindMeld.export(collectionName);
  },

  mm_import(options) {
    check(options, {
      sourceUrl: String,
      sourcePassword: String,
      collections: [String],
      localPassword: String, // only if running from the client

      keepCurrentData: Match.Optional(Boolean),
      bypassCollection2: Match.Optional(Boolean), // enables https://github.com/aldeed/meteor-collection2#inserting-or-updating-bypassing-collection2-entirely
      enableHooks: Match.Optional(Boolean) // enables https://github.com/matb33/meteor-collection-hooks#direct-access-circumventing-hooks
    });

    if (!Meteor.settings.mindmeld || !Meteor.settings.mindmeld.allowImport)
      throw new Meteor.Error('import not allowed according to Meteor.settings.mindmeld.allowImport');

    if (!Meteor.settings.mindmeld.password)
      throw new Meteor.Error('no password set in Meteor.settings.mindmeld.password');

    if (options.localPassword !== Meteor.settings.mindmeld.password)
      throw new Meteor.Error('incorrect localPassword');

    MindMeld.import(options);
  }
});


MindMeld = {
  export(collectionName) {
    const collection = Mongo.Collection.get(collectionName);
    if (!collection || !(collection instanceof Mongo.Collection ))
      throw new Meteor.Error(collectionName + ' is not a valid collection');

    console.log("[MindMeld] dumping " + collectionName);
    return collection.find({}).fetch();
  },

  import(options) {
    const connection = DDP.connect(options.sourceUrl);
    options.collections.forEach( col => MindMeld.importCollection(connection, col, options) );
    console.log('[MindMeld] done!');
  },

  importCollection(connection, collectionName, options) {
    const collection = Mongo.Collection.get(collectionName);
    if (!collection instanceof Mongo.Collection)
      throw new Error(collectionName + ' is not a valid collection');

    const dump = connection.call("mm_export", collectionName, options.sourcePassword);
    if (!dump || !dump.length) {
      console.log('[MindMeld] nothing to import');
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
        options.enableHooks || !collection.direct ?
          collection.insert(record, insertOptions) :
          collection.direct.insert(record, insertOptions);
      } catch (e) {
        console.warn('[MindMeld] error while inserting ' + record._id + ' into ' + collectionName);
        console.warn(e);
      }
    });
  }

};

Meteor.startup(() => !(Meteor.settings.mindmeld && Meteor.settings.mindmeld.password) && console.warn('MindMeld: no token set'));
