import jQuery from "jquery";
import AniPropertyManager from "./AniPropertyManager";
import MathUtil from "./MathUtil";

/**
 * @namespace jQuery
 */
export default (function($) {
	const animateFn = $.fn.animate;
	const stopFn = $.fn.stop;
	const delayFn = $.fn.delay;

	/**
	 * Generate a new easing function.
	 *
	 * function to avoid JS Hint error "Don't make functions within a loop"
	 */
	function generateNewEasingFunc(resumePercent, remainPercent, scale, originalEasing) {
		return function easingFunc(percent) {
			const newPercent = resumePercent + remainPercent * percent;

			return scale(originalEasing(newPercent));
		};
	}

	$.fn.animate = function(prop, speed, easing, callback) {
		return this.each(function() {
			// optall should be made for each elements.
			const optall = $.speed(speed, easing, callback);

			// prepare next animation when current animation completed.
			optall.complete = function() {
				AniPropertyManager.prepareNextAniProp(this);
			};

			// Queue animation property to recover the current animation.
			AniPropertyManager.addAniProperty("animate", this, prop, optall);
			animateFn.call($(this), prop, optall);
		});

		// TODO: Below code is more reasonable?
		// return animateFn.call(this, prop, optall); // and declare optall at outside this.each loop.
	};

	/**
	 * Set a timer to delay execution of subsequent items in the queue.
	 * And it internally manages "fx"queue to support pause/resume if "fx" type.
	 *
	 * @param {Number} An integer indicating the number of milliseconds to delay execution of the next item in the queue.
	 * @param {String} A string containing the name of the queue. Defaults to fx, the standard effects queue.
	 */
	$.fn.delay = function(time, type, ...args) {
		let t;
		const isCallByResume = args[0]; // internal used value.

		if (type && type !== "fx") {
			return delayFn.call(this, time, type);
		}

		t = parseInt(time, 10);
		t = isNaN(t) ? 0 : t;

		return this.each(function() {
			if (!isCallByResume) {
				// Queue delay property to recover the current animation.
				// Don't add property when delay is called by resume.
				AniPropertyManager.addAniProperty("delay", this, null, {duration: t});
			}


			delayFn.call($(this), time).queue(next => {
				next();

				// Remove delay property when delay has been expired.
				AniPropertyManager.removeAniProperty(this);
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
			let p;

			if (AniPropertyManager.getStatus(this) !== "inprogress") {
				return;
			}
			// Clear fx-queue except 1 dummy function
			// for promise not to be expired when calling stop()
			$.queue(this, "fx", [$.noop]);
			stopFn.call($(this));

			// Remember current animation property
			p = this.__aniProps[0];
			if (p) {
				p.elapsed += $.now() - p.start;

				// Complement native timer's inaccuracy (complete timer can be different from your request.)
				// (eg. your request:400ms -> real :396 ~ 415 ms ))
				if (p.elapsed >= p.opt.duration) {
					p = AniPropertyManager.prepareNextAniProp(this);
				}

				p && (p.paused = true);
			}
		});
	};

	/**
	 * Resumes the animation paused through a call to the pause() method.
	 * @ko pause() 메서드가 일시 정지한 애니메이션을 다시 실행한다
	 *
	 * @name jQuery#resume
	 * @alias eg.Pause
	 * @method
	 * @support {"ie": "10+", "ch" : "latest", "sf" : "latest", "edge" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
	 * @example
	 * $("#box").resume(); //resume the paused animation
	 */
	$.fn.resume = function() {
		return this.each(function() {
			const type = "fx";
			let p;
			let i;

			if (AniPropertyManager.getStatus(this) !== "paused") {
				return;
			}

			// Clear fx-queue,
			// And this queue will be initialized by animate call.
			$.queue(this, type || "fx", []);

			// Restore __aniProps
			i = 0;
			p = this.__aniProps[i];

			while (p) {
				// Restore easing status
				if (p.elapsed > 0 && p.opt.easing) {
					const resumePercent = p.elapsed / p.opt.duration;
					const remainPercent = 1 - resumePercent;
					const originalEasing = $.easing[p.opt.easing];
					const startEasingValue = originalEasing(resumePercent);
					const scale = MathUtil.scaler([startEasingValue, 1], [0, 1]);
					const newEasingName = `${p.opt.easing}_${p.uuid}`;

					// Make new easing function that continues from pause point.
					$.easing[newEasingName] = generateNewEasingFunc(
						resumePercent, remainPercent, scale, originalEasing);
					p.opt.easing = newEasingName;

					// Store new easing function to clear it later.
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
				p = this.__aniProps[i];
			}
		});
	};

	$.fn.stop = function(...args) {
		const type = args[0];
		let clearQ = args[1];

		stopFn.apply(this, args);

		if (typeof type !== "string") {
			clearQ = type;
		}

		return this.each(function() {
			let p;

			// When this element was not animated properly, do nothing.
			if (AniPropertyManager.getStatus(this) === "empty") {
				return;
			}

			if (!clearQ) {
				p = this.__aniProps.shift();
				p && p.clearEasingFn();
			} else {
				// If clearQueue is requested,
				// then all properties must be initialized
				// for element not to be resumed.
				p = this.__aniProps.shift();
				while (p) {
					p.clearEasingFn();
					p = this.__aniProps.shift();
				}
				this.__aniProps = [];
			}
		});
	};

	$.expr.filters.paused = function(elem) {
		return AniPropertyManager.getStatus(elem) === "paused";
	};
})(jQuery);
