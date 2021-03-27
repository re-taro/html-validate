import fs from "fs";
import path from "path";
import { CLI } from "./cli";
import { IsIgnored } from "./is-ignored";
import "../matchers";

describe("integration tests", () => {
	let ignored: IsIgnored;
	const fixturePath = path.resolve(__dirname, "../../test-files/ignored");

	beforeEach(() => {
		ignored = new IsIgnored();
		jest.restoreAllMocks();
	});

	it("should ignore foo.html", () => {
		expect.assertions(1);
		const filename = path.join(fixturePath, "foo.html");
		expect(ignored.isIgnored(filename)).toBeTruthy();
	});

	it("should not ignore bar.html", () => {
		expect.assertions(1);
		const filename = path.join(fixturePath, "foo.html");
		expect(ignored.isIgnored(filename)).toBeTruthy();
	});

	it("should ignore subdir/bar.html", () => {
		expect.assertions(1);
		const filename = path.join(fixturePath, "subdir/baz.html");
		expect(ignored.isIgnored(filename)).toBeTruthy();
	});

	it("should ignore subdir/baz.html", () => {
		expect.assertions(1);
		const filename = path.join(fixturePath, "subdir/baz.html");
		expect(ignored.isIgnored(filename)).toBeTruthy();
	});

	it("should cache ignore file", () => {
		expect.assertions(3);
		const readFileSync = jest.spyOn(fs, "readFileSync");
		const filename1 = path.join(fixturePath, "subdir/bar.html");
		const filename2 = path.join(fixturePath, "subdir/baz.html");
		expect(ignored.isIgnored(filename1)).toBeTruthy();
		expect(ignored.isIgnored(filename2)).toBeTruthy();
		expect(readFileSync).toHaveBeenCalledTimes(1);
	});

	it("should clear cache", () => {
		expect.assertions(3);
		const readFileSync = jest.spyOn(fs, "readFileSync");
		const filename1 = path.join(fixturePath, "subdir/bar.html");
		const filename2 = path.join(fixturePath, "subdir/baz.html");
		expect(ignored.isIgnored(filename1)).toBeTruthy();
		ignored.clearCache();
		expect(ignored.isIgnored(filename2)).toBeTruthy();
		expect(readFileSync).toHaveBeenCalledTimes(2);
	});

	it("expandFiles() should only return files not ignored", () => {
		expect.assertions(1);
		const cli = new CLI();
		const files = cli.expandFiles(["test-files/ignored"], { extensions: ["html", "vue"] });
		expect(files).toEqual([
			"test-files/ignored/bar.html",
			"test-files/ignored/included/file.html",
			"test-files/ignored/subdir/foo.vue",
		]);
	});

	it("validate", () => {
		expect.assertions(1);
		const cli = new CLI();
		const htmlvalidate = cli.getValidator();
		const files = cli.expandFiles(["test-files/ignored"], { extensions: ["html", "vue"] });
		const report = htmlvalidate.validateMultipleFiles(files);
		expect(report).toBeValid();
	});
});
