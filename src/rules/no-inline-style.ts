import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class NoInlineStyle extends Rule {
	documentation(): RuleDocumentation {
		return {
			description:
				"Inline style is a sign of unstructured CSS. Use class or ID with a separate stylesheet.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	setup() {
		this.on("attr", (event: AttributeEvent) => {
			if (event.key === "style") {
				this.report(event.target, "Inline style is not allowed");
			}
		});
	}
}

module.exports = NoInlineStyle;
