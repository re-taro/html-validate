import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<body bgcolor="red"></body>`;
markup["correct"] = `<body style="background: red;"></body>`;

describe("docs/rules/no-deprecated-attr.md", () => {
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-deprecated-attr":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-deprecated-attr":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
