import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<input type="hidden" aria-label="foobar">`;
markup["correct"] = `<input type="text" aria-label="foobar">`;

describe("docs/rules/aria-label-misuse.md", () => {
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"aria-label-misuse":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"aria-label-misuse":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});