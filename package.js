Package.describe({
  name: 'richsilv:cordova-notifications',
  summary: 'Simple push notifications for Cordova apps built using Meteor.',
  git: 'https://github.com/richsilv/meteor-cordova-notifications',
  version: "0.1.1"
});

Cordova.depends({
  "de.appplant.cordova.plugin.local-notification" : "0.7.6",
  "com.phonegap.plugins.pushplugin" : "2.2.1",
  "org.apache.cordova.dialogs": "0.2.10"
});

Package.on_use(function(api) {

  api.use('tracker@1.0.3', 'web.cordova');
  api.use('http@1.0.8', 'server');
  api.use('accounts-base@1.1.2', 'client');

  api.add_files('cordova-both.js');
  api.add_files('cordova-server.js', 'server')

  api.export('NotificationClient');
  api.export('Cordova');

});

Package.on_test(function(api) {
  api.use('richsilv:cordova-notifications');
  api.use('tinytest');

  api.add_files('richsilv:cordova-notifications_tests.js');
});