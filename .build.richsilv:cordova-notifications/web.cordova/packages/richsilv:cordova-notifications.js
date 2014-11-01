(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/richsilv:cordova-notifications/cordova-both.js                                                   //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
Cordova = {};                                                                                                // 1
                                                                                                             // 2
if (Meteor.isCordova) {                                                                                      // 3
                                                                                                             // 4
    NotificationClient = function(options) {                                                                 // 5
                                                                                                             // 6
        if (!options || !options.gcmAuthorization || !options.senderId) {                                    // 7
            throw new Meteor.Error('required_options', 'gcmAuthorization and senderId must be supplied as options as a minimum');
        }                                                                                                    // 9
                                                                                                             // 10
        var instance = {};                                                                                   // 11
                                                                                                             // 12
        var successHandler = options.successHandler || function(data) {                                      // 13
            console.log("Success: " + JSON.stringify(data));                                                 // 14
        };                                                                                                   // 15
                                                                                                             // 16
        var errorHandler = options.errorHandler || function(e) {                                             // 17
            console.log("Error " + e);                                                                       // 18
        };                                                                                                   // 19
                                                                                                             // 20
        var messageHandler = options.messageHandler || function(payload, foreground) {                       // 21
            if (!payload) return null;                                                                       // 22
            if (foreground) {                                                                                // 23
                navigator.notification.alert(                                                                // 24
                    payload.message,                                                                         // 25
                    options.alertCallback,                                                                   // 26
                    payload.title                                                                            // 27
                );                                                                                           // 28
            } else {                                                                                         // 29
                window.plugin.notification.local.add(                                                        // 30
                    _.extend(options.notificationOptions, {                                                  // 31
                        message: payload.message,                                                            // 32
                        title: payload.title,                                                                // 33
                        autoCancel: true                                                                     // 34
                    })                                                                                       // 35
                );                                                                                           // 36
            }                                                                                                // 37
        };                                                                                                   // 38
                                                                                                             // 39
        Cordova.onNotificationGCM = options.onNotificationGCM || function(res) {                             // 40
            if (res.event === 'registered') {                                                                // 41
                if (res.regid) {                                                                             // 42
                    Meteor.call('cordova-notifications/updateRegid', res.regid, options.registeredCallback); // 43
                }                                                                                            // 44
            } else if (res.event === 'message') {                                                            // 45
                messageHandler(res.payload, res.foreground);                                                 // 46
            }                                                                                                // 47
        }                                                                                                    // 48
                                                                                                             // 49
        Tracker.autorun(function(c) {                                                                        // 50
                                                                                                             // 51
            if (Meteor.user()) {                                                                             // 52
                window.plugins.pushNotification.register(successHandler, errorHandler, {                     // 53
                    "senderID": options.senderId.toString(),                                                 // 54
                    "ecb": "Cordova.onNotificationGCM"                                                       // 55
                });                                                                                          // 56
                c.stop();                                                                                    // 57
            }                                                                                                // 58
        });                                                                                                  // 59
                                                                                                             // 60
        return instance                                                                                      // 61
                                                                                                             // 62
    }                                                                                                        // 63
                                                                                                             // 64
} else if (Meteor.isServer) {                                                                                // 65
                                                                                                             // 66
    NotificationClient = function(options) {                                                                 // 67
                                                                                                             // 68
        if (!options || !options.gcmAuthorization || !options.senderId) {                                    // 69
            return false;                                                                                    // 70
        }                                                                                                    // 71
                                                                                                             // 72
        var Future = Npm.require('fibers/future'),                                                           // 73
            instance = {};                                                                                   // 74
                                                                                                             // 75
        instance.sendNotification = function(users, data) {                                                  // 76
                                                                                                             // 77
            if (typeof users === 'string')                                                                   // 78
                users = Meteor.users.find(users).fetch();                                                    // 79
            else if (typeof users === "object" && users._id)                                                 // 80
                users = [users];                                                                             // 81
            else if (users instanceof Mongo.Cursor)                                                          // 82
                users = users.fetch()                                                                        // 83
            else if (!users instanceof Array)                                                                // 84
                throw new Meteor.Error('bad_users_argument', 'Supplied user(s) data is not one of: user id, user object, cursor, array of user objects.');
                                                                                                             // 86
            var regids = _.without(                                                                          // 87
                    _.pluck(users, 'regid'),                                                                 // 88
                    undefined),                                                                              // 89
                payload = {                                                                                  // 90
                    registration_ids: regids,                                                                // 91
                    data: data                                                                               // 92
                },                                                                                           // 93
                headers = {                                                                                  // 94
                    'Content-Type': 'application/json',                                                      // 95
                    'Authorization': 'key=' + options.gcmAuthorization                                       // 96
                },                                                                                           // 97
                url = "https://android.googleapis.com/gcm/send",                                             // 98
                fut = new Future();                                                                          // 99
                                                                                                             // 100
            if (regids.length) {                                                                             // 101
                HTTP.post(url, {                                                                             // 102
                        headers: headers,                                                                    // 103
                        data: payload                                                                        // 104
                    },                                                                                       // 105
                    function(err, res) {                                                                     // 106
                        if (err) {                                                                           // 107
                            fut.throw(err);                                                                  // 108
                        } else {                                                                             // 109
                            fut.return({                                                                     // 110
                                response: res,                                                               // 111
                                userCount: regids.length                                                     // 112
                            });                                                                              // 113
                        }                                                                                    // 114
                    }                                                                                        // 115
                );                                                                                           // 116
            }                                                                                                // 117
                                                                                                             // 118
            return fut.wait();                                                                               // 119
                                                                                                             // 120
        };                                                                                                   // 121
                                                                                                             // 122
        Meteor.methods({                                                                                     // 123
            'cordova-notifications/updateRegid': function(regid) {                                           // 124
                Meteor.users.update(this.userId, {                                                           // 125
                    $set: {                                                                                  // 126
                        regid: regid                                                                         // 127
                    }                                                                                        // 128
                });                                                                                          // 129
            }                                                                                                // 130
        });                                                                                                  // 131
                                                                                                             // 132
        return instance;                                                                                     // 133
                                                                                                             // 134
    }                                                                                                        // 135
                                                                                                             // 136
} else {                                                                                                     // 137
                                                                                                             // 138
    NotificationClient = function() {};                                                                      // 139
                                                                                                             // 140
}                                                                                                            // 141
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);
