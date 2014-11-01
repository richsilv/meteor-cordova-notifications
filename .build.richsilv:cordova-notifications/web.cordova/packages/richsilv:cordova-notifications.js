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
        Cordova.onNotificationGCM = options.onNotificationGCM || function(res) {                             // 21
            if (res.event === 'registered') {                                                                // 22
                if (res.regid) {                                                                             // 23
                    Meteor.call('cordova-notifications/updateRegid', res.regid, options.registeredCallback); // 24
                }                                                                                            // 25
            } else if (res.event === 'message') {                                                            // 26
                if (res.foreground) {                                                                        // 27
                    navigator.notification.alert(                                                            // 28
                        res.payload.message,                                                                 // 29
                        options.alertCallback,                                                               // 30
                        res.payload.title                                                                    // 31
                    );                                                                                       // 32
                } else if (res.payload) {                                                                    // 33
                    window.plugin.notification.local.add(                                                    // 34
                        _.extend(options.notificationOptions, {                                              // 35
                            message: res.payload.message,                                                    // 36
                            title: res.payload.title,                                                        // 37
                            autoCancel: true                                                                 // 38
                        })                                                                                   // 39
                    );                                                                                       // 40
                }                                                                                            // 41
            }                                                                                                // 42
        }                                                                                                    // 43
                                                                                                             // 44
        Tracker.autorun(function(c) {                                                                        // 45
                                                                                                             // 46
            if (Meteor.user()) {                                                                             // 47
                window.plugins.pushNotification.register(successHandler, errorHandler, {                     // 48
                    "senderID": options.senderId.toString(),                                                 // 49
                    "ecb": "Cordova.onNotificationGCM"                                                       // 50
                });                                                                                          // 51
                c.stop();                                                                                    // 52
            }                                                                                                // 53
        });                                                                                                  // 54
                                                                                                             // 55
        return instance                                                                                      // 56
                                                                                                             // 57
    }                                                                                                        // 58
                                                                                                             // 59
} else if (Meteor.isServer) {                                                                                // 60
                                                                                                             // 61
    NotificationClient = function(options) {                                                                 // 62
                                                                                                             // 63
        if (!options || !options.gcmAuthorization || !options.senderId) {                                    // 64
            return false;                                                                                    // 65
        }                                                                                                    // 66
                                                                                                             // 67
        var Future = Npm.require('fibers/future'),                                                           // 68
            instance = {};                                                                                   // 69
                                                                                                             // 70
        Cordova.sendNotifications = function(users, data) {                                                  // 71
                                                                                                             // 72
            if (typeof users === 'string')                                                                   // 73
                users = Meteor.users.find(users).fetch();                                                    // 74
            else if (typeof users === "object" && users._id)                                                 // 75
                users = [users];                                                                             // 76
            else if (users instanceof Mongo.Cursor)                                                          // 77
                users = users.fetch()                                                                        // 78
            else if (!users instanceof Array)                                                                // 79
                throw new Meteor.Error('bad_users_argument', 'Supplied user(s) data is not one of: user id, user object, cursor, array of user objects.');
                                                                                                             // 81
            var regids = _.without(                                                                          // 82
                    _.pluck(users, 'regid'),                                                                 // 83
                    undefined),                                                                              // 84
                payload = {                                                                                  // 85
                    registration_ids: regids,                                                                // 86
                    data: data                                                                               // 87
                },                                                                                           // 88
                headers = {                                                                                  // 89
                    'Content-Type': 'application/json',                                                      // 90
                    'Authorization': 'key=' + options.gcmAuthorization                                       // 91
                },                                                                                           // 92
                url = "https://android.googleapis.com/gcm/send",                                             // 93
                fut = new Future();                                                                          // 94
                                                                                                             // 95
            if (regids.length) {                                                                             // 96
                HTTP.post(url, {                                                                             // 97
                        headers: headers,                                                                    // 98
                        data: payload                                                                        // 99
                    },                                                                                       // 100
                    function(err, res) {                                                                     // 101
                        if (err) {                                                                           // 102
                            fut.throw(err);                                                                  // 103
                        } else {                                                                             // 104
                            fut.return({                                                                     // 105
                                response: res,                                                               // 106
                                userCount: regids.length                                                     // 107
                            });                                                                              // 108
                        }                                                                                    // 109
                    }                                                                                        // 110
                );                                                                                           // 111
            }                                                                                                // 112
                                                                                                             // 113
            return fut.wait();                                                                               // 114
                                                                                                             // 115
        };                                                                                                   // 116
                                                                                                             // 117
        Meteor.methods({                                                                                     // 118
            'cordova-notifications/updateRegid': function(regid) {                                           // 119
                Meteor.users.update(this.userId, {                                                           // 120
                    $set: {                                                                                  // 121
                        regid: regid                                                                         // 122
                    }                                                                                        // 123
                });                                                                                          // 124
            }                                                                                                // 125
        });                                                                                                  // 126
                                                                                                             // 127
        return instance;                                                                                     // 128
                                                                                                             // 129
    }                                                                                                        // 130
                                                                                                             // 131
} else {                                                                                                     // 132
                                                                                                             // 133
    NotificationClient = function() {};                                                                      // 134
                                                                                                             // 135
}                                                                                                            // 136
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);
