import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule element-required-attributes", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "element-required-attributes": "error" },
		});
	});

	it("should report error when required attribute is missing", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<input>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"element-required-attributes",
			'<input> is missing required "type" attribute'
		);
	});

	it("should not report error when element has required attribute attribute", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<input type="text">');
		expect(report).toBeValid();
	});

	it("should not report error when element has empty attribute", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<input type="">');
		expect(report).toBeValid();
	});

	it("should not report error when element is missing meta", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<foo-bar type="text">');
		expect(report).toBeValid();
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile(
			"test-files/rules/element-required-attributes.html"
		);
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(
			htmlvalidate.getRuleDocumentation("element-required-attributes")
		).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		expect.assertions(1);
		const context = {
			element: "any",
			attribute: "foo",
		};
		expect(
			htmlvalidate.getRuleDocumentation(
				"element-required-attributes",
				null,
				context
			)
		).toMatchSnapshot();
	});
});
