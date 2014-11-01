Meteor.methods('cordova-notifications/updateRegid', function(regid) {
	Meteor.users.update(this.userId, {
		$set: {
			regid: regid
		}
	});
});