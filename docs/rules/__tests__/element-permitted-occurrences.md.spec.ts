import HtmlValidate from '../../../src/htmlvalidate';

const markup: {[key: string]: string} = {};
markup["incorrect"] = `<!-- table footer can only be used once -->
<table>
    <tfoot></tfoot>
    <tfoot></tfoot>
</div>`;
markup["correct"] = `<table>
    <tfoot></tfoot>
</table>`;

describe('docs/rules/element-permitted-occurrences.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"element-permitted-occurrences":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"element-permitted-occurrences":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
