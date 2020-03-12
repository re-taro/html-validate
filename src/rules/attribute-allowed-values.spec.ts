import HtmlValidate from "../htmlvalidate";
import "../matchers";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule attribute-allowed-values", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "attribute-allowed-values": "error" },
		});
	});

	it("should report error when element has invalid attribute value", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<input type="foobar">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"attribute-allowed-values",
			'Attribute "type" has invalid value "foobar"'
		);
	});

	it("should report error when element has invalid boolean attribute value", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<input type>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"attribute-allowed-values",
			'Attribute "type" is missing value'
		);
	});

	it("should report error when element attribute should be boolean", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<input required="foobar">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"attribute-allowed-values",
			'Attribute "required" has invalid value "foobar"'
		);
	});

	it("should not report error when element has valid attribute value", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<input type="text">');
		expect(report).toBeValid();
	});

	it("should not report error when element is missing meta", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<foo-bar type="text">');
		expect(report).toBeValid();
	});

	it("should not report error when element has no attribute specification", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<div id="text">');
		expect(report).toBeValid();
	});

	it("should not report error when attribute is dynamic", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			'<input type="{{ interpolated }}" required="{{ interpolated }}"><input dynamic-type="dynamic" dynamic-required="dynamic">',
			null,
			{
				processAttribute,
			}
		);
		expect(report).toBeValid();
	});

	it("should not report error when element allows empty value and attribute is null", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<a download>");
		expect(report).toBeValid();
	});

	it("should not report error when element allows empty value and attribute is empty string", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<a download="">');
		expect(report).toBeValid();
	});

	it("should not report error when element allows empty and other values and attribute is non-empty string", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<a download="foobar">');
		expect(report).toBeValid();
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile(
			"test-files/rules/attribute-allowed-values.html"
		);
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(
			htmlvalidate.getRuleDocumentation("attribute-allowed-values")
		).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		expect.assertions(1);
		const context = {
			element: "any",
			attribute: "foo",
			value: "bar",
			allowed: ["spam", "ham", /\d+/],
		};
		expect(
			htmlvalidate.getRuleDocumentation(
				"attribute-allowed-values",
				null,
				context
			)
		).toMatchSnapshot();
	});

	it("should contain contextual documentation when attribute should be boolean", () => {
		expect.assertions(1);
		const context = {
			element: "any",
			attribute: "foo",
			value: "bar",
			allowed: [] as string[],
		};
		expect(
			htmlvalidate.getRuleDocumentation(
				"attribute-allowed-values",
				null,
				context
			)
		).toMatchSnapshot();
	});
});
