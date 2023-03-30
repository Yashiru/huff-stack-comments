import { ILexingResult, IToken, Lexer } from 'chevrotain';
import { Executor } from '../executor/Executor';
import { HUFF_FULL_MACRO_TOKENS, HUFF_MAIN_TOKENS } from '../lexer/HuffTokens';
import { ErrorHandler } from '../lexer/LexicErrorHandler';
import { Stack } from '../executor/Stack';
import * as vscode from 'vscode';
import * as path from "path";
import { VirtualExecutor } from '../executor/VirtualExecutor';
import { extractMacroName, getHuffMacro, LOGGER } from '../utils';

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
    public name: string = "";
    public path: string;

    constructor(path?: string, docText?: string){
        this.editor = vscode.window.activeTextEditor;
        
        if(!path){
            this.path = 
                this.editor?.document.uri.path.slice(
                    0,
                    this.editor?.document.uri.path.lastIndexOf("/")
                )!;
            this.name = 
                this.editor?.document.uri.path.slice(
                    this.editor?.document.uri.path.lastIndexOf("/")+1,
                    this.editor?.document.uri.path.length
                )!;
        }
        else{
            this.path = path;
        }

        this.rawContent = docText ? docText : this.editor ? this.editor.document.getText() : "";

        // Tokenize document
        const lexer = new Lexer(HUFF_MAIN_TOKENS);
        this.lexer = lexer.tokenize(this.rawContent);

        // Handle lexing errors
        ErrorHandler.handleLexerErrors(this.lexer.errors);
        
        // Generate stack comments
        this.executor = new Executor(this.rawContent, this.lexer.tokens, this);
    }

    public getCleanName(){
        return this.name
            .replace("..", "")
            .replace("./", "")
            .replace("/", "");
    }

    public async prepare(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let includes = this.getIncludedFilesPath();
            for(let include of includes){

                const includeFullPath = path.join(
                    this.path,
                    include
                );
                
                let doc;

                try{
                    doc = await vscode.workspace.openTextDocument(includeFullPath);
                }
                catch(err){
                    reject(err);
                    return;
                }
                const includedDoc = new Document(includeFullPath.slice(0, includeFullPath.lastIndexOf("/")), doc.getText());
                includedDoc.name = include;

                // Prepare child document
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

        let docToRun: Document = undefined!;
        let macroDef: string = undefined!;

        for(let doc of this.includedDocs){
            const lexingRes = macroLexer.tokenize(doc.rawContent);

            for(let _t of lexingRes.tokens){
                const macroName = "#define macro " + t.image.slice(
                    0,
                    t.image.indexOf("(")
                );
                if(_t.image.indexOf(macroName) !== -1){
                    LOGGER.log(
                        `\n===> 📤 External macro call 🟣 ${doc.getCleanName()}::${extractMacroName(t)}`,
                        this.executor.callDepth + 1
                    );
                    this.executor.lastMacros.push(getHuffMacro(_t));
                    docToRun = doc;
                    macroDef = macroName;
                    break;
                }
            }
        }

        if(docToRun === undefined){
            return initialStack.stack;
        }

        const tempDoc = new Document(docToRun.rawContent);
        tempDoc.name = "VirtualExecutor - "+docToRun.name;
        const tempExecutor = new VirtualExecutor(docToRun.rawContent, lexer.tokenize(docToRun.rawContent).tokens, tempDoc);
        return tempExecutor.runMacro(macroDef, initialStack, 1).stack;
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