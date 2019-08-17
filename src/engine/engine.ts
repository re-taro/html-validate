import { Config, Severity } from "../config";
import { Location, Source } from "../context";
import { HtmlElement } from "../dom";
import { DirectiveEvent, TagCloseEvent, TagOpenEvent } from "../event";
import { InvalidTokenError, Lexer, TokenType } from "../lexer";
import { Parser } from "../parser";
import { Report, Reporter } from "../reporter";
import { Rule, RuleConstructor, RuleDocumentation, RuleOptions } from "../rule";

export interface EventDump {
	event: string;
	data: any;
}

export interface TokenDump {
	token: string;
	data: string;
	location: string;
}

export class Engine<T extends Parser = Parser> {
	protected report: Reporter;
	protected config: Config;
	protected ParserClass: new (config: Config) => T;
	protected availableRules: { [key: string]: RuleConstructor };

	public constructor(config: Config, ParserClass: new (config: Config) => T) {
		this.report = new Reporter();
		this.config = config;
		this.ParserClass = ParserClass;

		/* initialize plugins and rules */
		const result = this.initPlugins(this.config);
		this.availableRules = result.availableRules;
	}

	/**
	 * Lint sources and return report
	 *
	 * @param src {object} - Parse source.
	 * @param src.data {string} - Text HTML data.
	 * @param src.filename {string} - Filename of source for presentation in report.
	 * @return {object} - Report output.
	 */
	public lint(sources: Source[]): Report {
		for (const source of sources) {
			/* create parser for source */
			const parser = new this.ParserClass(this.config);

			/* setup plugins and rules */
			const { rules } = this.setupPlugins(source, this.config, parser);

			/* setup directive handling */
			parser.on("directive", (_: string, event: DirectiveEvent) => {
				this.processDirective(event, parser, rules);
			});

			/* parse token stream */
			try {
				parser.parseHtml(source);
			} catch (e) {
				if (e instanceof InvalidTokenError) {
					this.reportError("parser-error", e.message, e.location);
				} else {
					throw e;
				}
			}
		}

		/* generate results from report */
		return this.report.save(sources);
	}

	public dumpEvents(source: Source[]): EventDump[] {
		const parser = new Parser(this.config);
		const lines: EventDump[] = [];
		parser.on("*", (event, data) => {
			lines.push({ event, data });
		});
		source.forEach(src => parser.parseHtml(src));
		return lines;
	}

	public dumpTokens(source: Source[]): TokenDump[] {
		const lexer = new Lexer();
		const lines: TokenDump[] = [];
		for (const src of source) {
			for (const token of lexer.tokenize(src)) {
				const data = token.data ? token.data[0] : null;
				lines.push({
					token: TokenType[token.type],
					data,
					location: `${token.location.filename}:${token.location.line}:${token.location.column}`,
				});
			}
		}
		return lines;
	}

	public dumpTree(source: Source[]): string[] {
		/* @todo handle dumping each tree */
		const parser = new Parser(this.config);
		const dom = parser.parseHtml(source[0]);
		const lines: string[] = [];

		function decoration(node: HtmlElement): string {
			let output = "";
			if (node.hasAttribute("id")) {
				output += `#${node.id}`;
			}
			if (node.hasAttribute("class")) {
				output += `.${node.classList.join(".")}`;
			}
			return output;
		}

		function writeNode(
			node: HtmlElement,
			level: number,
			sibling: number
		): void {
			if (level > 0) {
				const indent = "  ".repeat(level - 1);
				const l = node.childElements.length > 0 ? "┬" : "─";
				const b = sibling < node.parent.childElements.length - 1 ? "├" : "└";
				lines.push(`${indent}${b}─${l} ${node.tagName}${decoration(node)}`);
			} else {
				lines.push("(root)");
			}

			node.childElements.forEach((child, index) =>
				writeNode(child, level + 1, index)
			);
		}

		writeNode(dom.root, 0, 0);
		return lines;
	}

	/**
	 * Get rule documentation.
	 */
	public getRuleDocumentation(
		ruleId: string,
		context?: any
	): RuleDocumentation {
		const rules = this.config.getRules();
		if (rules.has(ruleId)) {
			const [, options] = rules.get(ruleId) as any;
			const rule = this.instantiateRule(ruleId, options);
			return rule.documentation(context);
		} else {
			return null;
		}
	}

	private processDirective(
		event: DirectiveEvent,
		parser: Parser,
		allRules: { [key: string]: Rule }
	): void {
		const rules = event.data
			.split(",")
			.map(name => name.trim())
			.map(name => allRules[name])
			.filter(rule => rule); /* filter out missing rules */
		switch (event.action) {
			case "enable":
				this.processEnableDirective(rules, parser);
				break;
			case "disable":
				this.processDisableDirective(rules, parser);
				break;
			case "disable-block":
				this.processDisableBlockDirective(rules, parser);
				break;
			case "disable-next":
				this.processDisableNextDirective(rules, parser);
				break;
			default:
				this.reportError(
					"parser-error",
					`Unknown directive "${event.action}"`,
					event.location
				);
				break;
		}
	}

	private processEnableDirective(rules: Rule[], parser: Parser): void {
		for (const rule of rules) {
			rule.setEnabled(true);
			if (rule.getSeverity() === Severity.DISABLED) {
				rule.setServerity(Severity.ERROR);
			}
		}

		/* enable rules on node */
		parser.on("tag:open", (event: string, data: TagOpenEvent) => {
			data.target.enableRules(rules.map(rule => rule.name));
		});
	}

