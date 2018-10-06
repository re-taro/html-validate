import HtmlValidate from '../../../build/htmlvalidate';

const markup = {};
markup["incorrect"] = `<![if IE 6]>
<style>
    /* ... */
</style>
<![endif]>`;

describe('docs/rules/no-conditional-comment.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-conditional-comment":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
});
