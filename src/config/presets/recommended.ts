import { ConfigData } from "../config-data";

const config: ConfigData = {
	rules: {
		"aria-label-misuse": "error",
		"attr-case": "error",
		"attr-delimiter": "error",
		"attr-quotes": "error",
		"attr-spacing": "error",
		"attribute-allowed-values": "error",
		"attribute-boolean-style": "error",
		"attribute-empty-style": "error",
		"close-attr": "error",
		"close-order": "error",
		deprecated: "error",
		"deprecated-rule": "warn",
		"doctype-html": "error",
		"doctype-style": "error",
		"element-case": "error",
		"element-name": "error",
		"element-permitted-content": "error",
		"element-permitted-occurrences": "error",
		"element-permitted-order": "error",
		"element-required-attributes": "error",
		"element-required-content": "error",
		"empty-heading": "error",
		"empty-title": "error",
		"input-attributes": "error",
		"long-title": "error",
		"meta-refresh": "error",
		"multiple-labeled-controls": "error",
		"no-autoplay": ["error", { include: ["audio", "video"] }],
		"no-conditional-comment": "error",
		"no-deprecated-attr": "error",
		"no-dup-attr": "error",
		"no-dup-class": "error",
		"no-dup-id": "error",
		"no-implicit-close": "error",
		"no-inline-style": "error",
		"no-multiple-main": "error",
		"no-raw-characters": "error",
		"no-redundant-for": "error",
		"no-redundant-role": "error",
		"no-self-closing": "error",
		"no-trailing-whitespace": "error",
		"no-utf8-bom": "error",
		"prefer-button": "error",
		"prefer-native-element": "error",
		"prefer-tbody": "error",
		"script-element": "error",
		"script-type": "error",
		"svg-focusable": "error",
		"text-content": "error",
		"unrecognized-char-ref": "error",
		void: "off",
		"void-content": "error",
		"void-style": "error",
		"wcag/h30": "error",
		"wcag/h32": "error",
		"wcag/h36": "error",
		"wcag/h37": "error",
		"wcag/h67": "error",
		"wcag/h71": "error",
	},
};

export default config;
