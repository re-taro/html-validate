import { DOMTokenList } from "../dom";
import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

export default class NoDupClass extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: "Prevents unnecessary duplication of class names.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			if (event.key.toLowerCase() !== "class") {
				return;
			}

			const classes = new DOMTokenList(event.value, event.valueLocation);
			const unique: Set<string> = new Set();
			classes.forEach((cur: string, index: number) => {
				if (unique.has(cur)) {
					const location = classes.location(index);
					this.report(event.target, `Class "${cur}" duplicated`, location);
				}
				unique.add(cur);
			});
		});
	}
}
