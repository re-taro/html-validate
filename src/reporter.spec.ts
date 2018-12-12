import { Reporter, Message } from './reporter';
describe('Reporter', function(){

	describe('merge()', function(){

		it('should set valid only if all reports are valid', function(){
			const none = Reporter.merge([{valid: false, results: []}, {valid: false, results: []}]);
			const one = Reporter.merge([{valid: true, results: []}, {valid: false, results: []}]);
			const all = Reporter.merge([{valid: true, results: []}, {valid: true, results: []}]);
			expect(none.valid).toBeFalsy();
			expect(one.valid).toBeFalsy();
			expect(all.valid).toBeTruthy();
		});

		it('should merge and group messages by filename', function(){
			const merged = Reporter.merge([
				{
					valid: false,
					results: [
						createResult('foo', ['fred', 'barney']),
						createResult('bar', ['spam']),
					],
				},
				{
					valid: false,
					results: [
						createResult('foo', ['wilma']),
					],
				},
			]);
			expect(merged.results).toHaveLength(2);
			expect(merged.results[0].filePath).toEqual('foo');
			expect(merged.results[0].messages.map(x => x.message)).toEqual(['fred', 'barney', 'wilma']);
			expect(merged.results[1].filePath).toEqual('bar');
			expect(merged.results[1].messages.map(x => x.message)).toEqual(['spam']);
		});

	});

	describe('save()', () => {

		it('should set valid to true if there are no errors', () => {
			const report = new Reporter();
			expect(report.save().valid).toBeTruthy();
		});

		it('should set valid to true if there are only warnings', () => {
			const report = new Reporter();
			report.addManual("filename", createMessage("warning", 1));
			expect(report.save().valid).toBeTruthy();

		});

		it('should set valid to false if there are any errors', () => {
			const report = new Reporter();
			report.addManual("filename", createMessage("error", 2));
			expect(report.save().valid).toBeFalsy();
		});

		it('should set results', () => {
			const report = new Reporter();
			report.addManual("foo.html", createMessage("error", 2));
			report.addManual("foo.html", createMessage("warning", 1));
			report.addManual("bar.html", createMessage("another error", 2));
			expect(report.save().results).toEqual([
				{filePath: 'foo.html', errorCount: 1, warningCount: 1, messages: [
					{offset: 0, line: 1, column: 1, ruleId: 'mock', severity: 2, message: 'error'},
					{offset: 0, line: 1, column: 1, ruleId: 'mock', severity: 1, message: 'warning'},
				]},
				{filePath: 'bar.html', errorCount: 1, warningCount: 0, messages: [
					{offset: 0, line: 1, column: 1, ruleId: 'mock', severity: 2, message: 'another error'},
				]},
			]);
		});

	});

});

function createResult(filename: string, messages: string[]){
	return {
		filePath: filename,
		messages: messages.map(cur => createMessage(cur)),
	};
}

function createMessage(message: string, severity: number = 2): Message {
	return {
		ruleId: 'mock',
		severity,
		message,
		offset: 0,
		line: 1,
		column: 1,
	};
}
