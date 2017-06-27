$("#rectBox").hover(function() {
	$(this).pause();
}, function() {
	$(this).resume();
});

var $rectBox = $("#rectBox");
var easing = "linear"; // "easeOutElastic";

function drawRectangle() {
	$rectBox
		.animate({"opacity": 0.5}, 1000)
		.animate({"left": "+=200px"}, 1000, easing) // relative value
		.animate({"top": "200px"}, 1000, easing) // absolute value
		.animate({"left": "0px"}, 1000, easing)
		.animate({"top": "-=200px"}, 1000, easing)
		.animate({"opacity": "+=0.5"}, 1000, drawRectangle);
}

drawRectangle();
