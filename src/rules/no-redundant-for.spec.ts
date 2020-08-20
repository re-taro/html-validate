import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule no-redundant-for", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-for": "error" },
		});
	});

	it("should not report when <label> does not have for attribute", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<label><input></label>");
		expect(report).toBeValid();
	});

	it("should not report when <label> references control elsewhere in tree", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			'<label for="foo"></label><input id="foo">'
		);
		expect(report).toBeValid();
	});

	it("should report error when <label> references wrapped element", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString(
			'<label for="foo"><input id="foo"></label>'
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-redundant-for", 'Redundant "for" attribute');
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-for": ["error", { style: "auto" }] },
		});
		expect(
			htmlvalidate.getRuleDocumentation("no-redundant-for")
		).toMatchSnapshot();
	});
});
