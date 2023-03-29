import { Lexer } from 'chevrotain';
import * as vscode from 'vscode';
import { Document } from './document/Document';
import { Executor } from './executor/Executor';
import { HUFF_MAIN_TOKENS } from './lexer/HuffTokens';
import { LexicErrorHandler } from './lexer/LexicErrorHandler';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('huff-stack-comments.generate', async () => {
        vscode.window.withProgress({location: 15, title: "Generating stack comments...", cancellable: true}, (progress, token) => {
            return new Promise(async (resolve) => {
				const doc = new Document();
				await doc.prepare();
				doc.generateComments();
				vscode.window.showInformationMessage("Huff: stack comments generated");
				resolve("");
            });
        });
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
