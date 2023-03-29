import { ILexingError } from "chevrotain";
import * as vscode from 'vscode';

export class LexicErrorHandler{
    static handleErrors(errors: ILexingError[]){
        for(let err of errors){
            vscode.window.showWarningMessage(
                "Line "+err.line+": "+
                err.message
            );
        }
    }
}