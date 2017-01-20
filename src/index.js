import { AniProperty } from './AniProperty.js';

export default (function($) {
	"use strict";

	var animateFn = $.fn.animate;
	var stopFn = $.fn.stop;
	var delayFn = $.fn.delay;

	function addAniProperty(type, el, prop, optall) {
		var newProp;

		newProp = new AniProperty(type, el, prop, optall);
		el.__aniProps = el.__aniProps || [];

		//Animation is excuted immediately.
		if (el.__aniProps.length === 0) {
			newProp.init();
		}
		el.__aniProps.push(newProp);
	}

	function removeAniProperty(el) {
		var removeProp = el.__aniProps.shift();
		removeProp && removeProp.clearEasingFn();

		el.__aniProps[0] && el.__aniProps[0].init();
	}

	$.fn.animate = function(prop, speed, easing, callback) {
		return this.each(function() {
			//optall should be made for each elements.
			var optall = $.speed(speed, easing, callback);

			// prepare next animation when current animation completed.
			optall.complete = function() {
				prepareNextAniProp(this);
			};

			//Queue animation property to recover the current animation.
			addAniProperty("animate", this, prop, optall);
			animateFn.call($(this), prop, optall);
		});

		// TODO: Below code is more reasonable?
		// return animateFn.call(this, prop, optall); // and declare optall at outside this.each loop.
	};

	// Check if this element can be paused/resume.
	function getStatus(el) {
		if (!el.__aniProps || el.__aniProps.length === 0) {
			// Current element doesn't have animation information.
			// Check 'animate' is applied to this element.
			return "empty";
		}

		return el.__aniProps[0].paused ? "paused" : "inprogress";
	}

	/**
	 * Set a timer to delay execution of subsequent items in the queue.
	 * And it internally manages "fx"queue to support pause/resume if "fx" type.
	 *
	 * @param {Number} An integer indicating the number of milliseconds to delay execution of the next item in the queue.
	 * @param {String} A string containing the name of the queue. Defaults to fx, the standard effects queue.
	 */
	$.fn.delay = function(time, type) {
		var t;
		var isCallByResume = arguments[2];//internal used value.

		if (type && type !== "fx") {
			return delayFn.call(this, time, type);
		}

		t = parseInt(time, 10);
		t = isNaN(t) ? 0 : t;

		return this.each(function() {
			if (!isCallByResume) {
				// Queue delay property to recover the current animation.
				// Don't add property when delay is called by resume.
				addAniProperty("delay", this, null, {duration: t});
			}

			var self = this;
			delayFn.call($(this), time).queue(function(next) {
				next();

				// Remove delay property when delay has been expired.
				removeAniProperty(self);
			});
		});
	};

	/**
	 * Pauses the animation executed through a call to the jQuery <a href=http://api.jquery.com/animate/>.animate()</a> method.
	 * @ko jQuery의<a href=http://api.jquery.com/animate/>animate() 메서드</a>가 실행한 애니메이션을 일시 정지한다
	 *
	 * @name jQuery#pause
	 * @method
	 * @support {"ie": "10+", "ch" : "latest", "sf" : "latest", "edge" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
	 * @example
	 * $("#box").pause(); //paused the current animation
	 */
	$.fn.pause = function() {
		return this.each(function() {
			var p;
			var type = "fx";

			if (getStatus(this) !== "inprogress") {
				return;
			}

			//Clear fx-queue except 1 dummy function
			//for promise not to be expired when calling stop()
			$.queue(this, type || "fx", [$.noop]);
			stopFn.call($(this));

			//Remember current animation property
			if (p = this.__aniProps[0]) {
				p.elapsed += $.now() - p.start;

				// Complement native timer's inaccuracy (complete timer can be different from your request.)
				// (eg. your request:400ms -> real :396 ~ 415 ms ))
				if (p.elapsed >= p.opt.duration) {
					p = prepareNextAniProp(this);
				}

				p && (p.paused = true);
			}
		});
	};

	function prepareNextAniProp(el) {
		var removeProp;
		var userCallback;

		// Dequeue animation property that was ended.
		removeProp = el.__aniProps.shift();
		removeProp.clearEasingFn();
		userCallback = removeProp.opt.old;

		// Callback should be called before aniProps.init()
		if (userCallback && typeof userCallback === "function") {
			userCallback.call(el);
		}

		// If next ani property exists
		el.__aniProps[0] && el.__aniProps[0].init();
		return el.__aniProps[0];
	}

	/**
	 * Resumes the animation paused through a call to the pause() method.
	 * @ko pause() 메서드가 일시 정지한 애니메이션을 다시 실행한다
	 *
	 * @name jQuery#resume
	 * @method
	 * @support {"ie": "10+", "ch" : "latest", "sf" : "latest", "edge" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
	 * @example
	 * $("#box").resume(); //resume the paused animation
	 */
	$.fn.resume = function() {
		return this.each(function() {
			var type = "fx";
			var p;
			var i;

			if (getStatus(this) !== "paused") {
				return;
			}

			//Clear fx-queue,
			//And this queue will be initialized by animate call.
			$.queue(this, type || "fx", []);

			// Restore __aniProps
			i = 0;
			while (p = this.__aniProps[i]) {
				// Restore easing status
				if (p.elapsed > 0 && p.opt.easing) {
					var resumePercent = p.elapsed / p.opt.duration;
					var remainPercent = 1 - resumePercent;
					var originalEasing = $.easing[p.opt.easing];
					var startEasingValue = originalEasing(resumePercent);
					var scale = scaler([startEasingValue, 1], [0, 1]);
					var newEasingName = p.opt.easing + "_" + p.uuid;

					// Make new easing function that continues from pause point.
					$.easing[newEasingName] = generateNewEasingFunc(
						resumePercent, remainPercent, scale, originalEasing);
					p.opt.easing = newEasingName;

					//Store new easing function to clear it later.
					p.addEasingFn(newEasingName);
				}

				p.paused = false;
				p.opt.duration -= p.elapsed;

				// If duration remains, request 'animate' with storing aniProps
				if (p.opt.duration > 0 || p.elapsed === 0) {
					i === 0 && p.init();

					if (p.type === "delay") {
						// pass last parameter 'true' not to add an aniProperty.
						$(this).delay(p.opt.duration, "fx", true);
					} else {
						animateFn.call($(this), p.prop, p.opt);
					}
				}

				i++;
			}
		});
	};

	/**
	 * Generate a new easing function.
	 *
	 * function to avoid JS Hint error "Don't make functions within a loop"
	 */
	function generateNewEasingFunc(resumePercent, remainPercent, scale, originalEasing) {
		return function easingFunc(percent) {
			var newPercent = resumePercent + remainPercent * percent;
			return scale(originalEasing(newPercent));
		};
	}

	$.fn.stop = function(type, clearQueue) {
		var clearQ = clearQueue;
		stopFn.apply(this, arguments);

		if (typeof type !== "string") {
			clearQ = type;
		}

		return this.each(function() {
			var p;

			// When this element was not animated properly, do nothing.
			if (getStatus(this) === "empty") {
				return;
			}

			if (!clearQ) {
				p = this.__aniProps.shift();
				p && p.clearEasingFn();
			} else {
				//If clearQueue is requested,
				//then all properties must be initialized
				//for element not to be resumed.
				while (p = this.__aniProps.shift()) {
					p.clearEasingFn();
				}
				this.__aniProps = [];
			}
		});
	};

	$.expr.filters.paused = function(elem) {
		return getStatus(elem) === "paused";
	};

	//Adopt linear scale from d3
	function scaler(domain, range) {
		var u = uninterpolateNumber(domain[0], domain[1]);
		var i = interpolateNumber(range[0], range[1]);

		return function(x) {
			return i(u(x));
		};
	}

	function interpolateNumber(a, b) {
		a = +a, b = +b;
		return function(t) {
			return a * (1 - t) + b * t;
		};
	}

	function uninterpolateNumber(a, b) {
		b = (b -= a = +a) || 1 / b;
		return function(x) {
			return (x - a) / b;
		};
	}
})(jQuery);
