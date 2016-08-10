MindMeld = {
  export(collectionName, password) {
    Meteor.call('mm_export', collectionName, password, function(err, res) {
      if (err) console.warn(err);
      console.log('[MindMeld] exporting', res);
    });
  },
  import(options) {
    Meteor.call('mm_import', options);
  }
}
