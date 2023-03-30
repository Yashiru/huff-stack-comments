import { IToken } from "chevrotain";
import { Stack } from "./Stack";
import { getMacroDefinitionIndexOf, getMacroEndIndexOf, LOGGER } from "../utils";
import { Document } from "../document/Document";
import { Executor } from "./Executor";

const keccak256 = require('keccak256');

export class VirtualExecutor extends Executor {

    constructor(document: string, tokens: IToken[], parentDocument: Document) {
        super(document, tokens, parentDocument);
    }

    public runMacro(macroDef: string, initialStack: Stack, defaultCallDepth?: number): Stack{
        this.stack.reset(initialStack.stack);
        this.callDepth = defaultCallDepth || 0;

        const defaultPtr = getMacroDefinitionIndexOf(
            this.getMacroTokenFromDef(macroDef),
            this.document.lexer.tokens,
            0
        ) + 1;

        const endPtr = getMacroEndIndexOf(
            this.getMacroTokenFromDef(macroDef),
            this.document.lexer.tokens,
            0
        );

        for (this.ptr = defaultPtr; this.ptr < endPtr; this.ptr++) {
            
            this.interpret(this.document.lexer.tokens[this.ptr]);
            
            if(this.ptr === defaultPtr){
                this.lastMacros.slice(-1)[0].returns = this.stack.stack.length;
            }

            if(this.ptr === endPtr){
                break;
            }
        }

        return this.stack;
    }

    private getMacroTokenFromDef(macroDef: string): IToken {
        for(let t of this.document.lexer.tokens){
            if(t.tokenType.name === "defineMacro" && t.image.indexOf(macroDef) !== -1){
                return t;
            }
        }

        return null!;
    }
}