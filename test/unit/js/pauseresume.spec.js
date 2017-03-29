/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/
import "../../../src/pauseresume.js";

function initializeElement() {
	const sheet = document.createElement("style");

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
		style: "width:120px;height:120px;position:absolute;border:solid;padding: 0px 0px; left:0px",
	});
}

describe("Initialize Test", function() {
	let $el;

	before(() => {
		initializeElement();
	});

	beforeEach(() => {
		$el = $("#box1");
		delete $el[0].__aniProps;
	});

	afterEach(() => {
		$el.css({"left": 0});
	});

	after(() => {
		cleanup();
	});

	it("should stop on non-animated element", function() {
		// Given
		// When
		$el.stop();

	// Then
		assert.isOk(true, "stop() is called successfully without script errors.");
	});

	it("should stop on animated element", function(done) {
		const duration = 3000;
		const stopTime = 500;

		// Given
		$el.animate({"left": "100px"}, duration);

		// When
		setTimeout(() => {
			// Call stop
			$el.stop();

			// Then
			assert.isOk(true, "stop called successfully");
			done();
		}, stopTime);
	});

	it("should pause", function(done) {
		// Given
		const destLeft = 200;
		const duration = 1000;
		let prevLeft;

		$el.animate({"left": destLeft}, duration, "linear");

		// When
		setTimeout(() => {
			$el.stop();

			prevLeft = parseFloat($el.css("left"));
		}, duration / 2);

		// Then
		setTimeout(() => {
			assert.equal(parseFloat($el.css("left")), prevLeft, "It is not moved after paused.");
			// if status is paused, fx-queue will be "inprogress".
			$el.stop();
			done();
		}, duration);
	});

	it("should resume", function(done) {
		// Given
		const destLeft = 200;
		const duration = 400;
		const pauseAfter = duration / 2;
		const pauseDuration = duration / 2;

		$el.animate({"left": destLeft}, duration);

		// When
		setTimeout(() => {
			$el.pause();
		}, pauseAfter);

		setTimeout(() => {
			$el.resume();
		}, pauseDuration);

		// Then
		setTimeout(() => {
			assert.equal(parseFloat($el.css("left")), destLeft, "The box is moved to destination after resumed.");
			done();
		}, duration + pauseDuration);
	});

	it("should chaining", function(done) {
		// Given
		const destLeft = [200, 400, 600];
		const duration = 300;
		const totalDuration = duration * 3;
		const pauseAfter = 100;
		const pauseDuration = 100;

		$el
			.animate({"left": destLeft[0]}, duration)
			.animate({"left": destLeft[1]}, duration)
			.animate({"left": destLeft[2]}, duration);

		// When
		setTimeout(() => {
			$el.pause();
		}, pauseAfter);

		setTimeout(() => {
			$el.resume();
		}, pauseDuration);

		// Then
		setTimeout(() => {
			assert.equal(parseFloat($el.css("left")), destLeft[2], "The box is moved to destination after resumed.");
			done();
		}, totalDuration + pauseDuration);
	});

	it("relative values", function(done) {
		// Given
		const destLeft = ["+=100", "+=100", "+=100"];
		const duration = 300;
		const totalDuration = duration * 3;
		const pauseAfter = 100;
		const pauseDuration = 100;

		$el
			.animate({"left": destLeft[0]}, duration)
			.animate({"left": destLeft[1]}, duration)
			.animate({"left": destLeft[2]}, duration);

		// When
		setTimeout(() => {
			$el.pause();
			setTimeout(() => {
				$el.resume();
			}, pauseDuration);
		}, pauseAfter);

		// Then
		setTimeout(() => {
			assert.equal(parseFloat($el.css("left")), 300, "The box is moved to destination after resumed.");
			done();
		}, totalDuration + pauseAfter + pauseDuration);
	});

	it("external css style and relative value test", function(done) {
		const pauseAfter = 100;
		const pauseDuration = 10;

		// Given
		// Check if 'before value' is obtained well when applied relative value.
		$el
			.removeAttr("style")
			.removeClass("box")
			.addClass("otherStyleBox")
			.animate({"left": "+=100px"}) // '.otherStyleBox' style defines initial value of 'left' as 50px, so this animate must make 150px left.
			.animate({"width": "+=100px", "height": "+=50px"}); // width is undefined

		// When
		setTimeout(() => {
			$el.pause();

			setTimeout(() => {
				$el.resume();
			}, pauseDuration);
		}, pauseAfter);

		// Then
		setTimeout(() => {
			assert.equal(parseInt($el.css("left")), 150, "Relative movements on CSS styled element is resumed correctly.");
			assert.equal($el.width(), 100, "Relative sizing width on CSS styled element is resumed correctly.");
			assert.equal($el.height(), 100, "Relative sizing height on CSS styled element is resumed correctly.")

			$el.removeClass("otherStyleBox").addClass("box");
			done();
		}, 1000);
	});

	it("paused filter test", function(done) {
		const duration = 1000;
		const pauseAfter = duration / 2;
		const pauseDuration = 10;
		const margin = 100;
		let pauseCount1 = 0;
		let pauseCount2 = 0;

		// Given
		$el
			.animate({"left": "100px"}, duration);

		// When
		setTimeout(() => {
			$el.pause();

			pauseCount1 = $("#box1:paused").length;

			setTimeout(() => {
				$el.resume();

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

	it("Test relative movent after a value changes on animate chaining", function(done) {
		this.timeout(4000); // mocha timeout setting
		const duration = 1000;
		const pauseAfter = duration / 2;
		const pauseDuration = 10;

		// Given
		$el
			.animate({"left": "100px"}, duration, function() {
				/**
				 * This makes an changes.
				 */
				$.style(this, "left", 0);
			})
			.animate({"left": "+=100px"});// MUST move left value based on 0.

		// When
		setTimeout(() => {
			$el.pause();

			setTimeout(() => {
				$el.resume();
			}, pauseDuration);
		}, pauseAfter);

		// Then
		setTimeout(() => {
			assert.equal(parseFloat($el.css("left")), 100);
			done();
		}, 2000);
	});

	it("Delay pause/resume test", function(done) {
		this.timeout(4000); // mocha timeout setting
		const duration = 400;
		const delayDuration = 500;
		const pauseAfter = duration + delayDuration / 2;
		const pauseDuration = 1000;
		let elapsedT1 = 0;
		const prevTime = $.now();
		const totalDuration = duration + delayDuration + pauseDuration + duration;

		// Given
		$el
			.animate({"left": "100px"}, duration)
			.delay(delayDuration)
			.animate({"left": "150px"}, duration)
			.promise()
			.done(() => {
				elapsedT1 = $.now() - prevTime;
			});

		// When
		// Pause while delay is inprogress.
		setTimeout(() => {
			$el.pause();

			setTimeout(() => {
				$el.resume();
			}, pauseDuration);
		}, pauseAfter);

		//Then
		setTimeout(() => {
			assert.ok(elapsedT1 > totalDuration, "delay was successfully paused and resumed.");
			done();
		}, totalDuration + totalDuration * 0.2);
	});

	it("delay on non-animated element test", function(done) {
		const t1 = new Date().getTime();
		// Given
		// When
		$el.delay(1000).queue(function(next) {
			const t2 = new Date().getTime();
			// Then
			assert.ok((t2-t1) >= 1000, "delay() successfully");
			done();

			//MUST call next() to dequeue the next item. otherwise next item will not be dequeue automatically.
			next();
		});
	});
});
