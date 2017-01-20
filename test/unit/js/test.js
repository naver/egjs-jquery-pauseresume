/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/
import '../../../src/index.js';

// jscs:disable
// to resolve transform style value
QUnit.config.reorder = false;

function initializeElement() {
	var sheet = document.createElement('style')
	sheet.innerHTML = `
	.box {
		width:120px;
		height:120px;
		position:absolute;
		border:solid;
		padding: 0px 0px;
		color:blue;
	}
	.otherStyleBox {
		position:absolute;
		border:solid 1px;
		left:50px;
		height:50px;`;

	document.body.appendChild(sheet);

	sandbox({
		id: "box1",
		class: "box",
		style: 'width:120px;height:120px;position:absolute;border:solid;padding: 0px 0px; left:0px'
	});
}

var hooks = {
	before: function(){
		initializeElement();
	},
	beforeEach: function() {
		this.$el = $("#box1");
		delete this.$el[0].__aniProps;
	},
	afterEach: function() {
		this.$el.css({"left": 0});
	},
	after: function() {
		cleanup();
	}
};

QUnit.module("Initialization", hooks);

QUnit.test("stop on non-animated element", function(assert) {
	// Given
	// When
	this.$el.stop();

	// Then
	assert.ok(true, "stop() is called successfully without script errors.");
});

QUnit.test("stop on animated element", function(assert) {
	var done = assert.async();
	var duration = 3000;
	var stopTime = 500;

	// Given
	this.$el
		.animate({"left": "100px"}, duration)

	// When
	setTimeout(() => {
		// Call stop
		this.$el.stop();

		//Then
		assert.ok(true, "stop called successfully");
		done();
	}, stopTime);
});

QUnit.test("pause", function(assert) {
	var done = assert.async();

	// Given
	var destLeft = 200;
	var duration = 1000;
	var prevLeft;
	this.$el.animate({"left": destLeft}, duration, "linear");

	// When
	setTimeout(() => {
		this.$el.stop();

		prevLeft = parseFloat(this.$el.css("left"));
	}, duration / 2);

	//Then
	setTimeout(() => {
		assert.equal(prevLeft, parseFloat(this.$el.css("left")), "It is not moved after paused.");
		//if status is paused, fx-queue will be "inprogress".
		this.$el.stop();
		done();
	}, duration);
});

QUnit.test("resume", function(assert) {
	var done = assert.async();

	// Given
	var destLeft = 200;
	var duration = 400;
	var pauseAfter = duration / 2;
	var pauseDuration = duration / 2;
	this.$el.animate({"left": destLeft}, duration);

	// When
	setTimeout(() => {
		this.$el.pause();
	}, pauseAfter);

	setTimeout(() => {
		this.$el.resume();
	}, pauseDuration);

	//Then
	setTimeout(() => {
		assert.equal(parseFloat(this.$el.css("left")), destLeft, "The box is moved to destination after resumed.");
		done();
	}, duration + pauseDuration);
});

QUnit.test("chaining", function(assert) {
	var done = assert.async();

	// Given
	var destLeft = [200, 400, 600];
	var duration = 300;
	var totalDuration = duration * 3;
	var pauseAfter = 100;
	var pauseDuration = 100;

	this.$el
		.animate({"left": destLeft[0]}, duration)
		.animate({"left": destLeft[1]}, duration)
		.animate({"left": destLeft[2]}, duration)

	// When
	setTimeout(() => {
		this.$el.pause();
	}, pauseAfter);

	setTimeout(() => {
		this.$el.resume();
	}, pauseDuration);

	//Then
	setTimeout(() => {
		assert.equal(parseFloat(this.$el.css("left")), destLeft[2], "The box is moved to destination after resumed.");
		done();
	}, totalDuration + pauseDuration);
});

QUnit.test("relative values", function(assert) {
	var done = assert.async();

	// Given
	var destLeft = ["+=100", "+=100", "+=100"];
	var duration = 300;
	var totalDuration = duration * 3;
	var pauseAfter = 100;
	var pauseDuration = 100;

	this.$el
		.animate({"left": destLeft[0]}, duration)
		.animate({"left": destLeft[1]}, duration)
		.animate({"left": destLeft[2]}, duration)

	// When
	setTimeout(() => {
		this.$el.pause();
		setTimeout(() => {
			this.$el.resume();
		}, pauseDuration);
	}, pauseAfter);

	//Then
	setTimeout(() => {
		assert.equal(parseFloat(this.$el.css("left")), 300, "The box is moved to destination after resumed.");
		done();
	}, totalDuration + pauseAfter + pauseDuration);
});

