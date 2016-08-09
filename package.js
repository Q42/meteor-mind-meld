Package.describe({
  name: 'q42:mind-meld',
  version: '0.0.1',
  summary: 'Easily transfer collection data between Meteor instances.',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use('check');
  api.use('dburles:mongo-collection-instances@0.3.4');
  api.addFiles('mind-meld.js', 'server');
  api.export('MindMeld');
});
