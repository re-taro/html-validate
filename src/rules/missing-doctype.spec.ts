import HtmlValidate from "../htmlvalidate";
import "../jest";

describe("rule missing-doctype", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "missing-doctype": "error" },
		});
	});

	it("should report error when document is missing doctype", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<html></html>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("missing-doctype", "Document is missing doctype");
	});

	it("should not report error when document has doctype", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<!doctype html><html></html>");
		expect(report).toBeValid();
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/missing-doctype.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("missing-doctype")).toMatchSnapshot();
	});
});
