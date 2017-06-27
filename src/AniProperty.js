import jQuery from "jquery";

const $ = jQuery;
let uuid = 1;

export default class AniProperty {
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
		this.start = $.now();
		this.elapsed = 0;

		for (const propName in this.prop) {
			const propValue = this.prop[propName];

			// DO NOT SUPPORT TRANSFORM YET
			// TODO: convert from relative value to absolute value on transform
			if (propName === "transform") {
				continue;
			}

			if (typeof propValue !== "string") {
				continue;
			}

			// If it has a absoulte value.
			const markIndex = propValue.search(/[+|-]=/);

			if (markIndex < 0) {
				// this.prop[propName] = propValue;
				continue;
			}

			// If it has a relative value
			const sign = propValue.charAt(markIndex) === "-" ? -1 : 1;

			// Current value
			const currValue = $.css(this.el, propName);

			// CurrValue + (relativeValue)
			this.prop[propName] = propValue
				.replace(/([-|+])*([\d|.])+/g, AniProperty.generateAbsoluteValMaker(currValue, propName, sign))
				.replace(/[-|+]+=/g, "");
		}
	}

	addEasingFn(easingName) {
		this.easingNames.push(easingName);
	}

	clearEasingFn() {
		let easing;

		easing = this.easingNames.shift();
		while (easing) {
			delete $.easing[easing];
			easing = this.easingNames.shift();
		}
		this.easingNames = [];
	}

	/**
	 * Generate a new absolute value maker.
	 *
	 * function to avoid JS Hint error "Don't make functions within a loop"
	 */
	static generateAbsoluteValMaker(prevValue, propName, sign) {
		let prev = prevValue;

		return function absoluteValMaker(match) {
			if (!prev || prev === "auto") {
				// Empty strings, null, undefined and "auto" are converted to 0.
				// This solution is somewhat extracted from jQuery Tween.propHooks._default.get
				// TODO: Should we consider adopting a Tween.propHooks?
				prev = 0;
			} else {
				prev = parseFloat(prev);
			}
			return prev + (match * sign);
		};
	}
}
