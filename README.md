meteor-cordova-notifications
============================

Simple push notifications for Cordova apps built using Meteor.

## Why?

Push notifications are a widely used and extremely useful feature of native apps. However, although packages exist to help with device registration and notification presentation on the client side (Cordova) and coordination calls to the notifications server (e.g. NPM), due to the separation of client and server code, setting these up still required some wiring to be done on the part of the developer.

In Meteor, the ability to drop Cordova-specific and server-specific code into the same package obviates the need for any heavy-lifting on the part of the developer, whilst the Accounts package provides the infrastructure necessary for storing notification ids by user.

The result is a plug-and-play notifications package which should be very straightforward to user.

**NOTE THAT AT PRESENT, ONLY ANDROID NOTIFICATIONS (VIA GCM) ARE IMPLEMENTED**

## How to use this Package

Firstly, set up a new Google API project and enable GCM using [these instructions](https://developer.android.com/google/gcm/gs.html) (you only need to follow the instructions from the start of  "Creating a Google API Project" to the end of "Obtaining an API Key").

Then, in a code block that will run on *both client and server*:

```javascript
var notificationClient = new NotificationClient(options)
```

### options

*__senderId__ (required)* - the Project Number of your Google API project (given at the top of the "Overview" page).
*__gcmAuthorization__ (required)* - the GCM API key you obtained by following the Android instructions linked above.
*__registeredCallback__ (optional)* - a function to call on the client once it registers a new *regid* in the database and is thus ready to accept push notifications.

## API

### NotificationClient.sendNotification(users, data) [SERVER ONLY]

Send a notification to the specified users.

*__users__* - can be an individual user object, an array of user objects, a cursor on the Meteor.users collection, or a single userId.
*__data__* - the payload to send in the notification.  In default usage, this would contain two properties:

* *title* - the title of the notifications message.
* *message* - the message body.

If the application is currently open in the foreground, a default UI alert box pops up with the supplied title and message.  If the application is not open in the foreground, a local notification is added to the notifications tray with the supplied title and message.

However, an arbitrary object (up to 4kb) can be passed, which can be used as the user sees fit by customising the `onNotificationGCM` callback.

At the moment the returned object is empty, but methods may be added in future.

Calling `NotificationClient` will, however, add a `Cordova` object to the global namespace - this is necessary as GCM requires a handler callback which is within global scope.
