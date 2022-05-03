import kleur from "kleur";
import { toMatchSnapshot } from "jest-snapshot";
import { Context } from "jest-snapshot/build/types";
import { codeframe, type CodeframeOptions } from "../../formatters/codeframe";
import { Report } from "../../reporter";

const options: CodeframeOptions = {
	showLink: false,
	showSummary: false,
	showSelector: true,
};

function toMatchCodeframe(
	this: jest.MatcherContext,
	report: Report,
	...rest: Array<string | object>
): jest.CustomMatcherResult {
	const enabled = kleur.enabled;
	kleur.enabled = false;
	const snapshot = codeframe(report.results, options).replace(/\s+$/gm, "");
	kleur.enabled = enabled;
	return toMatchSnapshot.call(this as Context, snapshot, ...rest);
}

export default toMatchCodeframe;
