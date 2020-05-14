import HtmlValidate from "../htmlvalidate";
import "../matchers";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule no-autoplay", () => {
	describe("default config", () => {
		let htmlvalidate: HtmlValidate;

		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "no-autoplay": "error" },
			});
		});

		it.each(["audio", "video"])(
			"should not report error when <%s> does not have autoplay",
			(tagName) => {
				expect.assertions(1);
				const report = htmlvalidate.validateString(`<${tagName}></${tagName}>`);
				expect(report).toBeValid();
			}
		);

		it("should not report error when autoplay attribute is dynamic", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString(
				'<video dynamic-autoplay="enableAutoplay">',
				null,
				{
					processAttribute,
				}
			);
			expect(report).toBeValid();
		});

		it.each(["audio", "video"])(
			"should report error when <%s> have autoplay",
			(tagName) => {
				expect.assertions(1);
				const report = htmlvalidate.validateString(
					`<${tagName} autoplay></${tagName}>`
				);
				expect(report).toBeInvalid();
			}
		);
	});

	it("should not report error when role is excluded", () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			rules: { "no-autoplay": ["error", { exclude: ["video"] }] },
		});
		const valid = htmlvalidate.validateString("<video autoplay></video>");
		const invalid = htmlvalidate.validateString("<audio autoplay></audio>");
		expect(valid).toBeValid();
		expect(invalid).toBeInvalid();
	});

	it("should report error only for included roles", () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			rules: { "no-autoplay": ["error", { include: ["video"] }] },
		});
		const valid = htmlvalidate.validateString("<audio autoplay></audio>");
		const invalid = htmlvalidate.validateString("<video autoplay></video>");
		expect(valid).toBeValid();
		expect(invalid).toBeInvalid();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "no-autoplay": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("no-autoplay")).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "no-autoplay": "error" },
		});
		const context = {
			tagName: "video",
		};
		expect(
			htmlvalidate.getRuleDocumentation("no-autoplay", null, context)
		).toMatchSnapshot();
	});
});