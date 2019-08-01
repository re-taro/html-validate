import { Config } from "../config";
import { Parser } from "../parser";
import { reset as resetDOMCounter } from "./domnode";
import { HtmlElement } from "./htmlelement";
import { Selector } from "./selector";

function stripHtmlElement(node: HtmlElement): object {
	return {
		id: node.id,
		class: node.hasAttribute("class") ? node.classList.join(" ") : null,
		nodeName: node.nodeName,
		nodeType: node.nodeType,
		tagName: node.tagName,
		unique: node.unique,
		testId: node.getAttributeValue("test-id"),
	};
}

function fetch(it: IterableIterator<HtmlElement>): object[] {
	return Array.from(it, stripHtmlElement);
}

describe("Selector", () => {
	let doc: HtmlElement;

	beforeEach(() => {
		const parser = new Parser(Config.empty());
		doc = parser.parseHtml(`
			<foo id="barney" test-id="foo-1">first foo</foo>
			<foo CLASS="fred" test-id="foo-2">second foo</foo>
			<bar test-id="bar-1">

				<!-- not valid but verify selectors can handle it -->
				<baz class="a" class="fred" class="b" test-id="baz-1">
					<foo test-id="foo-3">third foo</foo>
				</baz>

				<foo wilma="flintstone" lorem-123-ipsum="dolor-sit-amet" test-id="foo-4">forth foo</foo>
				<spam wilma="rubble" boolean test-id="spam-1"></spam>
				<baz test-id="baz-2"></baz>
			</bar>
		`).root;
	});

	afterEach(() => {
		resetDOMCounter();
	});

	it("should match tagName (foo)", () => {
		const selector = new Selector("foo");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-1" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-2" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-3" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match descendant (bar foo)", () => {
		const selector = new Selector("bar foo");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-3" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match child (bar > foo)", () => {
		const selector = new Selector("bar > foo");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match adjacent sibling (baz + foo)", () => {
		const selector = new Selector("baz + foo");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match general sibling (foo ~ baz)", () => {
		const selector = new Selector("foo ~ baz");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "baz", testId: "baz-2" }),
		]);
	});

	it("should match class (.fred)", () => {
		const selector = new Selector(".fred");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-2" }),
			expect.objectContaining({ tagName: "baz", testId: "baz-1" }),
		]);
	});

	it("should match id (#barney)", () => {
		const selector = new Selector("#barney");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-1" }),
		]);
	});

	it("should match having attribute ([wilma])", () => {
		const selector = new Selector("[wilma]");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
			expect.objectContaining({ tagName: "spam", testId: "spam-1" }),
		]);
	});

	it("should match having boolean attribute ([boolean])", () => {
		const selector = new Selector("[boolean]");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "spam", testId: "spam-1" }),
		]);
	});

	it("should match having attribute with dashes and numbers ([lorem-123-ipsum])", () => {
		const selector = new Selector("[lorem-123-ipsum]");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it('should match attribute value ([wilma="flintstone"])', () => {
		const selector = new Selector('[wilma="flintstone"]');
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it('should match attribute value with special characters ([lorem-123-ipsum="dolor-sit-amet"])', () => {
		const selector = new Selector('[lorem-123-ipsum="dolor-sit-amet"]');
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match attribute value on duplicated attributes", () => {
		const selectorA = new Selector('[class="a"]');
		const selectorB = new Selector('[class="b"]');
		expect(fetch(selectorA.match(doc))).toEqual([
			expect.objectContaining({ tagName: "baz", testId: "baz-1" }),
		]);
		expect(fetch(selectorB.match(doc))).toEqual([
			expect.objectContaining({ tagName: "baz", testId: "baz-1" }),
		]);
	});

	it("should match multiple attributes ([wilma][lorem-123-ipsum])", () => {
		const selector = new Selector("[wilma][lorem-123-ipsum]");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});
});
