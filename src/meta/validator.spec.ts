import { Config, ResolvedConfig } from "../config";
import { Attribute, DynamicValue, HtmlElement } from "../dom";
import { Parser } from "../parser";
import { MetaData, MetaTable, Validator } from ".";

describe("Meta validator", () => {
	describe("validatePermitted()", () => {
		it("should handle null", () => {
			expect.assertions(1);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			expect(Validator.validatePermitted(foo, null)).toBeTruthy();
		});

		it("should validate tagName", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
				nil: mockEntry({ void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo, nil] = parser.parseHtml("<foo/><nil/>").root.childElements;
			const rules = ["foo"];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate tagName with qualifier", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
				nil: mockEntry({ void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo, nil] = parser.parseHtml("<foo/><nil/>").root.childElements;
			const rules = ["foo?"];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @meta", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				meta: mockEntry({ metadata: true, void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [meta, nil] = parser.parseHtml("<meta/><nil/>").root.childElements;
			const rules = ["@meta"];
			expect(Validator.validatePermitted(meta, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @flow", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				flow: mockEntry({ flow: true, void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [flow, nil] = parser.parseHtml("<flow/><nil/>").root.childElements;
			const rules = ["@flow"];
			expect(Validator.validatePermitted(flow, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @sectioning", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				sectioning: mockEntry({ sectioning: true, void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [sectioning, nil] = parser.parseHtml("<sectioning/><nil/>").root.childElements;
			const rules = ["@sectioning"];
			expect(Validator.validatePermitted(sectioning, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @heading", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				heading: mockEntry({ heading: true, void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [heading, nil] = parser.parseHtml("<heading/><nil/>").root.childElements;
			const rules = ["@heading"];
			expect(Validator.validatePermitted(heading, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @phrasing", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				phrasing: mockEntry({ phrasing: true, void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [phrasing, nil] = parser.parseHtml("<phrasing/><nil/>").root.childElements;
			const rules = ["@phrasing"];
			expect(Validator.validatePermitted(phrasing, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @embedded", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				embedded: mockEntry({ embedded: true, void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [embedded, nil] = parser.parseHtml("<embedded/><nil/>").root.childElements;
			const rules = ["@embedded"];
			expect(Validator.validatePermitted(embedded, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @interactive", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				interactive: mockEntry({
					interactive: true,
					void: true,
				}),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [interactive, nil] = parser.parseHtml("<interactive/><nil/>").root.childElements;
			const rules = ["@interactive"];
			expect(Validator.validatePermitted(interactive, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @script", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				scripting: mockEntry({
					scriptSupporting: true,
					void: true,
				}),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [script, nil] = parser.parseHtml("<scripting/><nil/>").root.childElements;
			const rules = ["@script"];
			expect(Validator.validatePermitted(script, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @form", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				form: mockEntry({
					form: true,
					void: true,
				}),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [form, nil] = parser.parseHtml("<form/><nil/>").root.childElements;
			const rules = ["@form"];
			expect(Validator.validatePermitted(form, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate multiple rules (OR)", () => {
			expect.assertions(3);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				flow: mockEntry({ flow: true, void: true }),
				phrasing: mockEntry({ phrasing: true, void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [flow, phrasing, nil] = parser.parseHtml("<flow/><phrasing/><nil/>").root.childElements;
			const rules = ["@flow", "@phrasing"];
			expect(Validator.validatePermitted(flow, rules)).toBeTruthy();
			expect(Validator.validatePermitted(phrasing, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate multiple rules (AND)", () => {
			expect.assertions(3);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true, phrasing: true, void: true }),
				flow: mockEntry({ flow: true, phrasing: false, void: true }),
				phrasing: mockEntry({
					flow: false,
					phrasing: true,
					void: true,
				}),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo, flow, phrasing] = parser.parseHtml("<foo/><flow/><phrasing/>").root.childElements;
			const rules = [["@flow", "@phrasing"]];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(flow, rules)).toBeFalsy();
			expect(Validator.validatePermitted(phrasing, rules)).toBeFalsy();
		});

		it("should support excluding tagname", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true, void: true }),
				bar: mockEntry({ flow: true, void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo, bar] = parser.parseHtml("<foo/><bar/><nil/>").root.childElements;
			const rules = [
				[
					"@flow",
					{
						exclude: "bar",
					},
				],
			];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(bar, rules)).toBeFalsy();
		});

		it("should support excluding category", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true, interactive: false, void: true }),
				bar: mockEntry({ flow: true, interactive: true, void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo, bar] = parser.parseHtml("<foo/><bar/><nil/>").root.childElements;
			const rules = [
				[
					"@flow",
					{
						exclude: "@interactive",
					},
				],
			];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(bar, rules)).toBeFalsy();
		});

		it("should support excluding multiple targets", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true, interactive: false, void: true }),
				bar: mockEntry({ flow: true, interactive: true, void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo, bar] = parser.parseHtml("<foo/><bar/><nil/>").root.childElements;
			const rules = [{ exclude: ["bar", "baz"] }];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(bar, rules)).toBeFalsy();
		});

		it("should support excluding multiple targets together", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true, interactive: false, void: true }),
				bar: mockEntry({ flow: true, interactive: true, void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo, bar] = parser.parseHtml("<foo/><bar/><nil/>").root.childElements;
			const rules = [
				[
					"@flow",
					{
						exclude: ["bar", "baz"],
					},
				],
			];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(bar, rules)).toBeFalsy();
		});

		it("should default to pass when excluding category from element without meta", () => {
			expect.assertions(1);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			const rules = [
				[
					{
						exclude: "@interactive",
					},
				],
			];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
		});

		it("should handle empty object", () => {
			expect.assertions(1);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true, void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			const rules = [["@flow", {}]];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
		});

		it("should throw error on invalid category", () => {
			expect.assertions(1);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			const rules = ["@invalid"];
			expect(() => {
				Validator.validatePermitted(foo, rules);
			}).toThrow('Invalid content category "@invalid"');
		});

		it("should throw error on invalid permitted rule", () => {
			expect.assertions(1);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			const rules = [
				[
					"@flow",
					{
						spam: "ham",
					},
				],
			];
			expect(() => {
				Validator.validatePermitted(foo, rules);
			}).toThrow('Permitted rule "{"spam":"ham"}" contains unknown property "spam"');
		});
	});

	describe("validateOccurrences()", () => {
		it("should handle null", () => {
			expect.assertions(1);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			expect(Validator.validateOccurrences(foo, null, 1)).toBeTruthy();
		});

		it("should support missing qualifier", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			const rules = ["foo"];
			expect(Validator.validateOccurrences(foo, rules, 0)).toBeTruthy();
			expect(Validator.validateOccurrences(foo, rules, 9)).toBeTruthy();
		});

		it("should support ? qualifier", () => {
			expect.assertions(3);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			const rules = ["foo?"];
			expect(Validator.validateOccurrences(foo, rules, 0)).toBeTruthy();
			expect(Validator.validateOccurrences(foo, rules, 1)).toBeTruthy();
			expect(Validator.validateOccurrences(foo, rules, 2)).toBeFalsy();
		});

		it("should support * qualifier", () => {
			expect.assertions(2);
			const metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			const rules = ["foo*"];
			expect(Validator.validateOccurrences(foo, rules, 0)).toBeTruthy();
			expect(Validator.validateOccurrences(foo, rules, 9)).toBeTruthy();
		});
	});

	describe("validateOrder()", () => {
		let metaTable: MetaTable;
		let parser: Parser;
		let cb: (node: HtmlElement, prev: HtmlElement) => void;

		beforeEach(() => {
			metaTable = new MetaTable();
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
				bar: mockEntry({ void: true, flow: true }),
			});
			parser = new Parser(new ResolvedConfig({ metaTable, plugins: [], rules: new Map() }));
			cb = jest.fn();
		});

		it("should handle null rules", () => {
			expect.assertions(2);
			const children = parser.parseHtml("<foo/>").root.childElements;
			expect(Validator.validateOrder(children, null, cb)).toBeTruthy();
			expect(cb).not.toHaveBeenCalled();
		});

		it("should return error when elements are out of order", () => {
			expect.assertions(2);
			const children = parser.parseHtml("<bar/><foo/>").root.childElements;
			const rules = ["foo", "bar"];
			expect(Validator.validateOrder(children, rules, cb)).toBeFalsy();
			expect(cb).toHaveBeenCalledWith(children[1], children[0]);
		});

		it("should not return error when elements are in order", () => {
			expect.assertions(2);
			const children = parser.parseHtml("<foo/><bar/>").root.childElements;
			const rules = ["foo", "bar"];
			expect(Validator.validateOrder(children, rules, cb)).toBeTruthy();
			expect(cb).not.toHaveBeenCalled();
		});

		it("should handle elements with unspecified order", () => {
			expect.assertions(2);
			const children = parser.parseHtml("<foo/><bar/><foo/>").root.childElements;
			const rules = ["foo"];
			expect(Validator.validateOrder(children, rules, cb)).toBeTruthy();
			expect(cb).not.toHaveBeenCalled();
		});

		it("should handle categories", () => {
			expect.assertions(2);
			const children1 = parser.parseHtml("<foo/><bar/>").root.childElements;
			const children2 = parser.parseHtml("<bar/><foo/>").root.childElements;
			const rules = ["foo", "@flow"];
			expect(Validator.validateOrder(children1, rules, cb)).toBeTruthy();
			expect(Validator.validateOrder(children2, rules, cb)).toBeFalsy();
		});
	});

	describe("validateAncestors()", () => {
		let root: HtmlElement;

		beforeAll(() => {
			const parser = new Parser(Config.empty().resolve());
			root = parser.parseHtml(`
				<dl id="variant-1">
					<dt></dt>
					<dd></dd>
				</dl>`).root;
		});

		it("should match if no rule is present", () => {
			expect.assertions(2);
			const node = root.querySelector("dd");
			expect(Validator.validateAncestors(node, null)).toBeTruthy();
			expect(Validator.validateAncestors(node, [])).toBeTruthy();
		});

		it("should match ancestors", () => {
			expect.assertions(1);
			const rules: string[] = ["dl"];
			const node = root.querySelector("dd");
			expect(Validator.validateAncestors(node, rules)).toBeTruthy();
		});

		it("should match itself", () => {
			expect.assertions(1);
			const rules: string[] = ["dl > dd"];
			const node = root.querySelector("dd");
			expect(Validator.validateAncestors(node, rules)).toBeTruthy();
		});

		it("should match if one rule matches", () => {
			expect.assertions(1);
			const rules: string[] = ["spam", "dl"];
			const node = root.querySelector("dd");
			expect(Validator.validateAncestors(node, rules)).toBeTruthy();
		});

		it("should return false if no rule matches", () => {
			expect.assertions(1);
			const rules: string[] = ["spam"];
			const node = root.querySelector("dd");
			expect(Validator.validateAncestors(node, rules)).toBeFalsy();
		});
	});

	describe("validateRequiredContent()", () => {
		let parser: Parser;

		beforeAll(() => {
			parser = new Parser(Config.empty().resolve());
		});

		it("should match if no rule is present", () => {
			expect.assertions(2);
			const node = parser.parseHtml("<div></div>").querySelector("div");
			expect(Validator.validateRequiredContent(node, null)).toEqual([]);
			expect(Validator.validateRequiredContent(node, [])).toEqual([]);
		});

		it("should return missing content", () => {
			expect.assertions(1);
			const node = parser.parseHtml("<div><foo></foo></div>").querySelector("div");
			expect(Validator.validateRequiredContent(node, ["foo", "bar", "baz"])).toEqual([
				"bar",
				"baz",
			]);
		});
	});

	describe("validateAttribute()", () => {
		it("should match if no rule is present", () => {
			expect.assertions(1);
			const rules = {};
			expect(Validator.validateAttribute(new Attribute("foo", "bar"), rules)).toBeTruthy();
		});

		it.each`
			regex     | value
			${/ba.*/} | ${"bar"}
			${/.*/}   | ${"foo"}
			${/.*/}   | ${""}
		`("should match regexp $regex vs $value", ({ regex, value }) => {
			expect.assertions(1);
			const rules = { foo: [regex] };
			const attr = new Attribute("foo", value);
			expect(Validator.validateAttribute(attr, rules)).toBeTruthy();
		});

		it.each`
			regex     | value    | expected
			${/ba.*/} | ${"car"} | ${false}
			${/ba.*/} | ${null}  | ${false}
			${/.*/}   | ${null}  | ${false}
		`("should not match regexp $regex vs $value", ({ regex, value }) => {
			expect.assertions(1);
			const rules = { foo: [regex] };
			const attr = new Attribute("foo", value);
			expect(Validator.validateAttribute(attr, rules)).toBeFalsy();
		});

		it("should match string value", () => {
			expect.assertions(2);
			const rules = {
				foo: ["bar"],
			};
			expect(Validator.validateAttribute(new Attribute("foo", "bar"), rules)).toBeTruthy();
			expect(Validator.validateAttribute(new Attribute("foo", "car"), rules)).toBeFalsy();
		});

		it("should match dynamic value", () => {
			expect.assertions(2);
			const rules = {
				foo: ["bar"],
				bar: [] as string[],
			};
			const dynamic = new DynamicValue("any");
			expect(Validator.validateAttribute(new Attribute("foo", dynamic), rules)).toBeTruthy();
			expect(Validator.validateAttribute(new Attribute("bar", dynamic), rules)).toBeTruthy();
		});

		it("should match if one of multiple allowed matches", () => {
			expect.assertions(2);
			const rules = {
				foo: ["fred", "barney", "wilma"],
			};
			expect(Validator.validateAttribute(new Attribute("foo", "barney"), rules)).toBeTruthy();
			expect(Validator.validateAttribute(new Attribute("foo", "pebble"), rules)).toBeFalsy();
		});

		it("should handle null", () => {
			expect.assertions(1);
			const rules = {
				foo: ["foo", "/bar/"],
			};
			expect(Validator.validateAttribute(new Attribute("foo", null), rules)).toBeFalsy();
		});

		it("should consider empty list as boolean attribute", () => {
			expect.assertions(1);
			const rules = {
				foo: [] as string[],
			};
			expect(Validator.validateAttribute(new Attribute("foo", null), rules)).toBeTruthy();
		});

		it("should consider empty value as either null or empty string", () => {
			expect.assertions(2);
			const rules = {
				foo: [""] as string[],
			};
			expect(Validator.validateAttribute(new Attribute("foo", null), rules)).toBeTruthy();
			expect(Validator.validateAttribute(new Attribute("foo", ""), rules)).toBeTruthy();
		});

		it("should normalize boolean attributes", () => {
			expect.assertions(4);
			const rules = {
				foo: [] as string[],
			};
			expect(Validator.validateAttribute(new Attribute("foo", null), rules)).toBeTruthy();
			expect(Validator.validateAttribute(new Attribute("foo", ""), rules)).toBeTruthy();
			expect(Validator.validateAttribute(new Attribute("foo", "foo"), rules)).toBeTruthy();
			expect(Validator.validateAttribute(new Attribute("foo", "bar"), rules)).toBeFalsy();
		});
	});
});

function mockEntry(stub: Partial<MetaData> = {}): MetaData {
	return {
		metadata: false,
		flow: false,
		foreign: false,
		sectioning: false,
		heading: false,
		phrasing: false,
		embedded: false,
		interactive: false,
		deprecated: false,
		void: false,
		transparent: false,
		scriptSupporting: false,
		form: false,
		...stub,
	};
}
