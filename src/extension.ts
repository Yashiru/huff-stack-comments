import * as vscode from 'vscode';
import { Document } from './document/Document';
import { ErrorHandler } from './lexer/LexicErrorHandler';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('huff-stack-comments.generate', async () => {
        vscode.window.withProgress({location: 15, title: "Generating stack comments...", cancellable: true}, (progress, token) => {
            return new Promise(async (resolve, reject) => {
				const doc = new Document();
				try{
					await doc.prepare();
					doc.generateComments();
					vscode.window.showInformationMessage("Huff: stack comments generated");
					resolve("");
				}
				catch(err){
					reject(err);
                    ErrorHandler.handleWorkspaceError(err);
				}
            });
        });
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
