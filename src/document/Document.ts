import { ILexingResult, IToken, Lexer } from 'chevrotain';
import { Executor } from '../executor/Executor';
import { HUFF_FULL_MACRO_TOKENS, HUFF_MAIN_TOKENS } from '../lexer/HuffTokens';
import { LexicErrorHandler } from '../lexer/LexicErrorHandler';
import { Stack } from '../executor/Stack';
import * as vscode from 'vscode';
import * as path from "path";

export class Document{
    // Vs code current editor (Only for the main parent Document)
    private editor: vscode.TextEditor | undefined;

    // The Huff pseudo executor
    private executor: Executor = undefined!;

    // The included children Document (Huff #includes)
    private includedDocs: Document[] = [];

    // The document content lexing result 
    public lexer: ILexingResult = undefined!;

    // All the document texts lines
    public lines: string[] = [];

    public rawContent: string;

    constructor(docText?: string){
        this.editor = vscode.window.activeTextEditor;

        this.rawContent = docText ? docText : this.editor ? this.editor.document.getText() : "";

        // Tokenize document
        const lexer = new Lexer(HUFF_MAIN_TOKENS);
        this.lexer = lexer.tokenize(this.rawContent);

        // Handle lexing errors
        LexicErrorHandler.handleErrors(this.lexer.errors);
        
        // Generate stack comments
        this.executor = new Executor(this.rawContent, this.lexer.tokens, this);
    }

    public async prepare(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            for(let include of this.getIncludedFilesPath()){
                const currentPath = 
                    this.editor?.document.uri.path.slice(
                        0,
                        this.editor?.document.uri.path.lastIndexOf("/")
                    );

                const includeFullPath = path.join(
                    currentPath!,
                    include
                );
                
                const doc = await vscode.workspace.openTextDocument(includeFullPath);
                const includedDoc = new Document(doc.getText());
                await includedDoc.prepare();
                this.includedDocs.push(
                    includedDoc
                );
            }
            resolve();
        });
    }

    public generateComments(){
        this.executor.generateStackComments();


        this.editor!.edit(editBuilder => {
            const start = new vscode.Position(0, 0);
            const end = new vscode.Position(Infinity, Infinity);
            const range = new vscode.Range(start, end);
            editBuilder.replace(range, this.lines.join("\n"));
        });
    }

    public getComments(){
        return this.executor.getStackComments();
    }

    public executeExternalMacro(t: IToken, initialStack: Stack): string[]{
        // Lexer that parse the full implementation of macros
        const macroLexer = new Lexer(HUFF_FULL_MACRO_TOKENS);
        const lexer = new Lexer(HUFF_MAIN_TOKENS);

        let fullMacro = "";

        for(let doc of this.includedDocs){
            const lexingRes = macroLexer.tokenize(doc.rawContent);

            for(let _t of lexingRes.tokens){
                const macroName = "#define macro " + t.image.slice(
                    0,
                    t.image.indexOf("(")
                );
                if(_t.image.indexOf(macroName) !== -1){
                    fullMacro = _t.image;
                    break;
                }
            }
        }

        if(fullMacro.length === 0){
            return initialStack.stack;
        }

        const tempDoc = new Document(fullMacro);
        const tempExecutor = new Executor(fullMacro, lexer.tokenize(fullMacro).tokens, tempDoc);
        return tempExecutor.getOutputStack(initialStack, 1).stack;
    }

    private getIncludedFilesPath(){
        const includes = this.lexer.tokens.filter((token) => {
            return token.tokenType.name === "include";
        });

        return includes.map((token) => {
            return token.image
                .replace("#include", "")
                .replace(/ /g, "")
                .replace(/'/g, "")
                .replace(/\"/g, "")
                .replace(/`/g, "");
        });
    }
}