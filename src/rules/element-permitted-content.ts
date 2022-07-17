import { HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Validator } from "../meta";
import { Permitted } from "../meta/element";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";
import { naturalJoin } from "./helper";

export enum ErrorKind {
	CONTENT = "content",
	DESCENDANT = "descendant",
	ANCESTOR = "ancestor",
}

export interface ContentContext {
	kind: ErrorKind.CONTENT;
	parent: string;
	child: string;
}

export interface DescendantContext {
	kind: ErrorKind.DESCENDANT;
	ancestor: string;
	child: string;
}

export interface AncestorContext {
	kind: ErrorKind.ANCESTOR;
	ancestor: string[];
	child: string;
}

type RuleContext = ContentContext | DescendantContext | AncestorContext;

function getTransparentChildren(node: HtmlElement, transparent: boolean | string[]): HtmlElement[] {
	if (typeof transparent === "boolean") {
		return node.childElements;
	} else {
		/* only return children which matches one of the given content categories */
		return node.childElements.filter((it) => {
			return transparent.some((category) => {
				return Validator.validatePermittedCategory(it, category, false);
			});
		});
	}
}

function isTagnameOnly(value: string): boolean {
	return Boolean(value.match(/^[a-zA-Z0-9-]+$/));
}

function getRuleDescription(context?: RuleContext): string[] {
	if (!context) {
		return [
			"Some elements has restrictions on what content is allowed.",
			"This can include both direct children or descendant elements.",
		];
	}
	switch (context.kind) {
		case ErrorKind.CONTENT:
			return [
				`The \`${context.child}\` element is not permitted as content under the parent \`${context.parent}\` element.`,
			];
		case ErrorKind.DESCENDANT:
			return [
				`The \`${context.child}\` element is not permitted as a descendant of the \`${context.ancestor}\` element.`,
			];
		case ErrorKind.ANCESTOR: {
			const escaped = context.ancestor.map((it) => `\`${it}\``);
			return [`The \`${context.child}\` element requires a ${naturalJoin(escaped)} ancestor.`];
		}
	}
}

export default class ElementPermittedContent extends Rule<RuleContext> {
	public documentation(context?: RuleContext): RuleDocumentation {
		return {
			description: getRuleDescription(context).join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: HtmlElement) => {
				const parent = node.parent;

				/* istanbul ignore next: satisfy typescript but will visitDepthFirst()
				 * will not yield nodes without a parent */
				if (!parent) {
					return;
				}

				/* Run each validation step, stop as soon as any errors are
				 * reported. This is to prevent multiple similar errors on the same
				 * element, such as "<dd> is not permitted content under <span>" and
				 * "<dd> has no permitted ancestors". */
				[
					() => this.validatePermittedContent(node, parent),
					() => this.validatePermittedDescendant(node, parent),
					() => this.validateRequiredAncestors(node),
				].some((fn) => fn());
			});
		});
	}

	private validatePermittedContent(cur: HtmlElement, parent: HtmlElement): boolean {
		/* if parent doesn't have metadata (unknown element) skip checking permitted
		 * content */
		if (!parent.meta) {
			return false;
		}

		const rules = parent.meta.permittedContent ?? null;
		return this.validatePermittedContentImpl(cur, parent, rules);
	}

	private validatePermittedContentImpl(
		cur: HtmlElement,
		parent: HtmlElement,
		rules: Permitted | null
	): boolean {
		if (!Validator.validatePermitted(cur, rules)) {
			const child = `<${cur.tagName}>`;
			const message = `${child} element is not permitted as content under ${parent.annotatedName}`;
			const context: ContentContext = {
				kind: ErrorKind.CONTENT,
				parent: parent.annotatedName,
				child,
			};
			this.report(cur, message, null, context);
			return true;
		}

		/* for transparent elements all/listed children must be validated against
		 * the (this elements) parent, i.e. if this node was removed from the DOM it
		 * should still be valid. */
		if (cur.meta && cur.meta.transparent) {
			const children = getTransparentChildren(cur, cur.meta.transparent);
			return children
				.map((child: HtmlElement) => {
					return this.validatePermittedContentImpl(child, parent, rules);
				})
				.some(Boolean);
		}

		return false;
	}

	private validatePermittedDescendant(node: HtmlElement, parent: HtmlElement): boolean {
		for (
			let cur: HtmlElement | null = parent;
			cur && !cur.isRootElement();
			cur = /* istanbul ignore next */ cur?.parent ?? null
		) {
			const meta = cur.meta;

			/* ignore checking parent without meta */
			if (!meta) {
				continue;
			}

			const rules = meta.permittedDescendants;
			if (!rules) {
				continue;
			}

			if (Validator.validatePermitted(node, rules)) {
				continue;
			}

			const child = `<${node.tagName}>`;
			const ancestor = cur.annotatedName;
			const message = `${child} element is not permitted as a descendant of ${ancestor}`;
			const context: DescendantContext = {
				kind: ErrorKind.DESCENDANT,
				ancestor,
				child,
			};
			this.report(node, message, null, context);
			return true;
		}
		return false;
	}

	private validateRequiredAncestors(node: HtmlElement): boolean {
		if (!node.meta) {
			return false;
		}

		const rules = node.meta.requiredAncestors;
		if (!rules) {
			return false;
		}

		if (!Validator.validateAncestors(node, rules)) {
			const ancestor = rules.map((it) => (isTagnameOnly(it) ? `<${it}>` : `"${it}"`));
			const child = `<${node.tagName}>`;
			const message = `<${node.tagName}> element requires a ${naturalJoin(ancestor)} ancestor`;
			const context: AncestorContext = {
				kind: ErrorKind.ANCESTOR,
				ancestor,
				child,
			};
			this.report(node, message, null, context);
			return true;
		}

		return false;
	}
}
