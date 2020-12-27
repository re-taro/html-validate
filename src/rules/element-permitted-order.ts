import { HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Validator } from "../meta";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

export default class ElementPermittedOrder extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: "Some elements has a specific order the children must use.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: HtmlElement) => {
				if (!node.meta) {
					return;
				}

				const rules = node.meta.permittedOrder;
				if (!rules) {
					return;
				}

				Validator.validateOrder(
					node.childElements,
					rules,
					(child: HtmlElement, prev: HtmlElement) => {
						this.report(
							child,
							`Element <${child.tagName}> must be used before <${prev.tagName}> in this context`
						);
					}
				);
			});
		});
	}
}
