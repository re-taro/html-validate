import { Severity } from "./config";
import { Location, Source } from "./context";
import { Rule } from "./rule";

/**
 * Reported error message.
 */
export interface Message {
	/** Rule that triggered this message */
	ruleId: string;

	/** Severity of the message */
	severity: number;

	/** Message text */
	message: string;

	/** Offset (number of characters) into the source */
	offset: number;

	/** Line number */
	line: number;

	/** Column number */
	column: number;

	/** From start offset, how many characters is this message relevant for */
	size: number;

	/**
	 * Optional error context used to provide context-aware documentation.
	 *
	 * This context can be passed to [[HtmlValidate#getRuleDocumentation]].
	 */
	context?: any;
}

export interface Result {
	messages: Message[];
	filePath: string;
	errorCount: number;
	warningCount: number;
	source?: string;
}

/**
 * Report object returned by [[HtmlValidate]].
 */
export interface Report {
	/** `true` if validation was successful */
	valid: boolean;

	/** Detailed results per validated source */
	results: Result[];
}

export class Reporter {
	protected result: { [filename: string]: Message[] };

	constructor() {
		this.result = {};
	}

	/**
	 * Merge two or more reports into a single one.
	 */
	public static merge(reports: Report[]): Report {
		const valid = reports.every(report => report.valid);
		const merged: { [key: string]: Result } = {};
		reports.forEach((report: Report) => {
			report.results.forEach((result: Result) => {
				const key = result.filePath;
				if (key in merged) {
					merged[key].messages = [].concat(
						merged[key].messages,
						result.messages
					);
				} else {
					merged[key] = Object.assign({}, result);
				}
			});
		});
		return { valid, results: Object.keys(merged).map(key => merged[key]) };
	}

	public add(
		rule: Rule,
		message: string,
		severity: number,
		location: Location,
		context?: any
	): void {
		if (!(location.filename in this.result)) {
			this.result[location.filename] = [];
		}
		this.result[location.filename].push({
			ruleId: rule.name,
			severity,
			message,
			offset: location.offset,
			line: location.line,
			column: location.column,
			size: location.size || 0,
			context,
		});
	}

	public addManual(filename: string, message: Message): void {
		if (!(filename in this.result)) {
			this.result[filename] = [];
		}
		this.result[filename].push(message);
	}

	public save(sources?: Source[]): Report {
		return {
			valid: this.isValid(),
			results: Object.keys(this.result).map(filePath => {
				const messages = [].concat(this.result[filePath]).sort(messageSort);
				const source = (sources || []).find(
					(source: Source) => source.filename === filePath
				);
				return {
					filePath,
					messages,
					errorCount: countErrors(messages),
					warningCount: countWarnings(messages),
					source: source ? source.originalData || source.data : null,
				};
			}),
		};
	}

	protected isValid(): boolean {
		const numErrors = Object.values(this.result).reduce((sum, messages) => {
			return sum + countErrors(messages);
		}, 0);
		return numErrors === 0;
	}
}

function countErrors(messages: Message[]): number {
	return messages.filter(m => m.severity === Severity.ERROR).length;
}

function countWarnings(messages: Message[]): number {
	return messages.filter(m => m.severity === Severity.WARN).length;
}

function messageSort(a: Message, b: Message): number {
	if (a.line < b.line) {
		return -1;
	}

	if (a.line > b.line) {
		return 1;
	}

	if (a.column < b.column) {
		return -1;
	}

	if (a.column > b.column) {
		return 1;
	}

	return 0;
}

export default Reporter;
