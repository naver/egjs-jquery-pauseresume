import AniProperty from "./AniProperty";

class AniPropertyManager {
	static addAniProperty(type, el, prop, optall) {
		const newProp = new AniProperty(type, el, prop, optall);

		el.__aniProps = el.__aniProps || [];

		// Animation is excuted immediately.
		if (el.__aniProps.length === 0) {
			newProp.init();
		}
		el.__aniProps.push(newProp);
	}

	static removeAniProperty(el) {
		const removeProp = el.__aniProps.shift();

		removeProp && removeProp.clearEasingFn();
		el.__aniProps[0] && el.__aniProps[0].init();
	}

	static prepareNextAniProp(el) {
		// Dequeue animation property that was ended.
		const removeProp = el.__aniProps.shift();
		const userCallback = removeProp.opt.old;

		removeProp.clearEasingFn();

		// Callback should be called before aniProps.init()
		if (userCallback && typeof userCallback === "function") {
			userCallback.call(el);
		}

		// If next ani property exists
		el.__aniProps[0] && el.__aniProps[0].init();
		return el.__aniProps[0];
	}

	// Check if this element can be paused/resume.
	static getStatus(el) {
		if (!el.__aniProps || el.__aniProps.length === 0) {
			// Current element doesn't have animation information.
			// Check 'animate' is applied to this element.
			return "empty";
		}

		return el.__aniProps[0].paused ? "paused" : "inprogress";
	}
}

export default AniPropertyManager;
