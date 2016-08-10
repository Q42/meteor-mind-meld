Package.describe({
  name: 'q42:mind-meld',
  version: '1.0.1',
  summary: 'Easily transfer collection data between Meteor instances.',
  git: 'https://github.com/Q42/meteor-mind-meld',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use('check');
  api.use('dburles:mongo-collection-instances@0.3.4');
  api.addFiles('mind-meld-server.js', 'server');
  api.addFiles('mind-meld-client.js', 'client');
  api.export('MindMeld');
});
