export const factorial = (n) => {
	if (n < 0) {
		return NaN;
	}
	else if (n === 0) {
		return 1;
	}
	else {
		return n * factorial(n - 1);
	}
}

export const quadratic = function(a, b, c) {
	let r1 = (-b + Math.sqrt((b * b) - (4 * a * c))) / (2 * a);
	let r2 = (-b - Math.sqrt((b * b) - (4 * a * c))) / (2 * a);
	return [r1, r2]; 
}

export const combination = function(n, k) {
	return factorial(n) / (factorial(k) * factorial(n - k));
}
export const ncr = combination;

