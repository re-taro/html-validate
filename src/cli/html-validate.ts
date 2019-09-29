/* eslint-disable no-console, no-process-exit, sonarjs/no-duplicate-string */
import { TokenDump } from "../engine";
import { UserError } from "../error/user-error";
import { Report, Reporter, Result } from "../reporter";
import { eventFormatter } from "./json";

const pkg = require("../../package.json");

import chalk from "chalk";
import minimist from "minimist";
import { CLI } from "./cli";

enum Mode {
	LINT,
	DUMP_EVENTS,
	DUMP_TOKENS,
	DUMP_TREE,
	PRINT_CONFIG,
}

function getMode(argv: { [key: string]: any }): Mode {
	if (argv["dump-events"]) {
		return Mode.DUMP_EVENTS;
	}

	if (argv["dump-tokens"]) {
		return Mode.DUMP_TOKENS;
	}

	if (argv["dump-tree"]) {
		return Mode.DUMP_TREE;
	}

	if (argv["print-config"]) {
		return Mode.PRINT_CONFIG;
	}

	return Mode.LINT;
}

function lint(files: string[]): Report {
	const reports = files.map((filename: string) => {
		try {
			return htmlvalidate.validateFile(filename);
		} catch (err) {
			console.error(chalk.red(`Validator crashed when parsing "${filename}"`));
			throw err;
		}
	});
	return Reporter.merge(reports);
}

function dump(files: string[], mode: Mode): string {
	let lines: string[][] = [];
	switch (mode) {
		case Mode.DUMP_EVENTS:
			lines = files.map((filename: string) =>
				htmlvalidate.dumpEvents(filename).map(eventFormatter)
			);
			break;
		case Mode.DUMP_TOKENS:
			lines = files.map((filename: string) =>
				htmlvalidate.dumpTokens(filename).map((entry: TokenDump) => {
					const data = JSON.stringify(entry.data);
					return `TOKEN: ${entry.token}\n  Data: ${data}\n  Location: ${entry.location}`;
				})
			);
			break;
		case Mode.DUMP_TREE:
			lines = files.map((filename: string) => htmlvalidate.dumpTree(filename));
			break;
		default:
			throw new Error(`Unknown mode "${mode}"`);
	}
	const flat = lines.reduce((s: string[], c: string[]) => s.concat(c), []);
	return flat.join("\n");
}

function renameStdin(report: Report, filename: string): void {
	const stdin = report.results.find(
		(cur: Result) => cur.filePath === "/dev/stdin"
	);
	if (stdin) {
		stdin.filePath = filename;
	}
}

const argv: minimist.ParsedArgs = minimist(process.argv.slice(2), {
	string: [
		"c",
		"config",
		"ext",
		"f",
		"formatter",
		"h",
		"help",
		"max-warnings",
		"rule",
		"stdin-filename",
	],
	boolean: [
		"dump-events",
		"dump-tokens",
		"dump-tree",
		"print-config",
		"stdin",
		"version",
	],
	alias: {
		c: "config",
		f: "formatter",
		h: "help",
	},
	default: {
		formatter: "stylish",
	},
	unknown: (opt: string) => {
		if (opt[0] === "-") {
			process.stderr.write(`unknown option ${opt}\n`);
			process.exit(1);
		}
		return true;
	},
});

function showUsage(): void {
	process.stdout.write(`${pkg.name}-${pkg.version}
Usage: html-validate [OPTIONS] [FILENAME..] [DIR..]

Common options:
      --ext=STRING               specify file extensions (commaseparated).
  -f, --formatter=FORMATTER      specify the formatter to use.
      --max-warnings=INT         number of warnings to trigger nonzero exit code
      --rule=RULE:SEVERITY       set additional rule, use comma separator for
                                 multiple.
      --stdin                    process markup from stdin.
      --stdin-filename=STRING    specify filename to report when using stdin

Debugging options:
      --dump-events              output events during parsing.
      --dump-tokens              output tokens from lexing stage.
      --dump-tree                output nodes from the dom tree.

Miscellaneous:
  -c, --config=STRING            use custom configuration file.
      --print-config             output configuration for given file.
  -h, --help                     show help.
      --version                  show version.

Formatters:

Multiple formatters can be specified with a comma-separated list,
e.g. "json,checkstyle" to enable both.

To capture output to a file use "formatter=/path/to/file",
e.g. "checkstyle=build/html-validate.xml"
`);
}

function showVersion(): void {
	process.stdout.write(`${pkg.name}-${pkg.version}\n`);
}

if (argv.stdin) {
	argv._.push("-");
}

if (argv.version) {
	showVersion();
	process.exit();
}

if (argv.help || argv._.length === 0) {
	showUsage();
	process.exit();
}

const cli = new CLI({
	configFile: argv.config,
	rules: argv.rule,
});
const mode = getMode(argv);
const formatter = cli.getFormatter(argv.formatter);
const maxWarnings = parseInt(argv["max-warnings"] || "-1", 10);
const htmlvalidate = cli.getValidator();

/* sanity check: ensure maxWarnings has a valid value */
if (isNaN(maxWarnings)) {
	console.log(
		`Invalid value "${argv["max-warnings"]}" given to --max-warnings`
	);
	process.exit(1);
}

/* parse extensions (used when expanding directories) */
const extensions = (argv.ext || "html").split(",").map((cur: string) => {
	return cur[0] === "." ? cur.slice(1) : cur;
});

const files = cli.expandFiles(argv._, { extensions });
if (files.length === 0) {
	console.error("No files matching patterns", argv._);
	process.exit(1);
}

try {
	if (mode === Mode.LINT) {
		const result = lint(files);

		/* rename stdin if an explicit filename was passed */
		if (argv["stdin-filename"]) {
			renameStdin(result, argv["stdin-filename"]);
		}

		process.stdout.write(formatter(result));

		if (maxWarnings >= 0 && result.warningCount > maxWarnings) {
			console.log(
				`\nhtml-validate found too many warnings (maxiumum: ${maxWarnings}).`
			);
			result.valid = false;
		}

		process.exit(result.valid ? 0 : 1);
	} else if (mode === Mode.PRINT_CONFIG) {
		const config = htmlvalidate.getConfigFor(files[0]);
		const json = JSON.stringify(config.get(), null, 2);
		console.log(json);
	} else {
		const output = dump(files, mode);
		console.log(output);
		process.exit(0);
	}
} catch (err) {
	console.error(chalk.red("Caught exception:"));
	if (console.group) console.group();
	{
		console.error(err);
	}
	if (console.group) console.groupEnd();
	if (!(err instanceof UserError)) {
		const bugUrl = `${pkg.bugs.url}?issuable_template=Bug`;
		console.error(chalk.red(`This is a bug in ${pkg.name}-${pkg.version}.`));
		console.error(
			chalk.red(
				`Please file a bug at ${bugUrl}\nand include this message in full and if possible the content of the\nfile being parsed (or a reduced testcase).`
			)
		);
	}
	process.exit(1);
}
