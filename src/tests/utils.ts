import { Lexer } from "chevrotain";
import { Executor } from "../executor/Executor";
import { HUFF_MAIN_TOKENS } from "../lexer/HuffTokens";
import { UInt256 } from "../uint256";

export const LEXER = new Lexer(HUFF_MAIN_TOKENS, {
	lineTerminatorsPattern: /\n|\r|\u2028|\u2029/g,
	lineTerminatorCharacters: [
		"\n".charCodeAt(0),
		"\r".charCodeAt(0),
		"\u2028".charCodeAt(0),
		"\u2029".charCodeAt(0)
	]
});

export function getCommentFor(doc: string){
	const lexingResult = LEXER.tokenize(
		doc
	);

	const commenter = new Executor(doc, lexingResult.tokens);

	return commenter.getStackComments().slice(-1);
}

export function getAllCommentFor(doc: string){
	const lexingResult = LEXER.tokenize(
		doc
	);

	const commenter = new Executor(doc, lexingResult.tokens);

	return commenter.getStackComments();
}

export function getTokensFor(doc: string){
	const lexingResult = LEXER.tokenize(
		doc
	);

	return lexingResult.tokens;
}