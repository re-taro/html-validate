import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule no-inline-style", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-inline-style": "error" },
		});
	});

	it("should report when style attribute is used", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<p style=""></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-inline-style",
			"Inline style is not allowed"
		);
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile(
			"test-files/rules/no-inline-style.html"
		);
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(
			htmlvalidate.getRuleDocumentation("no-inline-style")
		).toMatchSnapshot();
	});
});
