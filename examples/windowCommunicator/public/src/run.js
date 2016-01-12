$('button').click(function () {
    var subWindow = Backbone.Window.newWindow();

    subWindow.once('started', function () {
    	// Evaluate code
        subWindow.send(function (callback) {
        	// This code will be evaluate on the sub-window
        	callback(
        		$('[data-target="sentence"]').html() // Sentence
        	);
        }, function (sentence) {
            console.log('You just said : ', sentence);
            $('[data-target="here"]')
            	.css('color', 'black')
            	.html('Message : '+sentence);
        });
        console.log('Main windows is now communicating with the sub-window.');
    });

    subWindow.on('closed', function () {
        $('[data-target="here"]')
            .css('color', 'green')
            .html('The sub-window was closed');
    });

    subWindow.on('closeMe', function (time) {
        console.log('Sub-Window will be close in', time, 'milliseconds.');
        setTimeout(function () {
            subWindow.close();
        }, +time)
    });

    subWindow.on('failed', function () {
        console.log('Main windows is now communicating with the sub-window.');
    });

    subWindow.open('/popup.html', "_blank", "toolbar=no, scrollbars=no, resizable=no, top=500, left=500, width=400, height=400"); // = window.open
});
