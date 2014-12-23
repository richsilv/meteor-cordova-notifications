meteor-cordova-notifications
============================
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/richsilv/meteor-cordova-notifications?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Simple push notifications for Cordova apps built using Meteor.

## Why?

Push notifications are a widely used and extremely useful feature of native apps. However, although packages exist to help with device registration and notification presentation on the client side (Cordova) and coordination of calls to the notifications server on the server side (e.g. NPM), due to the separation of client and server code, setting these up still required some wiring to be done on the part of the developer.

In Meteor, the ability to drop Cordova-specific and server-specific code into the same package obviates the need for any heavy-lifting on the part of the developer, whilst the Accounts package provides the infrastructure necessary for storing notification ids by user.

The result is a plug-and-play notifications package which should be extremely straightforward to use.

**NOTE THAT AT PRESENT, ONLY ANDROID NOTIFICATIONS (VIA GCM) ARE IMPLEMENTED**

## How to use this Package

Firstly, set up a new Google API project and enable GCM using [these instructions](https://developer.android.com/google/gcm/gs.html) (you only need to follow the instructions from the start of  "Creating a Google API Project" to the end of "Obtaining an API Key").

Then, in a code block that will run on *both client and server*:

```javascript
var notificationClient = new NotificationClient(options)
```

### options

*__senderId__ (required)* - the Project Number of your Google API project (given at the top of the "Overview" page).

*__gcmAuthorization__ (required)* - the GCM API key you obtained by following the Android instructions linked above.  Note that this should **NOT** be visible to the client, so it's recommended to pull this from [Meteor.settings](https://docs.meteor.com/#/full/meteordeploy) or else a server-only collection in such a way that `null` or `undefined` will be passed on the the client side, but the correct code on the server side.

*__registeredCallback__ (optional)* - a function to call on the client once it registers a new *regid* in the database and is thus ready to accept push notifications.

*__messageHandler__ (optional)* - a function to override the default handler which is called on receipt of a new notification message.  It is called with three arguments: `payload`, which contains the data payload supplied to the notifications server, `foreground`, a boolean which indicates whether the application is currently running in the foreground, and `coldstart`, a boolean which indicates whether the notification has been fired because it has been tapped in the notifications tray.  The default handler behaviour is described below.

*__removeOnLogout__ (optional)* - this will instruct the server to remove a users regid on logout to ensure that their device does not receive notifications whilst they're logged out.  The regid will be added again if they log back in.

## API

Note that NotificationClient can only be used to send messages to users who have previously logged in to the app on a mobile device (via any means).

### NotificationClient.sendNotification(users, data) [SERVER ONLY]

Send a notification to the specified users.

*__users__* - can be an individual user object, an array of user objects, a cursor on the Meteor.users collection, or a single userId.

*__data__* - the payload to send in the notification.  In default usage, this would contain two properties:

* *title* - the title of the notifications message.
* *message* - the message body.

If the application is currently open in the foreground, a default UI alert box pops up with the supplied title and message.  If the application is not open in the foreground, a local notification is added to the notifications tray with the supplied title and message.

### Overriding the default behavior

The GCM protocol is actually much more flexible than this - an arbitrary object (up to 4kb) can be passed as the payload, whilst the client callback on receipt of notifications can be completeley customised by overriding the `messageHandler` callback (see above).  See `cordova-both.js` for the code behind the default behaviour.

Note that a `Cordova` object is added to the global namespace on the client side - this is necessary as the GCM server requires a function in global scope to be supplied as a callback.

## A Note about Schemas

In order to use this package along with the excellent [Collection2](https://github.com/aldeed/meteor-collection2), any Schema you set up for user docs will have to allow an optional `regid` field for GCM.

## Demo - [here](https://github.com/richsilv/cordova-notifications-demo)

## TODO

* Add Apple notifications.
* Allow user to choose alert/local-notification/none upon receipt of messages when the app is in the foreground/background.
