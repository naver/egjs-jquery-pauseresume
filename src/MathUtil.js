export default class MathUtil {
	static interpolateNumber(a, b) {
		const numA = +a;
		const numB = +b;

		return function(t) {
			return numA * (1 - t) + numB * t;
		};
	}

	static uninterpolateNumber(a, b) {
		const numA = +a;
		let numB = b - numA;

		numB = numB || 1 / numB;

		return function(x) {
			return (x - numA) / numB;
		};
	}

	// Adopt linear scale from d3
	static scaler(domain, range) {
		const u = MathUtil.uninterpolateNumber(domain[0], domain[1]);
		const i = MathUtil.interpolateNumber(range[0], range[1]);

		return function(x) {
			return i(u(x));
		};
	}
}
