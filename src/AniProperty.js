import $ from 'jquery';
let uuid = 1;

export class AniProperty {
	constructor(type, el, prop, optall) {
		this.el = el;
		this.opt = optall;
		this.start = -1;
		this.elapsed = 0;
		this.paused = false;
		this.uuid = uuid++;
		this.easingNames = [];
		this.prop = prop;
		this.type = type;
	}

	init() {
		var currValue;
		this.start = $.now();
		this.elapsed = 0;

		for (var propName in this.prop) {
			var propValue = this.prop[propName];
			var markIndex;
			var sign;

			// DO NOT SUPPORT TRANSFORM YET
			// TODO: convert from relative value to absolute value on transform
			if (propName === "transform") {
				continue;
			}

			//If it has a absoulte value.
			if (typeof propValue !== "string" ||
				(markIndex = propValue.search(/[+|-]=/)) < 0) {
				// this.prop[propName] = propValue;
				continue;
			}

			//If it has a relative value
			sign = propValue.charAt(markIndex) === "-" ? -1 : 1;

			// Current value
			currValue = $.css(this.el, propName);

			// CurrValue + (relativeValue)
			this.prop[propName] = propValue
				.replace(/([-|+])*([\d|\.])+/g, this.generateAbsoluteValMaker(currValue, propName, sign))
				.replace(/[-|+]+=/g, "");
		}
	};

	addEasingFn(easingName) {
		this.easingNames.push(easingName);
	};

	clearEasingFn() {
		var easing;
		while (easing = this.easingNames.shift()) {
			delete $.easing[easing];
		}
		this.easingNames = [];
	};

	/**
	 * Generate a new absolute value maker.
	 *
	 * function to avoid JS Hint error "Don't make functions within a loop"
	 */
	generateAbsoluteValMaker(prevValue, propName, sign) {
		return function absoluteValMaker(match) {
			if (!prevValue || prevValue === "auto") {
				// Empty strings, null, undefined and "auto" are converted to 0.
				// This solution is somewhat extracted from jQuery Tween.propHooks._default.get
				// TODO: Should we consider adopting a Tween.propHooks?
				prevValue = 0;
			} else {
				prevValue = parseFloat(prevValue);
			}
			return prevValue + (match * sign);
		};
	}
}
