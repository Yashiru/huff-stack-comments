import { IToken, Lexer } from "chevrotain";
import { HuffMacro } from "./interfaces/HuffMacro";
import { HUFF_CHILDREN_TOKENS } from "./lexer/HuffTokens";
import { UInt256, uint256 } from "./uint256/uint256";
const keccak256 = require('keccak256');

export const tokenLexer = new Lexer(HUFF_CHILDREN_TOKENS, {
    positionTracking: "onlyOffset"
});

export function getMacroDefinitionIndexOf(target: IToken, tokens: IToken[], defaultPtr: number): number {
    const regex = /.*\(/g;
    let i = 0;
    for (let token of tokens) {
        if (
            token.image.indexOf(target.image.match(regex)![0]) !== -1 &&
            token.image.indexOf("#define macro") !== -1
        ) {
            return i === 0 ? 0 : i - 1;
        }
        i++;
    }
    return defaultPtr;
}

export function getDefinition(target: IToken, defType: string, tokens: IToken[]): string {
    const regex = /\(.*\)/g;
    let i = 0;
    for (let token of tokens) {
        const def = target.image.match(regex)![0];
        if (
            token.image.indexOf(def.slice(1, def.length - 1)) !== -1 &&
            token.image.indexOf("#define " + defType) !== -1
        ) {
            return token.image.match(/[0-9a-zA-Z_]*\([0-9a-z, ]*\)/)![0].replace(" ", "");
        }
        i++;
    }
    return getParenthesisContent(target.image);
}

export function getSignatureOf(def: string) {
    return "0x" + uint256(
        keccak256(def).reverse().buffer
    ).toString(16).slice(0, 8);
}

export function getParenthesisContent(expr: string) {
    const regex = /\(.*\)/g;
    let val = expr.match(regex);
    if (val !== null && val !== undefined && val.length > 0) {
        return val[0].slice(1, val[0].length - 1);
    }
    else {
        return expr;
    }
}

export function getJumptableName(def: string): string {
    const regex = /#define jumptable [0-9a-zA-Z_]*/;
    const res = def.match(regex);
    if (res !== null && res !== undefined && res.length > 0) {
        return res[0].slice(18, res.length);
    }
    else {
        return def;
    }
}

export function getHuffMacro(t: IToken): HuffMacro {
    
    const lexedToken = tokenLexer.tokenize(
        t.image
    );

    const name: string = lexedToken.tokens[0].image.replace(" ", "").slice(
        0,
        lexedToken.tokens[0].image.length - 1
    );
    const takes: number = parseInt(
        lexedToken.tokens[1].image.replace(" ", "").slice(
            6,
            lexedToken.tokens[1].image.length - 1
        )
    );
    const returns: number = parseInt(
        lexedToken.tokens[2].image.replace(" ", "").slice(
            8,
            lexedToken.tokens[2].image.length - 1
        )
    );

    return {
        name,
        takes,
        returns
    };
}