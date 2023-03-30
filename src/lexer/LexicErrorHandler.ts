import { ILexingError } from "chevrotain";
import * as vscode from 'vscode';

export class ErrorHandler{
    static handleLexerErrors(errors: ILexingError[]){
        for(let err of errors){
            vscode.window.showWarningMessage(
                "Line "+err.line+": "+
                err.message
            );
        }
    }

    static handleWorkspaceError(err: any){
        vscode.window.showErrorMessage(err.toString());
    }
}