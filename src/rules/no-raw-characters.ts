import { Location, sliceLocation } from "../context";
import { NodeType } from "../dom";
import { AttributeEvent, ElementReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const defaults = {
	relaxed: false,
};

const textRegexp = /([<>]|&(?![a-zA-Z0-9#]+;))/g;
const unquotedAttrRegexp = /([<>"'=`]|&(?![a-zA-Z0-9#]+;))/g;

const replacementTable: Map<string, string> = new Map([
	['"', "&quot;"],
	["&", "&amp;"],
	["'", "&apos;"],
	["<", "&lt;"],
	["=", "&equals;"],
	[">", "&gt;"],
	["`", "&grave;"],
]);

class NoRawCharacters extends Rule {
	private relaxed: boolean;

	public constructor(options: object) {
		super(Object.assign({}, defaults, options));
		this.relaxed = this.options.relaxed;
	}

	public documentation(): RuleDocumentation {
		return {
			description: `Some characters such as \`<\`, \`>\` and \`&\` hold special meaning in HTML and must be escaped using a character reference (html entity).`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("element:ready", (event: ElementReadyEvent) => {
			const node = event.target;

			/* only iterate over direct descendants */
			for (const child of node.childNodes) {
				if (child.nodeType !== NodeType.TEXT_NODE) {
					continue;
				}
				this.findRawChars(child.textContent, child.location, textRegexp);
			}
		});

		this.on("attr", (event: AttributeEvent) => {
			/* boolean attributes has no value so nothing to validate */
			if (!event.value) {
				return;
			}

			/* quoted attribute values can contain most symbols except the quotemark
			 * itself but unescaped quotemarks would cause a parsing error */
			if (event.quote) {
				return;
			}

			this.findRawChars(
				event.value.toString(),
				event.valueLocation,
				unquotedAttrRegexp
			);
		});
	}

	/**
	 * Find raw special characters and report as errors.
	 *
	 * @param text - The full text to find unescaped raw characters in.
	 * @param location - Location of text.
	 * @param regexp - Regexp pattern to match using.
	 * @param ignore - List of characters to ignore for this text.
	 */
	private findRawChars(text: string, location: Location, regexp: RegExp): void {
		let match;
		do {
			match = regexp.exec(text);
			if (match) {
				const char = match[0];
				/* In relaxed mode & only needs to be encoded if it is ambiguous,
				 * however this rule will only match either non-ambiguous ampersands or
				 * ampersands part of a character reference. Whenever it is a valid
				 * character reference or not not checked by this rule */
				if (this.relaxed && char === "&") {
					continue;
				}

				/* determine replacement character and location */
				const replacement = replacementTable.get(char);
				const charLocation = sliceLocation(
					location,
					match.index,
					match.index + 1
				);

				/* report as error */
				this.report(
					null,
					`Raw "${char}" must be encoded as "${replacement}"`,
					charLocation
				);
			}
		} while (match);
	}
}

module.exports = NoRawCharacters;
