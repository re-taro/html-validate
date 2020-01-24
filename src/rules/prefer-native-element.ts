import { Location } from "../context";
import { DynamicValue } from "../dom";
import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

interface RuleContext {
	role: string;
	replacement: string;
}

interface RuleOptions {
	mapping: Record<string, string>;
	include: string[] | null;
	exclude: string[] | null;
}

const defaults: RuleOptions = {
	mapping: {
		article: "article",
		banner: "header",
		button: "button",
		cell: "td",
		checkbox: "input",
		complementary: "aside",
		contentinfo: "footer",
		figure: "figure",
		form: "form",
		heading: "hN",
		input: "input",
		link: "a",
		list: "ul",
		listbox: "select",
		listitem: "li",
		main: "main",
		navigation: "nav",
		progressbar: "progress",
		radio: "input",
		region: "section",
		table: "table",
		textbox: "textarea",
	},
	include: null,
	exclude: null,
};

class PreferNativeElement extends Rule<RuleContext, RuleOptions> {
	public constructor(options: RuleOptions) {
		super(Object.assign({}, defaults, options));
	}

	public documentation(context: RuleContext): RuleDocumentation {
		const doc: RuleDocumentation = {
			description: `Instead of using WAI-ARIA roles prefer to use the native HTML elements.`,
			url: ruleDocumentationUrl(__filename),
		};
		if (context) {
			doc.description = `Instead of using the WAI-ARIA role "${context.role}" prefer to use the native <${context.replacement}> element.`;
		}
		return doc;
	}

	public setup(): void {
		const { mapping } = this.options;
		this.on("attr", (event: AttributeEvent) => {
			/* ignore non-role attributes */
			if (event.key.toLowerCase() !== "role") {
				return;
			}

			/* ignore missing and dynamic values */
			if (!event.value || event.value instanceof DynamicValue) {
				return;
			}

			/* ignore roles configured to be ignored */
			const role = event.value.toLowerCase();
			if (this.isIgnored(role)) {
				return;
			}

			/* report error */
			const replacement = mapping[role];
			const context: RuleContext = { role, replacement };
			const location = this.getLocation(event);
			this.report(
				event.target,
				`Prefer to use the native <${replacement}> element`,
				location,
				context
			);
		});
	}

	private isIgnored(role: string): boolean {
		const { mapping, include, exclude } = this.options;

		/* ignore roles not mapped to native elements */
		const replacement = mapping[role];
		if (!replacement) {
			return true;
		}

		/* ignore roles not present in "include" */
		if (include && !include.includes(role)) {
			return true;
		}

		/* ignore roles present in "excludes" */
		if (exclude && exclude.includes(role)) {
			return true;
		}

		return false;
	}

	private getLocation(event: AttributeEvent): Location {
		const begin = event.location;
		const end = event.valueLocation;
		const quote = event.quote ? 1 : 0;
		const size = end.offset + end.size - begin.offset + quote;
		return {
			filename: begin.filename,
			line: begin.line,
			column: begin.column,
			offset: begin.offset,
			size,
		};
	}
}

module.exports = PreferNativeElement;