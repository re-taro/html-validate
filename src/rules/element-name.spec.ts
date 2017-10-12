import HtmlValidate from '../htmlvalidate';

describe('rule element-name', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	describe('configured with default pattern', function(){

		before(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'element-name': 'error'},
			});
		});

		it('should report error when custom element name does not have a dash', function(){
			const report = htmlvalidate.string('<foobar></foobar>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('element-name', '"foobar" is not a valid element name');
		});

		it('should report error when custom element name does not start with letter', function(){
			const report = htmlvalidate.string('<1-foo></1-foo>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('element-name', '"1-foo" is not a valid element name');
		});

		it('should not report error when custom element name is valid', function(){
			const report = htmlvalidate.string('<foo-bar></foo-bar>');
			expect(report.valid, "linting should report failure").to.be.true;
		});

		it('should not report when using builtin elements', function(){
			const report = htmlvalidate.string('<span><a><span></span></a></span>');
			expect(report.valid, "linting should report failure").to.be.true;
		});

		it('should not report error for xml namespaces', function(){
			const report = htmlvalidate.string('<xmlns:foo></xmlns:foo>');
			expect(report.valid, "linting should report failure").to.be.true;
		});

	});

	describe('configured with custom pattern', function(){

		before(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'element-name': ['error', {pattern: '^foo-\\w+$'}]},
			});
		});

		it('should report error when custom element name does not match pattern', function(){
			const report = htmlvalidate.string('<spam-ham></spam-ham>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('element-name', '"spam-ham" is not a valid element name');
		});

		it('should not report error when custom element name does match pattern', function(){
			const report = htmlvalidate.string('<foo-bar></foo-bar>');
			expect(report.valid, "linting should report failure").to.be.true;
		});

		it('should not report when using builtin elements', function(){
			const report = htmlvalidate.string('<span><a><span></span></a></span>');
			expect(report.valid, "linting should report failure").to.be.true;
		});

		it('should not report error for xml namespaces', function(){
			const report = htmlvalidate.string('<xmlns:foo></xmlns:foo>');
			expect(report.valid, "linting should report failure").to.be.true;
		});

	});

});
