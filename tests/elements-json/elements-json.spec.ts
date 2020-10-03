import path from "path";
import HtmlValidate from "../../src/htmlvalidate";
import "../../src/matchers";

it("should handle elements json file", () => {
	expect.assertions(2);
	const htmlvalidate = new HtmlValidate();
	const report = htmlvalidate.validateFile(path.join(__dirname, "my-file.html"));
	expect(report).toBeInvalid();
	expect(report.results[0].messages).toMatchInlineSnapshot(`
		Array [
		  Object {
		    "column": 2,
		    "context": Object {
		      "tagName": "my-element",
		    },
		    "line": 1,
		    "message": "<my-element> is deprecated",
		    "offset": 1,
		    "ruleId": "deprecated",
		    "selector": "my-element",
		    "severity": 2,
		    "size": 10,
		  },
		]
	`);
});
