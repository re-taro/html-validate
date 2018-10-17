const formatter = require('./text');
import { Result } from '../reporter';

describe('text formatter', () => {

	it('should generate plaintext', () => {
		const results: Result[] = [
			{filePath: 'regular.html', messages: [
				{ruleId: 'foo', severity: 2, message: 'An error', line: 1, column: 5},
				{ruleId: 'bar', severity: 1, message: 'A warning', line: 2, column: 4},
			]},
			{filePath: 'edge-cases.html', messages: [
				{ruleId: 'baz', severity: 2, message: 'Another error', line: 3, column: 3},
			]},
		];
		expect(formatter(results)).toMatchSnapshot();
	});

	it('should empty result', () => {
		const results: Result[] = [];
		expect(formatter(results)).toMatchSnapshot();
	});

	it('should empty messages', () => {
		const results: Result[] = [
			{filePath: 'empty.html', messages: []},
		];
		expect(formatter(results)).toMatchSnapshot();
	});

});
