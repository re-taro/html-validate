import { DynamicValue } from "./dynamic-value";
import { NodeType } from "./nodetype";
import { TextNode } from "./text";

describe("TextNode", () => {
	it("should be a text node", () => {
		expect.assertions(3);
		const node = new TextNode("lorem ipsum");
		expect(node.nodeType).toEqual(NodeType.TEXT_NODE);
		expect(node.nodeName).toEqual("#text");
		expect(node.isRootElement()).toBeFalsy();
	});

	it("textContent should return text", () => {
		expect.assertions(1);
		const node = new TextNode("lorem ipsum");
		expect(node.textContent).toEqual("lorem ipsum");
	});

	it("textContent should return expression from dynamic values", () => {
		expect.assertions(1);
		const node = new TextNode(new DynamicValue("{{ foo }}"));
		expect(node.textContent).toEqual("{{ foo }}");
	});

	it("isStatic should return true for static text", () => {
		expect.assertions(2);
		const a = new TextNode("lorem ipsum");
		const b = new TextNode(new DynamicValue("{{ foo }}"));
		expect(a.isStatic).toBeTruthy();
		expect(b.isStatic).toBeFalsy();
	});

	it("isDynamic should return true for static text", () => {
		expect.assertions(2);
		const a = new TextNode("lorem ipsum");
		const b = new TextNode(new DynamicValue("{{ foo }}"));
		expect(a.isDynamic).toBeFalsy();
		expect(b.isDynamic).toBeTruthy();
	});
});
