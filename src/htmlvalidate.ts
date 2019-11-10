import { Config, ConfigData, ConfigLoader } from "./config";
import { Source } from "./context";
import { SourceHooks } from "./context/source";
import { Engine, EventDump, TokenDump } from "./engine";
import { Parser } from "./parser";
import { Report, Reporter } from "./reporter";
import { RuleDocumentation } from "./rule";

/**
 * Primary API for using HTML-validate.
 *
 * Provides high-level abstractions for common operations.
 */
class HtmlValidate {
	private globalConfig: Config;
	protected configLoader: ConfigLoader;

	/**
	 * Create a new validator.
	 *
	 * @param config - If set it provides the global default configuration. By
	 * default `Config.defaultConfig()` is used.
	 */
	public constructor(config?: ConfigData) {
		const defaults = Config.empty();
		this.globalConfig = defaults.merge(
			config ? Config.fromObject(config) : Config.defaultConfig()
		);
		this.configLoader = new ConfigLoader(Config);
	}

	/**
	 * Parse and validate HTML from string.
	 *
	 * @param str - Text to parse.
	 * @param filename - If set configuration is loaded for given filename.
	 * @param hooks - Optional hooks (see [[Source]]) for definition.
	 * @returns Report output.
	 */
	public validateString(
		str: string,
		filename?: string,
		hooks?: SourceHooks
	): Report {
		const source = {
			column: 1,
			data: str,
			filename: filename || "inline",
			line: 1,
			hooks,
		};
		return this.validateSource(source);
	}

	/**
	 * Parse and validate HTML from [[Source]].
	 *
	 * @param input - Source to parse.
	 * @returns Report output.
	 */
	public validateSource(input: Source): Report {
		const config = this.getConfigFor(input.filename);
		const source = config.transformSource(input);
		const engine = new Engine(config, Parser);
		return engine.lint(source);
	}

	/**
	 * Parse and validate HTML from file.
	 *
	 * @param filename - Filename to read and parse.
	 * @returns Report output.
	 */
	public validateFile(filename: string): Report {
		const config = this.getConfigFor(filename);
		const source = config.transformFilename(filename);
		const engine = new Engine(config, Parser);
		return engine.lint(source);
	}

	/**
	 * Parse and validate HTML from multiple files. Result is merged together to a
	 * single report.
	 *
	 * @param filenames - Filenames to read and parse.
	 * @returns Report output.
	 */
	public validateMultipleFiles(filenames: string[]): Report {
		return Reporter.merge(
			filenames.map(filename => this.validateFile(filename))
		);
	}

	/**
	 * Tokenize filename and output all tokens.
	 *
	 * Using CLI this is enabled with `--dump-tokens`. Mostly useful for
	 * debugging.
	 *
	 * @param filename - Filename to tokenize.
	 */
	public dumpTokens(filename: string): TokenDump[] {
		const config = this.getConfigFor(filename);
		const source = config.transformFilename(filename);
		const engine = new Engine(config, Parser);
		return engine.dumpTokens(source);
	}

	/**
	 * Parse filename and output all events.
	 *
	 * Using CLI this is enabled with `--dump-events`. Mostly useful for
	 * debugging.
	 *
	 * @param filename - Filename to dump events from.
	 */
	public dumpEvents(filename: string): EventDump[] {
		const config = this.getConfigFor(filename);
		const source = config.transformFilename(filename);
		const engine = new Engine(config, Parser);
		return engine.dumpEvents(source);
	}

	/**
	 * Parse filename and output DOM tree.
	 *
	 * Using CLI this is enabled with `--dump-tree`. Mostly useful for
	 * debugging.
	 *
	 * @param filename - Filename to dump DOM tree from.
	 */
	public dumpTree(filename: string): string[] {
		const config = this.getConfigFor(filename);
		const source = config.transformFilename(filename);
		const engine = new Engine(config, Parser);
		return engine.dumpTree(source);
	}

	/**
	 * Transform filename and output source data.
	 *
	 * Using CLI this is enabled with `--dump-source`. Mostly useful for
	 * debugging.
	 *
	 * @param filename - Filename to dump source from.
	 */
	public dumpSource(filename: string): string[] {
		const config = this.getConfigFor(filename);
		const sources = config.transformFilename(filename);
		return sources.reduce((result: string[], source: Source) => {
			result.push(`Source ${source.filename}@${source.line}:${source.column}`);
			result.push("---");
			result = result.concat(source.data.split("\n"));
			result.push("---");
			return result;
		}, [] as string[]);
	}

	/**
	 * Get contextual documentation for the given rule.
	 *
	 * Typical usage:
	 *
	 * ```js
	 * const report = htmlvalidate.validateFile("my-file.html");
	 * for (const result of report.results){
	 *   const config = htmlvalidate.getConfigFor(result.filePath);
	 *   for (const message of result.messages){
	 *     const documentation = htmlvalidate.getRuleDocumentation(message.ruleId, config, message.context);
	 *     // do something with documentation
	 *   }
	 * }
	 * ```
	 *
	 * @param ruleId - Rule to get documentation for.
	 * @param config - If set it provides more accurate description by using the
	 * correct configuration for the file.
	 * @param context - If set to `Message.context` some rules can provide
	 * contextual details and suggestions.
	 */
	public getRuleDocumentation(
		ruleId: string,
		config?: Config,
		context?: any
	): RuleDocumentation {
		const engine = new Engine(config || this.getConfigFor("inline"), Parser);
		return engine.getRuleDocumentation(ruleId, context);
	}

	/**
	 * Create a parser configured for given filename.
	 *
	 * @param source - Source to use.
	 */
	public getParserFor(source: Source): Parser {
		const config = this.getConfigFor(source.filename);
		return new Parser(config);
	}

	/**
	 * Get configuration for given filename.
	 *
	 * @param filename - Filename to get configuration for.
	 */
	public getConfigFor(filename: string): Config {
		/* special case when the global configuration is marked as root, should not
		 * try to load and more configuration files */
		if (this.globalConfig.isRootFound()) {
			return this.globalConfig;
		}

		const config = this.configLoader.fromTarget(filename);
		const merged = this.globalConfig.merge(config);
		merged.init();
		return merged;
	}

	/**
	 * Flush configuration cache. Clears full cache unless a filename is given.
	 *
	 * @param filename - If set, only flush cache for given filename.
	 */
	public flushConfigCache(filename?: string): void {
		this.configLoader.flush(filename);
	}
}

export default HtmlValidate;
