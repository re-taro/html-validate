export { Lexer, TokenStream, InvalidTokenError } from "./lexer";
export { TokenType } from "./token";
export type {
	Token,
	UnicodeBOMToken,
	WhitespaceToken,
	DoctypeOpenToken,
	DoctypeValueToken,
	DoctypeCloseToken,
	TagOpenToken,
	TagCloseToken,
	AttrNameToken,
	AttrValueToken,
	TextToken,
	TemplatingToken,
	ScriptToken,
	StyleToken,
	CommentToken,
	ConditionalToken,
	DirectiveToken,
	EOFToken,
} from "./token";
