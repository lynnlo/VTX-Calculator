import { round } from "mathjs";

// Format the output
export const formatOutput = (newCommands, newCommand) => {
	switch (typeof(newCommands[newCommand]['cacheOutput'])) {
		case 'function':
			newCommands[newCommand]['cacheOutput'] = 'Function';
			break;
		case 'number':
			newCommands[newCommand]['cacheOutput'] = newCommands[newCommand]['cacheOutput'].toString();
			break;
		case 'string':
			newCommands[newCommand]['cacheOutput'] = `${newCommands[newCommand]['cacheOutput']}`;
			break;	
		case 'object':
			if (Array.isArray(newCommands[newCommand]['cacheOutput'])) {
				newCommands[newCommand]['cacheOutput'] = newCommands[newCommand]['cacheOutput'].map(x => round(x, 3));
			}
			newCommands[newCommand]['cacheOutput'] = newCommands[newCommand]['cacheOutput'].toString();
			break; 

		default:
			newCommands[newCommand]['cacheOutput'] = '';
			break;
	}

	if (newCommands[newCommand]['cacheOutput'].length > 20) {
		newCommands[newCommand]['cacheOutput'] = newCommands[newCommand]['cacheOutput'].slice(0, 20);
	}
	else if (newCommands[newCommand]['cacheOutput'].length === 0) {
		newCommands[newCommand]['cacheOutput'] = '';
	}

	return newCommands;
}

// Evaluate the command
export const evaluateCommand = (newCommands, newCommand, environment) => {
	let list = environment.scope;
	let suggestions = [];
	let query = newCommands[newCommand]['command'].split(/\(|\+|-|\/|\*|=|\s/)[newCommands[newCommand]['command'].split(/\(|\+|-|\/|\*|=|\s/).length - 1];
	if (query.length > 0) {
		list.forEach((_, x) => x.slice(0, query.length) === query ? suggestions.push(x) : null);
	}
	switch (newCommands[newCommand]['command']) {
		case 'clear':
			environment.clear();
			newCommands[newCommand]['cacheOutput'] = newCommands[newCommand]['command'];
			break;
		default:
			try {
				newCommands[newCommand]['suggestions'] = [query, ...suggestions];
				newCommands[newCommand]['cacheOutput'] = environment.evaluate(newCommands[newCommand]['command']);
			} catch (error) {
				newCommands[newCommand]['cacheOutput'] = newCommands[newCommand]['command'];
			}
			break;
	}
	return newCommands;
}
