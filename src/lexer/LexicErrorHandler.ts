import { ILexingError } from "chevrotain";

export class LexicErrorHandler{
    static handleErrors(errors: ILexingError[]){
        console.log(errors);
    }
}