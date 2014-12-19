(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// packages/richsilv:cordova-notifications/cordova-both.js                                                     //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
Cordova = {};                                                                                                  // 1
                                                                                                               // 2
if (Meteor.isCordova) {                                                                                        // 3
                                                                                                               // 4
    NotificationClient = function(options) {                                                                   // 5
                                                                                                               // 6
        if (!options || !options.senderId) {                                                                   // 7
            throw new Meteor.Error('required_options', 'senderId must be supplied as an option as a minimum'); // 8
        }                                                                                                      // 9
                                                                                                               // 10
        var instance = {};                                                                                     // 11
                                                                                                               // 12
        var successHandler = options.successHandler || function(data) {                                        // 13
            console.log("Success: " + JSON.stringify(data));                                                   // 14
        };                                                                                                     // 15
                                                                                                               // 16
        var errorHandler = options.errorHandler || function(e) {                                               // 17
            console.log("Error " + e);                                                                         // 18
        };                                                                                                     // 19
                                                                                                               // 20
        var messageHandler = options.messageHandler || function(payload, foreground, coldstart) {              // 21
            if (!payload) return null;                                                                         // 22
            if (foreground && !coldstart) {                                                                    // 23
                navigator.notification.alert(                                                                  // 24
                    payload.message,                                                                           // 25
                    options.alertCallback,                                                                     // 26
                    payload.title                                                                              // 27
                );                                                                                             // 28
            } else {                                                                                           // 29
                window.plugin.notification.local.add(                                                          // 30
                    _.extend(options.notificationOptions, {                                                    // 31
                        message: payload.message,                                                              // 32
                        title: payload.title,                                                                  // 33
                        autoCancel: true                                                                       // 34
                    })                                                                                         // 35
                );                                                                                             // 36
            }                                                                                                  // 37
        };                                                                                                     // 38
                                                                                                               // 39
        Cordova.onNotificationGCM = options.onNotificationGCM || function(res) {                               // 40
            if (res.event === 'registered') {                                                                  // 41
                if (res.regid) {                                                                               // 42
                    Meteor.call('cordova-notifications/updateRegid', res.regid, options.registeredCallback);   // 43
                }                                                                                              // 44
            } else if (res.event === 'message') {                                                              // 45
                messageHandler(res.payload, res.foreground, res.coldstart);                                    // 46
            }                                                                                                  // 47
        }                                                                                                      // 48
                                                                                                               // 49
        Tracker.autorun(function(c) {                                                                          // 50
                                                                                                               // 51
            if (Meteor.user()) {                                                                               // 52
                if (device.platform.toLowerCase() === 'android') {                                             // 53
                    window.plugins.pushNotification.register(successHandler, errorHandler, {                   // 54
                        "senderID": options.senderId.toString(),                                               // 55
                        "ecb": "Cordova.onNotificationGCM"                                                     // 56
                    });                                                                                        // 57
                } else {                                                                                       // 58
                    // TODO: APN HANDLER REGISTRATION HERE                                                     // 59
                }                                                                                              // 60
                c.stop();                                                                                      // 61
            }                                                                                                  // 62
        });                                                                                                    // 63
                                                                                                               // 64
        return instance                                                                                        // 65
                                                                                                               // 66
    }                                                                                                          // 67
                                                                                                               // 68
} else if (Meteor.isServer) {                                                                                  // 69
                                                                                                               // 70
    NotificationClient = function(options) {                                                                   // 71
                                                                                                               // 72
        if (!options || !options.gcmAuthorization || !options.senderId) {                                      // 73
            return false;                                                                                      // 74
        }                                                                                                      // 75
                                                                                                               // 76
        var Future = Npm.require('fibers/future'),                                                             // 77
            instance = {};                                                                                     // 78
                                                                                                               // 79
        instance.sendNotification = function(users, data) {                                                    // 80
                                                                                                               // 81
            if (typeof users === 'string')                                                                     // 82
                users = Meteor.users.find(users).fetch();                                                      // 83
            else if (typeof users === "object" && users._id)                                                   // 84
                users = [users];                                                                               // 85
            else if (users instanceof Mongo.Cursor)                                                            // 86
                users = users.fetch()                                                                          // 87
            else if (!users instanceof Array)                                                                  // 88
                throw new Meteor.Error('bad_users_argument', 'Supplied user(s) data is not one of: user id, user object, cursor, array of user objects.');
                                                                                                               // 90
            var regids = _.without(                                                                            // 91
                    _.pluck(users, 'regid'),                                                                   // 92
                    undefined),                                                                                // 93
                payload = {                                                                                    // 94
                    registration_ids: regids,                                                                  // 95
                    data: data                                                                                 // 96
                },                                                                                             // 97
                headers = {                                                                                    // 98
                    'Content-Type': 'application/json',                                                        // 99
                    'Authorization': 'key=' + options.gcmAuthorization                                         // 100
                },                                                                                             // 101
                url = "https://android.googleapis.com/gcm/send",                                               // 102
                fut = new Future();                                                                            // 103
                                                                                                               // 104
            if (regids.length) {                                                                               // 105
                HTTP.post(url, {                                                                               // 106
                        headers: headers,                                                                      // 107
                        data: payload                                                                          // 108
                    },                                                                                         // 109
                    function(err, res) {                                                                       // 110
                        if (err) {                                                                             // 111
                            fut.throw(err);                                                                    // 112
                        } else {                                                                               // 113
                            fut.return({                                                                       // 114
                                response: res,                                                                 // 115
                                userCount: regids.length                                                       // 116
                            });                                                                                // 117
                        }                                                                                      // 118
                    }                                                                                          // 119
                );                                                                                             // 120
            } else {                                                                                           // 121
                fut.return(null);                                                                              // 122
            }                                                                                                  // 123
                                                                                                               // 124
            return fut.wait();                                                                                 // 125
                                                                                                               // 126
        };                                                                                                     // 127
                                                                                                               // 128
        Meteor.methods({                                                                                       // 129
            'cordova-notifications/updateRegid': function(regid) {                                             // 130
                Meteor.users.update(this.userId, {                                                             // 131
                    $set: {                                                                                    // 132
                        regid: regid                                                                           // 133
                    }                                                                                          // 134
                });                                                                                            // 135
            }                                                                                                  // 136
        });                                                                                                    // 137
                                                                                                               // 138
        return instance;                                                                                       // 139
                                                                                                               // 140
    }                                                                                                          // 141
                                                                                                               // 142
} else {                                                                                                       // 143
                                                                                                               // 144
    NotificationClient = function() {};                                                                        // 145
                                                                                                               // 146
}                                                                                                              // 147
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);
