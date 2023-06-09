import { Lexer } from "chevrotain";
import { Document } from "../Document/Document";
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
	const document = new Document(doc);
	return document.getComments().slice(-1);
}

export function getAllCommentFor(doc: string){
	const document = new Document(doc);
	return document.getComments();
}

export function getTokensFor(doc: string){
	const lexingResult = LEXER.tokenize(
		doc
	);

	return lexingResult.tokens;
}