import HtmlValidate from '../htmlvalidate';

describe('rule close-order', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'close-order': 'error'},
		});
	});

	it('should not report when elements are correct in wrong order', function(){
		const report = htmlvalidate.string('<div></div>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report for self-closing element', function(){
		const report = htmlvalidate.string('<div><input/></div>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report for self-closing element with attribute', function(){
		const report = htmlvalidate.string('<div><input required/></div>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report for void element', function(){
		const report = htmlvalidate.string('<div><input></div>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report for void element with attribute', function(){
		const report = htmlvalidate.string('<div><input required></div>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should report error when elements are closed in wrong order', function(){
		const report = htmlvalidate.string('<div></p>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be close-order").to.equal('close-order');
	});

	it('should report error when element is missing close tag', function(){
		const report = htmlvalidate.string('<div>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be close-order").to.equal('close-order');
	});

	it('should report error when element is missing opening tag', function(){
		const report = htmlvalidate.string('</div>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be close-order").to.equal('close-order');
	});

	it('smoketest', function(){
		const report = htmlvalidate.file('./test-files/rules/close-order.html');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 errors").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be close-order").to.equal('close-order');
		expect(report.results[0].messages[0].line, "first error should be on line 6").to.equal(6);
		expect(report.results[0].messages[0].column, "first error should be on column 15").to.equal(15);
	});

});