	private processDisableDirective(rules: Rule[], parser: Parser): void {
		for (const rule of rules) {
			rule.setEnabled(false);
		}

		/* disable rules on node */
		parser.on("tag:open", (event: string, data: TagOpenEvent) => {
			data.target.disableRules(rules.map(rule => rule.name));
		});
	}

	private processDisableBlockDirective(rules: Rule[], parser: Parser): void {
		let directiveBlock: number = null;
		for (const rule of rules) {
			rule.setEnabled(false);
		}

		const unregisterOpen = parser.on(
			"tag:open",
			(event: string, data: TagOpenEvent) => {
				/* wait for a tag to open and find the current block by using its parent */
				if (directiveBlock === null) {
					directiveBlock = data.target.parent.unique;
				}

				/* disable rules directly on the node so it will be recorded for later,
				 * more specifically when using the domtree to trigger errors */
				data.target.disableRules(rules.map(rule => rule.name));
			}
		);

		const unregisterClose = parser.on(
			"tag:close",
			(event: string, data: TagCloseEvent) => {
				/* if the directive is the last thing in a block no id would be set */
				const lastNode = directiveBlock === null;

				/* test if the block is being closed by checking the parent of the block
				 * element is being closed */
				const parentClosed = directiveBlock === data.previous.unique;

				/* remove listeners and restore state */
				if (lastNode || parentClosed) {
					unregisterClose();
					unregisterOpen();
					for (const rule of rules) {
						rule.setEnabled(true);
					}
					return;
				}
			}
		);
	}

	private processDisableNextDirective(rules: Rule[], parser: Parser): void {
		for (const rule of rules) {
			rule.setEnabled(false);
		}

		/* disable rules directly on the node so it will be recorded for later,
		 * more specifically when using the domtree to trigger errors */
		const unregister = parser.on(
			"tag:open",
			(event: string, data: TagOpenEvent) => {
				data.target.disableRules(rules.map(rule => rule.name));
			}
		);

		/* disable directive after next event occurs */
		parser.once("tag:open, tag:close, attr", () => {
			unregister();
			parser.defer(() => {
				for (const rule of rules) {
					rule.setEnabled(true);
				}
			});
		});
	}

	/*
	 * Initialize all plugins. This should only be done once for all sessions.
	 */
	protected initPlugins(
		config: Config
	): {
		availableRules: { [key: string]: RuleConstructor };
	} {
		for (const plugin of config.getPlugins()) {
			if (plugin.init) {
				plugin.init();
			}
		}

		return {
			availableRules: this.initRules(config),
		};
	}

	/**
	 * Initializes all rules from plugins and returns an object with a mapping
	 * between rule name and its constructor.
	 */
	protected initRules(config: Config): { [key: string]: RuleConstructor } {
		const availableRules: { [key: string]: RuleConstructor } = {};
		for (const plugin of config.getPlugins()) {
			for (const [name, rule] of Object.entries(plugin.rules || {})) {
				availableRules[name] = rule;
			}
		}
		return availableRules;
	}

	/**
	 * Setup all plugins for this session.
	 */
	protected setupPlugins(
		source: Source,
		config: Config,
		parser: Parser
	): {
		rules: { [key: string]: Rule };
	} {
		const eventHandler = parser.getEventHandler();
		for (const plugin of config.getPlugins()) {
			if (plugin.setup) {
				plugin.setup(source, eventHandler);
			}
		}

		return {
			rules: this.setupRules(config, parser),
		};
	}

	/**
	 * Load and setup all rules for current configuration.
	 */
	protected setupRules(
		config: Config,
		parser: Parser
	): { [key: string]: Rule } {
		const rules: { [key: string]: Rule } = {};
		for (const [ruleId, [severity, options]] of config.getRules().entries()) {
			rules[ruleId] = this.loadRule(
				ruleId,
				severity,
				options,
				parser,
				this.report
			);
		}
		return rules;
	}

	/**
	 * Load and setup a rule using current config.
	 */
	protected loadRule(
		ruleId: string,
		severity: Severity,
		options: any,
		parser: Parser,
		report: Reporter
	): Rule {
		const rule = this.instantiateRule(ruleId, options);
		rule.name = rule.name || ruleId;
		rule.init(parser, report, severity);

		/* call setup callback if present */
		if (rule.setup) {
			rule.setup();
		}

		return rule;
	}

	protected instantiateRule(name: string, options: RuleOptions): Rule {
		if (this.availableRules[name]) {
			return new this.availableRules[name](options);
		} else {
			return this.requireRule(name, options) || this.missingRule(name);
		}
	}

	/* istanbul ignore next: tests mock this function */
	protected requireRule(name: string, options: RuleOptions): any {
		const moduleName = `../rules/${name}`;
		try {
			require.resolve(moduleName);
		} catch (err) {
			return null;
		}
		const Class = require(moduleName);
		return new Class(options);
	}

	private missingRule(name: string): any {
		return new (class extends Rule {
			public setup(): void {
				this.on("dom:load", () => {
					this.report(null, `Definition for rule '${name}' was not found`);
				});
			}
		})({});
	}

	private reportError(
		ruleId: string,
		message: string,
		location: Location
	): void {
		this.report.addManual(location.filename, {
			ruleId,
			severity: Severity.ERROR,
			message,
			offset: location.offset,
			line: location.line,
			column: location.column,
			size: location.size || 0,
		});
	}
}
