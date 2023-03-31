import { IToken } from "chevrotain";
import { Stack } from "./Stack";
import { getHuffMacro, getMacroDefinitionIndexOf, getMacroEndIndexOf, LOGGER } from "../utils";
import { Document } from "../document/Document";
import { Executor } from "./Executor";


export class VirtualExecutor extends Executor {
    private owner: Document;

    constructor(text: string, tokens: IToken[], document: Document, owner: Document, defaultStack: Stack) {
        super(text, tokens, document);
        this.stack = defaultStack;
        this.owner = owner;
    }

    public runMacro(macroDef: string, defaultCallDepth?: number): Stack{
        this.callDepth = defaultCallDepth || 0;

        let defaultPtr = getMacroDefinitionIndexOf(
            this.getMacroTokenFromDef(macroDef),
            this.document.lexer.tokens,
            0
        );

        defaultPtr = defaultPtr === 0 ? 0 : defaultPtr + 1;

        const endPtr = getMacroEndIndexOf(
            this.getMacroTokenFromDef(macroDef),
            this.document.lexer.tokens,
            0
        ) + 1;

        const initialMacro = getHuffMacro(
            this.getMacroTokenFromDef(macroDef)
        );
        this.stack.cache(initialMacro.takes);

        for (this.ptr = defaultPtr; this.ptr < endPtr; this.ptr++) {
            
            this.interpret(this.document.lexer.tokens[this.ptr]);
            
            if(this.ptr === defaultPtr){
                this.lastMacros.slice(-1)[0].returns = this.stack.stack.length;
            }

            if(this.ptr === endPtr){
                break;
            }
        }
        
        // Need to pop the owner document's executor lastMacro
        this.owner.executor.lastMacros.pop();

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