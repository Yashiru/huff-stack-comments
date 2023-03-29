import { ILexingResult, Lexer } from 'chevrotain';
import { Executor } from '../executor/Executor';
import { HUFF_MAIN_TOKENS } from '../lexer/HuffTokens';
import { LexicErrorHandler } from '../lexer/LexicErrorHandler';
import * as vscode from 'vscode';
import * as path from "path";

export class Document{
    // Vs code current editor (Only for the main parent Document)
    private editor: vscode.TextEditor | undefined;

    // The Huff pseudo executor
    private executor: Executor = undefined!;

    // The document content lexing result 
    private lexingResult: ILexingResult = undefined!;

    // The included children Document (Huff #includes)
    private includedDocs: Document[] = [];

    constructor(docText?: string){
        this.editor = vscode.window.activeTextEditor;

		if (this.editor && !docText) {
			let document = this.editor.document.getText();

			// Tokenize document
			const lexer = new Lexer(HUFF_MAIN_TOKENS);
			this.lexingResult = lexer.tokenize(document);

			// Handle lexing errors
			LexicErrorHandler.handleErrors(this.lexingResult.errors);

			// Generate stack comments
			this.executor = new Executor(document, this.lexingResult.tokens, this.editor);

		}
        else if(docText){
			let document = docText;

			// Tokenize document
			const lexer = new Lexer(HUFF_MAIN_TOKENS);
			this.lexingResult = lexer.tokenize(document);

			// Handle lexing errors
			LexicErrorHandler.handleErrors(this.lexingResult.errors);
        }
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
            console.log(this.includedDocs);
                  
        });
    }

    public generateComments(){
        this.executor.generateStackComments();
    }

    private getIncludedFilesPath(){
        const includes = this.lexingResult.tokens.filter((token) => {
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