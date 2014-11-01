Cordova = {};

if (Meteor.isCordova) {

    NotificationClient = function(options) {

        if (!options || !options.gcmAuthorization || !options.senderId) {
            throw new Meteor.Error('required_options', 'gcmAuthorization and senderId must be supplied as options as a minimum');
        }

        var instance = {};

        var successHandler = options.successHandler || function(data) {
            console.log("Success: " + JSON.stringify(data));
        };

        var errorHandler = options.errorHandler || function(e) {
            console.log("Error " + e);
        };

        Cordova.onNotificationGCM = options.onNotificationGCM || function(res) {
            if (res.event === 'registered') {
                if (res.regid) {
                    Meteor.call('cordova-notifications/updateRegid', res.regid, options.registeredCallback);
                }
            } else if (res.event === 'message') {
                if (res.foreground) {
                    navigator.notification.alert(
                        res.payload.message,
                        options.alertCallback,
                        res.payload.title
                    );
                } else if (res.payload) {
                    window.plugin.notification.local.add(
                        _.extend(options.notificationOptions, {
                            message: res.payload.message,
                            title: res.payload.title,
                            autoCancel: true
                        })
                    );
                }
            }
        }

        Tracker.autorun(function(c) {

            if (Meteor.user()) {
                window.plugins.pushNotification.register(successHandler, errorHandler, {
                    "senderID": options.senderId.toString(),
                    "ecb": "Cordova.onNotificationGCM"
                });
                c.stop();
            }
        });

        return instance

    }

} else if (Meteor.isServer) {

    NotificationClient = function(options) {

        if (!options || !options.gcmAuthorization || !options.senderId) {
            return false;
        }

        var Future = Npm.require('fibers/future'),
            instance = {};

        Cordova.sendNotifications = function(users, data) {

            if (typeof users === 'string')
                users = Meteor.users.find(users).fetch();
            else if (typeof users === "object" && users._id)
                users = [users];
            else if (users instanceof Mongo.Cursor)
                users = users.fetch()
            else if (!users instanceof Array)
                throw new Meteor.Error('bad_users_argument', 'Supplied user(s) data is not one of: user id, user object, cursor, array of user objects.');

            var regids = _.without(
                    _.pluck(users, 'regid'),
                    undefined),
                payload = {
                    registration_ids: regids,
                    data: data
                },
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'key=' + options.gcmAuthorization
                },
                url = "https://android.googleapis.com/gcm/send",
                fut = new Future();

            if (regids.length) {
                HTTP.post(url, {
                        headers: headers,
                        data: payload
                    },
                    function(err, res) {
                        if (err) {
                            fut.throw(err);
                        } else {
                            fut.return({
                                response: res,
                                userCount: regids.length
                            });
                        }
                    }
                );
            }

            return fut.wait();

        };

        Meteor.methods({
            'cordova-notifications/updateRegid': function(regid) {
                Meteor.users.update(this.userId, {
                    $set: {
                        regid: regid
                    }
                });
            }
        });

        return instance;

    }

} else {

    NotificationClient = function() {};

}