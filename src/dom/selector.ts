import { Combinator, parseCombinator } from "./combinator";
import { HtmlElement } from "./htmlelement";

class Matcher {
	// eslint-disable-next-line no-unused-vars
	match(node: HtmlElement): boolean {
		/* istanbul ignore next: only used by fallback solution */
		return false;
	}
}

class ClassMatcher extends Matcher {
	private readonly classname: string;

	constructor(classname: string) {
		super();
		this.classname = classname;
	}

	match(node: HtmlElement): boolean {
		return node.classList.contains(this.classname);
	}
}

class IdMatcher extends Matcher {
	private readonly id: string;

	constructor(id: string) {
		super();
		this.id = id;
	}

	match(node: HtmlElement): boolean {
		return node.id === this.id;
	}
}

class AttrMatcher extends Matcher {
	private readonly key: string;
	private readonly op: string;
	private readonly value: string;

	constructor(attr: string) {
		super();
		const [, key, op, value] = attr.match(/^(.+?)(?:([~^$*|]?=)"([a-z]+)")?$/);
		this.key = key;
		this.op = op;
		this.value = value;
	}

	match(node: HtmlElement): boolean {
		const attr = node.getAttributeValue(this.key);
		switch (this.op) {
			case undefined:
				return attr !== null;
			case "=":
				return attr === this.value;
			default:
				throw new Error(
					`Attribute selector operator ${this.op} is not implemented yet`
				);
		}
	}
}

class Pattern {
	readonly combinator: Combinator;
	readonly tagName: string;
	private readonly selector: string;
	private readonly pattern: Matcher[];

	constructor(pattern: string) {
		const match = pattern.match(/^([~+\->]?)((?:[*]|[^.#[]+)?)(.*)$/);
		match.shift(); /* remove full matched string */
		this.selector = pattern;
		this.combinator = parseCombinator(match.shift());
		this.tagName = match.shift() || "*";
		const p = match[0] ? match[0].split(/(?=[.#[])/) : [];
		this.pattern = p.map((cur: string) => Pattern.createMatcher(cur));
	}

	match(node: HtmlElement): boolean {
		return (
			node.is(this.tagName) &&
			this.pattern.every((cur: Matcher) => cur.match(node))
		);
	}

	private static createMatcher(pattern: string): Matcher {
		switch (pattern[0]) {
			case ".":
				return new ClassMatcher(pattern.slice(1));
			case "#":
				return new IdMatcher(pattern.slice(1));
			case "[":
				return new AttrMatcher(pattern.slice(1, -1));
			default:
				/* istanbul ignore next: fallback solution, the switch cases should cover
				 * everything and there is no known way to trigger this fallback */
				throw new Error(`Failed to create matcher for "${pattern}"`);
		}
	}
}

export class Selector {
	private readonly pattern: Pattern[];

	constructor(selector: string) {
		this.pattern = Selector.parse(selector);
	}

	*match(root: HtmlElement, level: number = 0): IterableIterator<HtmlElement> {
		if (level >= this.pattern.length) {
			yield root;
			return;
		}

		const pattern = this.pattern[level];
		const matches = Selector.findCandidates(root, pattern);

		for (const node of matches) {
			if (!pattern.match(node)) {
				continue;
			}

			yield* this.match(node, level + 1);
		}
	}

	private static parse(selector: string): Pattern[] {
		const pattern = selector.replace(/([+~>]) /, "$1").split(/ +/);
		return pattern.map((part: string) => new Pattern(part));
	}

	private static findCandidates(
		root: HtmlElement,
		pattern: Pattern
	): HtmlElement[] {
		switch (pattern.combinator) {
			case Combinator.DESCENDANT:
				return root.getElementsByTagName(pattern.tagName);
			case Combinator.CHILD:
				return root.children.filter(node => node.is(pattern.tagName));
			case Combinator.ADJACENT_SIBLING:
				return Selector.findAdjacentSibling(root);
			case Combinator.GENERAL_SIBLING:
				return Selector.findGeneralSibling(root);
		}
		/* istanbul ignore next: fallback solution, the switch cases should cover
		 * everything and there is no known way to trigger this fallback */
		return [];
	}

	private static findAdjacentSibling(node: HtmlElement): HtmlElement[] {
		let adjacent = false;
		return node.siblings.filter(cur => {
			if (adjacent) {
				adjacent = false;
				return true;
			}
			if (cur === node) {
				adjacent = true;
			}
			return false;
		});
	}

	private static findGeneralSibling(node: HtmlElement): HtmlElement[] {
		let after = false;
		return node.siblings.filter(cur => {
			if (after) {
				return true;
			}
			if (cur === node) {
				after = true;
			}
			return false;
		});
	}
}