QUnit.test("external css style and relative value test", function(assert) {
	var done = assert.async();
	var pauseAfter = 100;
	var pauseDuration = 10;

	// Given
	// Check if 'before value' is obtained well when applied relative value.
	this.$el
		.removeAttr("style")
		.removeClass("box")
		.addClass("otherStyleBox")
		.animate({"left": "+=100px"}) //'.otherStyleBox' style defines initial value of 'left' as 50px, so this animate must make 150px left.
		.animate({"width": "+=100px", "height": "+=50px"}) // width is undefined

	// When
	setTimeout(() => {
		this.$el.pause();

		setTimeout(() => {
			this.$el.resume();
		}, pauseDuration);
	}, pauseAfter);

	//Then
	setTimeout(() => {
		assert.equal(parseInt(this.$el.css("left")), 150, "Relative movements on CSS styled element is resumed correctly.");
		assert.equal(this.$el.width(), 100, "Relative sizing width on CSS styled element is resumed correctly.");
		assert.equal(this.$el.height(), 100, "Relative sizing height on CSS styled element is resumed correctly.")

		this.$el.removeClass("otherStyleBox").addClass("box");
		done();
	}, 1000);
});

QUnit.test("paused filter test", function(assert) {
	var done = assert.async();
	var duration = 1000;
	var pauseAfter = duration / 2;
	var pauseDuration = 10;
	var margin = 100;
	var pauseCount1 = 0;
	var pauseCount2 = 0;

	// Given
	this.$el
		.animate({"left": "100px"}, duration)

	// When
	setTimeout(() => {
		this.$el.pause();

		pauseCount1 = $("#box1:paused").length;

		setTimeout(() => {
			this.$el.resume();

			pauseCount2 = $("#box1:paused").length;
		}, pauseDuration);
	}, pauseAfter);

	//Then
	setTimeout(() => {
		assert.equal(pauseCount1, 1, "Getting paused element by paused filter. Must be 1");
		assert.equal(pauseCount2, 0, "Getting resumed element by paused filter. Must be none");

		done();
	}, duration + pauseDuration + margin);
});

QUnit.test("Test relative movent after a value changes on animate chaining", function(assert) {
	var done = assert.async();
	var duration = 1000;
	var pauseAfter = duration / 2;
	var pauseDuration = 10;

	// Given
	this.$el
		.animate({"left": "100px"}, duration, function() {
			/**
			 * This makes an changes.
			 */
			$.style(this, "left", 0);
		})
		.animate({"left": "+=100px"});//MUST move left value based on 0.

	// When
	setTimeout(() => {
		this.$el.pause();

		setTimeout(() => {
			this.$el.resume();
		}, pauseDuration);
	}, pauseAfter);

	//Then
	setTimeout(() => {
		assert.equal(parseFloat(this.$el.css("left")), 100);
		done();
	}, 2000);
});

QUnit.test("Delay pause/resume test", function(assert) {
	var done = assert.async();
	var duration = 400;
	var delayDuration = 500;
	var pauseAfter = duration + delayDuration / 2;
	var pauseDuration = 1000;
	var elapsedT1 = 0;
	var prevTime = $.now();
	var totalDuration = duration + delayDuration + pauseDuration + duration;

	// Given
	this.$el
		.animate({"left": "100px"}, duration)
		.delay(delayDuration)
		.animate({"left": "150px"}, duration)
		.promise().done(function() {
			elapsedT1 = $.now() - prevTime;
		});

	// When
	// Pause while delay is inprogress.
	setTimeout(() => {
		this.$el.pause();

		setTimeout(() => {
			this.$el.resume();
		}, pauseDuration);
	}, pauseAfter);

	//Then
	setTimeout(() => {
		assert.ok(elapsedT1 > totalDuration, "delay was successfully paused and resumed.");
		done();
	}, totalDuration + totalDuration * 0.2);
});

QUnit.test("delay on non-animated element test", function(assert) {
	var done = assert.async();
	var t1 = new Date().getTime();
	// Given
	// When
	this.$el.delay(1000).queue(function(next) {
		var t2 = new Date().getTime();
		// Then
		assert.ok((t2-t1) >= 1000, "delay() successfully");
		done();

		//MUST call next() to dequeue the next item. otherwise next item will not be dequeue automatically.
		next();
	});
});
