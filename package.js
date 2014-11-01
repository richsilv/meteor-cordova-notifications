Package.describe({
  name: 'richsilv:cordova-notifications',
  summary: ''
});

Cordova.depends({
  "de.appplant.cordova.plugin.local-notification" : "0.7.6",
  "com.phonegap.plugins.pushplugin" : "2.2.1",
  "org.apache.cordova.dialogs": "0.2.10"
});

Package.on_use(function(api) {

  api.use('tracker', 'web.cordova');
  api.use('http', 'server');
  api.use('accounts-base', 'client');

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