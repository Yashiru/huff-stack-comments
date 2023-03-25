import { IToken, Lexer, TokenType } from "chevrotain";
import { HUFF_CHILDREN_TOKENS } from "../lexer/HuffTokens";
import { Stack } from "./Stack";
import { UInt256, U256 } from"../uint256/uint256";
import * as vscode from 'vscode';

const MAX_INT256 = new UInt256("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
const editor = vscode.window.activeTextEditor!;

export class Commenter{
    private documentLines: string[];
    private tokens: IToken[];
    private stack: Stack = new Stack();
    private tokenLexer = new Lexer(HUFF_CHILDREN_TOKENS);

    private maxLineLength: number = 0

    constructor(document: string, tokens: IToken[]){
        this.documentLines = document.split("\n");
        this.tokens = tokens;

        for(let line of this.documentLines){
            let tempLine = line.replace(/\/\/.*/, '')
            this.maxLineLength = tempLine.length > this.maxLineLength ? tempLine.length : this.maxLineLength
        }
    }

    public generateStackComments(){

        let i = 0
        for(let token of this.tokens){
            this.interpret(token);
            if((this.tokens[i+1] == null || this.tokens[i+1].endLine! > token.endLine!) &&token.tokenType.name != "end of block"){  
                console.log(this.documentLines[token.endLine!-1].replace(/\/\/.*/, ''));
                                          
                this.documentLines[token.endLine!-1] = this.documentLines[token.endLine!-1].replace(/\/\/.*/, '').padEnd(this.maxLineLength + 1, " ") + "// " + this.stack.getStackComment()
            }

            i++
        }

        editor.edit(editBuilder => {
            const start = new vscode.Position(0, 0)
            const end = new vscode.Position(Infinity, Infinity)
            const range = new vscode.Range(start, end)
            editBuilder.replace(range, this.documentLines.join("\n"));
        })
    }

    private interpret(token: IToken){   
        if((this as any)[token.tokenType.name] != null){
            (this as any)[token.tokenType.name](token);
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                              INTERPRET TOKENS                              */
    /* -------------------------------------------------------------------------- */
    private defineMacro(t: IToken){
        // TODO: remain old stack for "takes"
        const lexedToken = this.tokenLexer.tokenize(
            t.image
        );
        const takes: number = parseInt(
            lexedToken.tokens[0].image.slice(
                6, 
                lexedToken.tokens[0].image.length-1
            )
        );

        const initialStack: string[] = [];

        for(let i = 0 ; i < takes; i++){
            initialStack.push(`takes[${i}]`);
        }
        
        this.stack.reset(initialStack);
    }

    private hexadecimal(t: IToken){
        this.stack.push(t.image);
    }

    private integer(t: IToken){
        this.stack.push(t.image);
    }

    private variable(t: IToken){
        this.stack.push(t.image);
    }

    private functionCall(t: IToken){
        // TODO: compute stack after functions
    }

    private memoryPointer(t: IToken){
        this.stack.push(t.image);
    }

    private returndatasize(t: IToken){
        this.stack.push("returndataSize");
    }

    private returndatacopy(t: IToken){
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
    }

    private calldataload(t: IToken){
        const index = this.stack.pop();
        this.stack.push(`calldata[${index}]`);
    }

    private calldatasize(t: IToken){
        this.stack.push("calldataSize");
    }

    private calldatacopy(t: IToken){
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
    }

    private delegatecall(t: IToken){
        this.staticcall(t);
    }

    private selfdestruct(t: IToken){
        this.stack.pop();
    }

    private extcodesize(t: IToken){
        this.stack.pop();
        this.stack.push("extCodeSize");
    }

    private extcodecopy(t: IToken){
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
    }

    private extcodehash(t: IToken){
        this.stack.pop();
        this.stack.push("extCodeHash");
    }

    private selfbalance(t: IToken){
        this.stack.push("selfBalance");
    }

    private signextend(t: IToken){
        this.stack.push("unsupported signextend");
    }

    private prevrandao(t: IToken){
        this.stack.push("unsupported prevrandao");
    }

    private staticcall(t: IToken){
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();

        this.stack.push("success?");
    }

    private callvalue(t: IToken){
        this.stack.push("callValue");
    }

    private blockhash(t: IToken){
        this.stack.pop();
        this.stack.push("blockHash");
    }

    private timestamp(t: IToken){
        this.stack.push("timestamp");
    }

    private codesize(t: IToken){
        this.stack.push("codeSize");
    }

    private codecopy(t: IToken){
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
    }

    private gasprice(t: IToken){
        this.gas(t);
    }

    private coinbase(t: IToken){
        this.stack.push("minerAddress");
    }

    private gaslimit(t: IToken){
        this.stack.push("gaslimit");
    }

    private callcode(t: IToken){
        this.call(t);
    }

    private address(t: IToken){
        this.stack.push("currentAddress");
    }

    private balance(t: IToken){
        let account = this.stack.pop();
        account = account.length > 20 ? account.slice(0, 4)+"..."+account.slice(-2) : account;
        this.stack.push(`balanceOf[${account}]`);
    }

    private chainid(t: IToken){
        this.stack.push("chainId");
    }

    private basefee(t: IToken){
        this.stack.push("baseFee");
    }

    private mstore8(t: IToken){
        this.mstore(t);
    }

    private create2(t: IToken){
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();

        this.stack.push("newAddress");
    }

    private invalid(t: IToken){
        this.stack.push("invalid");
    }

    private addmod(t: IToken){
        const a = this.stack.pop();
        const b = this.stack.pop();
        const n = this.stack.pop();

        const expr = '(' + a + '+' + b + ')%' + n;

        try{
            this.stack.push(eval(expr));
        }
        catch(err){
            this.stack.push(expr);
        }
    }

    private mulmod(t: IToken){
        const a = this.stack.pop();
        const b = this.stack.pop();
        const n = this.stack.pop();

        const expr = '(' + a + '*' + b + ')%' + n;

        try{
            this.stack.push(eval(expr));
        }
        catch(err){
            this.stack.push(expr);
        }
    }

    private iszero(t: IToken){
        const a = this.stack.pop();

        const expr = a+"==0";

        try{
            this.stack.push(eval(expr) ? "1" : "0");
        }
        catch(err){
            this.stack.push(expr);
        }
    }

    private origin(t: IToken){
        this.stack.push("origin");
    }

    private caller(t: IToken){
        this.stack.push("caller");
    }

    private number(t: IToken){
        this.stack.push("blockNumber");
    }

    private mstore(t: IToken){
        this.stack.pop();
        this.stack.pop();
    }

    private sstore(t: IToken){
        this.mstore(t);
    }

    private swap10(t: IToken){
        this.stack.swap(10);
    }

    private swap11(t: IToken){
        this.stack.swap(11);
    }

    private swap12(t: IToken){
        this.stack.swap(12);
    }

    private swap13(t: IToken){
        this.stack.swap(13);
    }

    private swap14(t: IToken){
        this.stack.swap(14);
    }

    private swap15(t: IToken){
        this.stack.swap(15);
    }

    private swap16(t: IToken){
        this.stack.swap(16);
    }

    private create(t: IToken){
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();

        this.stack.push("newAddress");
    }

    private return(t: IToken){
        this.stack.pop();
        this.stack.pop();
    }

    private revert(t: IToken){
        this.return(t);
    }

    private mload(t: IToken){
        let ptr = this.stack.pop();
        ptr = ptr.length > 10 ? ptr.slice(0, 4)+"..."+ptr.slice(-2) : ptr;

        this.stack.push(`mem[${ptr}]`);
    }

    private sload(t: IToken){
        let ptr = this.stack.pop();
        ptr = ptr.length > 10 ? ptr.slice(0, 4)+"..."+ptr.slice(-2) : ptr;

        this.stack.push(`storage[${ptr}]`);
    }

    private jumpi(t: IToken){
        this.stack.pop();
        this.stack.pop();
    }

    private msize(t: IToken){
        this.stack.push("msize");
    }

    private dup10(t: IToken){
        this.stack.dup(10);
    }

    private dup11(t: IToken){
        this.stack.dup(11);
    }

    private dup12(t: IToken){
        this.stack.dup(12);
    }

    private dup13(t: IToken){
        this.stack.dup(13);
    }

    private dup14(t: IToken){
        this.stack.dup(14);
    }

    private dup15(t: IToken){
        this.stack.dup(15);
    }

    private dup16(t: IToken){
        this.stack.dup(16);
    }

    private swap1(t: IToken){
        this.stack.swap(1);
    }

    private swap2(t: IToken){
        this.stack.swap(2);
    }

    private swap3(t: IToken){
        this.stack.swap(3);
    }

    private swap4(t: IToken){
        this.stack.swap(4);
    }

    private swap5(t: IToken){
        this.stack.swap(5);
    }

    private swap6(t: IToken){
        this.stack.swap(6);
    }

    private swap7(t: IToken){
        this.stack.swap(7);
    }

    private swap8(t: IToken){
        this.stack.swap(8);
    }

    private swap9(t: IToken){
        this.stack.swap(9);
    }

    private stop(t: IToken){}

    private sdiv(t: IToken){
        let lval = this.stack.pop();
        let rval = this.stack.pop();

        try{
            let a = U256(lval);
            let b = U256(rval);    
    
            const negateResult = 
                b.gt(MAX_INT256) && !a.gt(MAX_INT256) || 
                a.gt(MAX_INT256) && !b.gt(MAX_INT256);
    
            a = a.gt(MAX_INT256) ? a.negate() : a;
            b = b.gt(MAX_INT256) ? b.negate() : b;   
    
            a = a.div(b)
    
            if(negateResult) a = a.negate();
    
            this.stack.push(("0x"+a.toString(16).toLowerCase()));
        }
        catch(err){
            this.stack.push(lval+"/"+rval);
        }
    }

    private smod(t: IToken){
        let lval = this.stack.pop();
        let rval = this.stack.pop();

        try{            
            let a = U256(lval);
            let b = U256(rval);    
    
            const negateResult = 
                b.gt(MAX_INT256) && !a.gt(MAX_INT256) || 
                a.gt(MAX_INT256) && !b.gt(MAX_INT256);
    
            a = a.gt(MAX_INT256) ? a.negate() : a;
            b = b.gt(MAX_INT256) ? b.negate() : b;   
    
            a = a.mod(b)
    
            if(negateResult) a = a.negate();
    
            this.stack.push(("0x"+a.toString(16).toLowerCase()));
        }
        catch(err){
            this.stack.push(lval+"/"+rval);
        }
    }

    private byte(t: IToken){

    }

    private jump(t: IToken){

    }

    private dup1(t: IToken){
        this.stack.dup(1)
    }

    private dup2(t: IToken){
        this.stack.dup(2)
    }

    private dup3(t: IToken){
        this.stack.dup(3)
    }

    private dup4(t: IToken){
        this.stack.dup(4)
    }

    private dup5(t: IToken){
        this.stack.dup(5)
    }

    private dup6(t: IToken){
        this.stack.dup(6)
    }

    private dup7(t: IToken){
        this.stack.dup(7)
    }

    private dup8(t: IToken){
        this.stack.dup(8)
    }

    private dup9(t: IToken){
        this.stack.dup(9)
    }

    private log0(t: IToken){

    }

    private log1(t: IToken){

    }

    private log2(t: IToken){

    }

    private log3(t: IToken){

    }

    private log4(t: IToken){

    }

    private call(t: IToken){
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();

        this.stack.push("success?");
    }

    private add(t: IToken){

    }

    private mul(t: IToken){

    }

    private sub(t: IToken){

    }

    private div(t: IToken){

    }

    private mod(t: IToken){

    }

    private exp(t: IToken){

    }

    private slt(t: IToken){

    }

    private sgt(t: IToken){

    }

    private and(t: IToken){

    }

    private xor(t: IToken){

    }

    private not(t: IToken){

    }

    private shl(t: IToken){

    }

    private shr(t: IToken){

    }

    private sha(t: IToken){

    }

    private sar(t: IToken){

    }

    private pop(t: IToken){

    }

    private gas(t: IToken){
        this.stack.push("gasPrice");
    }

    private lt(t: IToken){

    }

    private gt(t: IToken){

    }

    private eq(t: IToken){

    }

    private or(t: IToken){

    }

    private pc(t: IToken){

    }

}