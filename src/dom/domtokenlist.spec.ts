import { Location } from "../context";
import { DOMTokenList } from "./domtokenlist";
import { DynamicValue } from "./dynamic-value";

describe("DOMTokenList", () => {
	it("should split string into parts", () => {
		expect.assertions(1);
		const list = new DOMTokenList("foo bar baz");
		expect(Array.from(list)).toEqual(["foo", "bar", "baz"]);
	});

	it("should handle multiple spaces", () => {
		expect.assertions(1);
		const list = new DOMTokenList("foo  bar  baz");
		expect(Array.from(list)).toEqual(["foo", "bar", "baz"]);
	});

	it("should handle leading and trailing spaces", () => {
		expect.assertions(1);
		const list = new DOMTokenList(" foo bar baz ");
		expect(Array.from(list)).toEqual(["foo", "bar", "baz"]);
	});

	it("should handle empty string", () => {
		expect.assertions(1);
		const list = new DOMTokenList("");
		expect(Array.from(list)).toEqual([]);
	});

	it("should handle null", () => {
		expect.assertions(1);
		const list = new DOMTokenList(null);
		expect(Array.from(list)).toEqual([]);
	});

	it("should handle DynamicValue", () => {
		expect.assertions(1);
		const dynamic = new DynamicValue("foo");
		const list = new DOMTokenList(dynamic);
		expect(Array.from(list)).toEqual([]);
	});

	it(".value should return original value", () => {
		expect.assertions(1);
		const list = new DOMTokenList("foo bar baz");
		expect(list.value).toEqual("foo bar baz");
	});

	it(".value should return expression", () => {
		expect.assertions(1);
		const dynamic = new DynamicValue("foo");
		const list = new DOMTokenList(dynamic);
		expect(list.value).toEqual("foo");
	});

	describe("item()", () => {
		it("should return item by index", () => {
			expect.assertions(1);
			const list = new DOMTokenList("foo bar baz");
			expect(list.item(1)).toEqual("bar");
		});

		it("should return undefined if out of range", () => {
			expect.assertions(2);
			const list = new DOMTokenList("foo bar baz");
			expect(list.item(-1)).toBeUndefined();
			expect(list.item(3)).toBeUndefined();
		});
	});

	describe("location()", () => {
		const location: Location = {
			filename: "mock",
			line: 1,
			column: 1,
			offset: 0,
			size: 11,
		};

		it("should return location by index", () => {
			expect.assertions(3);
			const list = new DOMTokenList("foo bar baz", location);
			expect(list.location(0)).toEqual({
				filename: "mock",
				line: 1,
				column: 1,
				offset: 0,
				size: 3,
			});
			expect(list.location(1)).toEqual({
				filename: "mock",
				line: 1,
				column: 5,
				offset: 4,
				size: 3,
			});
			expect(list.location(2)).toEqual({
				filename: "mock",
				line: 1,
				column: 9,
				offset: 8,
				size: 3,
			});
		});

		it("should return undefined if out of range", () => {
			expect.assertions(2);
			const list = new DOMTokenList("foo bar baz", location);
			expect(list.location(-1)).toBeUndefined();
			expect(list.location(3)).toBeUndefined();
		});

		it("should throw error when accessing location without base location", () => {
			expect.assertions(1);
			const list = new DOMTokenList("foo");
			expect(() => list.location(0)).toThrow();
		});
	});

	describe("contains()", () => {
		it("should return true if token exists", () => {
			expect.assertions(1);
			const list = new DOMTokenList("foo bar baz");
			expect(list.contains("baz")).toBeTruthy();
		});

		it("should return false if token doesn't exists", () => {
			expect.assertions(1);
			const list = new DOMTokenList("foo bar baz");
			expect(list.contains("spam")).toBeFalsy();
		});
	});
});
