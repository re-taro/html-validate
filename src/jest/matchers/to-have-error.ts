import { Message, Report } from "../../reporter";
import { diff, diverge } from "../utils";
import { flattenMessages } from "../utils/flatten-messages";

function toHaveErrorImpl(
	jest: jest.MatcherUtils,
	actual: Report,
	expected: Partial<Message>
): jest.CustomMatcherResult {
	const flattened = flattenMessages(actual);
	const matcher = [expect.objectContaining(expected)];
	const pass = jest.equals(flattened, matcher);
	const diffString = diff(matcher, flattened, { expand: jest.expand });
	const hint = jest.utils.matcherHint(".toHaveError");
	const prettyExpected = jest.utils.printExpected(matcher);
	const prettyReceived = jest.utils.printReceived(flattened);
	const resultMessage = (): string => {
		return [
			hint,
			"",
			"Expected error to equal:",
			`  ${prettyExpected}`,
			"Received:",
			`  ${prettyReceived}`,
			/* istanbul ignore next */ diffString ? `\nDifference:\n\n${diffString}` : "",
		].join("\n");
	};
	return { pass, message: resultMessage };
}

function toHaveError(
	this: jest.MatcherUtils,
	actual: Report,
	error: Partial<Message>
): jest.CustomMatcherResult;
function toHaveError(
	this: jest.MatcherUtils,
	actual: Report,
	ruleId: string,
	message: string,
	context?: any // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
): jest.CustomMatcherResult;
function toHaveError(
	this: jest.MatcherUtils,
	actual: Report,
	arg1: string | Partial<Message>,
	arg2?: string,
	arg3?: any // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
): jest.CustomMatcherResult {
	if (typeof arg1 === "string") {
		const expected: Partial<Message> = {
			ruleId: arg1,
			message: arg2,
		};
		if (arg3) {
			expected.context = arg3;
		}
		return toHaveErrorImpl(this, actual, expected);
	} else {
		return toHaveErrorImpl(this, actual, arg1);
	}
}

export default diverge(toHaveError);
