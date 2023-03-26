import { Lexer } from 'chevrotain';
import * as vscode from 'vscode';
import { Commenter } from './commenter/Commenter';
import { HUFF_MAIN_TOKENS } from './lexer/HuffTokens';
import { LexicErrorHandler } from './lexer/LexicErrorHandler';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('huff-stack-comments.generate', () => {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			let document = editor.document.getText();

			// Tokenize document
			const lexer = new Lexer(HUFF_MAIN_TOKENS);
			const lexingResult = lexer.tokenize(document);
			// Handle lexing errors
			LexicErrorHandler.handleErrors(lexingResult.errors);

			// Generate stack comments
			const commenter = new Commenter(document, lexingResult.tokens);
			commenter.generateStackComments();

			vscode.window.showInformationMessage('Huff: Stack comments generated.');
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
