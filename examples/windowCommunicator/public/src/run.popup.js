$(document).ready(function () {
	var mainWindow = Backbone.Window.newCommunicator();
	setTimeout(function () {
		console.log('sent');
		mainWindow.talk('closeMe', '2000');
	}, 4000);
	mainWindow.start();
});