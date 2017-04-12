/**
 * Copyright (c) NAVER Corp.
 */

//pause / resume by mouse over/out events.
window.onload = function() {
	var $rectBox = $("#rectBox");

	$rectBox.hover(function() {
		$(this).pause();
	}, function() {
		$(this).resume();
	});

	// Animate element infinitely
	function drawRectangle() {
		$rectBox
			.animate({"opacity": 0.5}, 1000)
			.animate({"left":"+=200px"}, 1000, "easeOutElastic")//relative value
			.animate({"top":"200px"}, 1000, "easeOutElastic")//absolute value
			.animate({"left":"0px"}, 1000, "easeOutElastic")
			.animate({"top":"-=200px"}, 1000, "easeOutElastic")
			.animate({"opacity": "+=0.5"}, 1000, drawRectangle);
	}

	drawRectangle();
}
