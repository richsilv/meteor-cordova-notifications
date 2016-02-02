Package.describe({
  name: 'richsilv:cordova-notifications',
  summary: 'Simple push notifications for Cordova apps built using Meteor.',
  git: 'https://github.com/richsilv/meteor-cordova-notifications',
  version: "0.2.0"
});

Cordova.depends({
  "de.appplant.cordova.plugin.local-notification" : "0.8.4",
  "com.phonegap.plugins.pushplugin" : "https://github.com/phonegap-build/PushPlugin.git#894232cd239130435ed8a21b3a321422b19aaa73",
  "org.apache.cordova.dialogs": "0.2.10"
});

Package.on_use(function(api) {

  api.use('tracker@1.0.3', 'web.cordova');
  api.use('http@1.0.8', 'server');
  api.use('accounts-base@1.1.2', 'client');
  api.use('mizzao:user-status@0.6.3', 'server');

  api.add_files('cordova-both.js');

  api.export('NotificationClient');
  api.export('Cordova');

});

Package.on_test(function(api) {
  api.use('richsilv:cordova-notifications');
  api.use('tinytest');

  api.add_files('richsilv:cordova-notifications_tests.js');
});
