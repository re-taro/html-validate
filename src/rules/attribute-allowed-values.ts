import { Location } from "../context";
import { HtmlElement, Attribute } from "../dom";
import { DOMReadyEvent } from "../event";
import { Validator } from "../meta";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

interface Context {
	element: string;
	attribute: string;
	value: string;
	allowed: Array<string | RegExp>;
}

class AttributeAllowedValues extends Rule<Context> {
	public documentation(context?: Context): RuleDocumentation {
		const docs: RuleDocumentation = {
			description: "Attribute has invalid value.",
			url: ruleDocumentationUrl(__filename),
		};
		if (!context) {
			return docs;
		}

		if (context.allowed.length > 0) {
			const allowed = context.allowed.map(
				(val: string | RegExp) => `- \`${val}\``
			);
			docs.description = `Element <${
				context.element
			}> does not allow attribute \`${
				context.attribute
			}\` to have the value \`"${
				context.value
			}"\`, it must match one of the following:\n\n${allowed.join("\n")}`;
		} else {
			docs.description = `Element <${context.element}> attribute \`${context.attribute}\` must be a boolean attribute, e.g. \`<${context.element} ${context.attribute}>\``;
		}

		return docs;
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: HtmlElement) => {
				const meta = node.meta;

				/* ignore rule if element has no meta or meta does not specify attribute
				 * allowed values */
				if (!meta || !meta.attributes) return;

				for (const attr of node.attributes) {
					if (Validator.validateAttribute(attr, meta.attributes)) {
						continue;
					}

					const value = attr.value ? attr.value.toString() : "";
					const context: Context = {
						element: node.tagName,
						attribute: attr.key,
						value,
						allowed: meta.attributes[attr.key],
					};
					const message = this.getMessage(attr);
					const location = this.getLocation(attr);
					this.report(node, message, location, context);
				}
			});
		});
	}

	private getMessage(attr: Attribute): string {
		const { key, value } = attr;
		if (value !== null) {
			return `Attribute "${key}" has invalid value "${value.toString()}"`;
		} else {
			return `Attribute "${key}" is missing value`;
		}
	}

	private getLocation(attr: Attribute): Location {
		if (attr.value !== null) {
			return attr.valueLocation;
		} else {
			return attr.keyLocation;
		}
	}
}

module.exports = AttributeAllowedValues;
