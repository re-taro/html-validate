import fs from "fs";
import path from "path";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import virtual from "@rollup/plugin-virtual";
import copy from "rollup-plugin-copy";
import dts from "rollup-plugin-dts";
import typescript from "@rollup/plugin-typescript";

/**
 * @typedef {import('rollup').RollupOptions} RollupOptions
 */

/** @type {string[]} */
const entrypoints = [
	"src/index.ts",
	"src/browser.ts",
	"src/cli/html-validate.ts",
	"src/matchers.ts",
	"src/transform/test-utils.ts",
];

/** @type {string[]} */
const types = [
	"dist/types/index.d.ts",
	"dist/types/browser.d.ts",
	"dist/types/matchers.d.ts",
	"dist/types/transform/test-utils.d.ts",
];

/** @type {string[]} */
const inputs = [...entrypoints, ...types];

/** @type {string[]} */
const external = [
	/* nodejs */
	"fs",
	"path",

	/* dependencies */
	"@babel/code-frame",
	"@html-validate/stylish",
	"@sidvind/better-ajv-errors",
	"ajv",
	"deepmerge",
	"glob",
	"ignore",
	"jest-diff",
	"json-merge-patch",
	"kleur",
	"minimist",
	"prompts",
];

const packageJson = fs.readFileSync(path.join(__dirname, "package.json"), "utf-8");

/**
 * @param {string} id
 * @returns {string|undefined}
 */
function manualChunks(id) {
	/** @type {string} */
	const base = path.relative(__dirname, id);
	if (inputs.includes(base)) {
		return undefined;
	}

	/** @type {string} */
	const rel = base.startsWith("src/")
		? path.relative(path.join(__dirname, "src"), id)
		: path.relative(path.join(__dirname, "dist/types"), id);

	if (rel.startsWith("cli/")) {
		return "cli";
	}

	return "core";
}

/**
 * @param {string} format
 * @returns {RollupOptions[]}
 */
function build(format) {
	const resolved = `
		import path from "path";
		export const projectRoot = path.resolve(__dirname, "../../");
		export const distFolder = path.resolve(projectRoot, "dist/${format}");
	`;
	return [
		{
			input: entrypoints,
			output: {
				dir: `dist/${format}`,
				format,
				sourcemap: true,
				manualChunks,
				chunkFileNames: "[name].js",
			},
			external,
			plugins: [
				virtual({
					"package.json": packageJson,
					"src/resolve": resolved,
				}),
				typescript({
					outDir: `dist/${format}`,
					declaration: false,
					declarationDir: undefined,
				}),
				json(),
				replace({
					preventAssignment: true,
					delimiters: ["", ""],
					values: {
						/**
						 * Fix the path from src/package.ts
						 */
						'"../package.json"': '"../../package.json"',
						/**
						 * Replace __filename global with source filename relative to dist folder
						 *
						 * @param {string} filename
						 */
						__filename: (filename) => {
							const relative = path.relative(path.join(__dirname, "src"), filename);
							return `"@/${relative}"`;
						},
					},
				}),
			],
		},
		{
			input: types,
			output: {
				dir: `dist/${format}`,
				format,
				manualChunks,
				chunkFileNames: "[name].d.ts",
			},
			plugins: [
				dts(),
				copy({
					verbose: true,
					targets: [{ src: "src/schema/*.json", dest: "dist/schema" }],
				}),
			],
		},
	];
}

/** @type {RollupOptions[]} */
export default [...build("cjs"), ...build("es")];