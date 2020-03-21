import { RuleConstructor } from "../rule";
import AttrCase from "./attr-case";
import AttributeAllowedValues from "./attribute-allowed-values";
import AttributeBooleanStyle from "./attribute-boolean-style";
import AttributeEmptyStyle from "./attribute-empty-style";
import AttrQuotes from "./attr-quotes";
import ClassPattern from "./class-pattern";
import CloseAttr from "./close-attr";
import CloseOrder from "./close-order";
import DeprecatedRule from "./deprecated-rule";
import Deprecated from "./deprecated";
import DoctypeHtml from "./doctype-html";
import ElementCase from "./element-case";
import ElementName from "./element-name";
import ElementPermittedContent from "./element-permitted-content";
import ElementPermittedOccurrences from "./element-permitted-occurrences";
import ElementPermittedOrder from "./element-permitted-order";
import ElementRequiredAttributes from "./element-required-attributes";
import ElementRequiredContent from "./element-required-content";
import EmptyHeading from "./empty-heading";
import EmptyTitle from "./empty-title";
import HeadingLevel from "./heading-level";
import IdPattern from "./id-pattern";
import InputMissingLabel from "./input-missing-label";
import LongTitle from "./long-title";
import MetaRefresh from "./meta-refresh";
import MissingDoctype from "./missing-doctype";
import NoConditionalComment from "./no-conditional-comment";
import NoDeprecatedAttr from "./no-deprecated-attr";
import NoDupAttr from "./no-dup-attr";
import NoDupClass from "./no-dup-class";
import NoDupId from "./no-dup-id";
import NoImplicitClose from "./no-implicit-close";
import NoInlineStyle from "./no-inline-style";
import NoMissingReferences from "./no-missing-references";
import NoRawCharacters from "./no-raw-characters";
import NoRedundantRole from "./no-redundant-role";
import NoSelfClosing from "./no-self-closing";
import NoStyleTag from "./no-style-tag";
import NoTrailingWhitespace from "./no-trailing-whitespace";
import NoUnknownElements from "./no-unknown-elements";
import PreferButton from "./prefer-button";
import PreferNativeElement from "./prefer-native-element";
import PreferTbody from "./prefer-tbody";
import RequireSri from "./require-sri";
import ScriptElement from "./script-element";
import ScriptType from "./script-type";
import SvgFocusable from "./svg-focusable";
import UnrecognizedCharRef from "./unrecognized-char-ref";
import VoidContent from "./void-content";
import VoidStyle from "./void-style";
import Void from "./void";
import WCAG from "./wcag";

const bundledRules: Record<string, RuleConstructor<any, any>> = {
	"attr-case": AttrCase,
	"attribute-allowed-values": AttributeAllowedValues,
	"attribute-boolean-style": AttributeBooleanStyle,
	"attribute-empty-style": AttributeEmptyStyle,
	"attr-quotes": AttrQuotes,
	"class-pattern": ClassPattern,
	"close-attr": CloseAttr,
	"close-order": CloseOrder,
	"deprecated-rule": DeprecatedRule,
	deprecated: Deprecated,
	"doctype-html": DoctypeHtml,
	"element-case": ElementCase,
	"element-name": ElementName,
	"element-permitted-content": ElementPermittedContent,
	"element-permitted-occurrences": ElementPermittedOccurrences,
	"element-permitted-order": ElementPermittedOrder,
	"element-required-attributes": ElementRequiredAttributes,
	"element-required-content": ElementRequiredContent,
	"empty-heading": EmptyHeading,
	"empty-title": EmptyTitle,
	"heading-level": HeadingLevel,
	"id-pattern": IdPattern,
	"input-missing-label": InputMissingLabel,
	"long-title": LongTitle,
	"meta-refresh": MetaRefresh,
	"missing-doctype": MissingDoctype,
	"no-conditional-comment": NoConditionalComment,
	"no-deprecated-attr": NoDeprecatedAttr,
	"no-dup-attr": NoDupAttr,
	"no-dup-class": NoDupClass,
	"no-dup-id": NoDupId,
	"no-implicit-close": NoImplicitClose,
	"no-inline-style": NoInlineStyle,
	"no-missing-references": NoMissingReferences,
	"no-raw-characters": NoRawCharacters,
	"no-redundant-role": NoRedundantRole,
	"no-self-closing": NoSelfClosing,
	"no-style-tag": NoStyleTag,
	"no-trailing-whitespace": NoTrailingWhitespace,
	"no-unknown-elements": NoUnknownElements,
	"prefer-button": PreferButton,
	"prefer-native-element": PreferNativeElement,
	"prefer-tbody": PreferTbody,
	"require-sri": RequireSri,
	"script-element": ScriptElement,
	"script-type": ScriptType,
	"svg-focusable": SvgFocusable,
	"unrecognized-char-ref": UnrecognizedCharRef,
	"void-content": VoidContent,
	"void-style": VoidStyle,
	void: Void,
	...WCAG,
};

export default bundledRules;
