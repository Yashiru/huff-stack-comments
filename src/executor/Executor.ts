import { IToken, Lexer, TokenType } from "chevrotain";
import { HUFF_CHILDREN_TOKENS } from "../lexer/HuffTokens";
import { Stack } from "./Stack";
import { UInt256, uint256 } from "../uint256/uint256";
import { HuffMacro } from "../interfaces/HuffMacro";
import * as vscode from 'vscode';
import { getDefinition, getMacroDefinitionIndexOf, getParenthesisContent, getSignatureOf } from "../utils";
import { MAX_INT256 } from "../uint256/arithmetic";
import { Memory } from "../memory/memory";

const keccak256 = require('keccak256');
const editor = vscode.window.activeTextEditor!;

export class Executor {
    private memory: Memory = new Memory();

    private ptr: number = 0;
    private cachedPtr: number[] = [];
    private callDepth: number = 0;

    private documentLines: string[];
    private tokens: IToken[];
    private stack: Stack = new Stack();
    private tokenLexer = new Lexer(HUFF_CHILDREN_TOKENS, {
        positionTracking: "onlyOffset"
    });

    private maxLineLength: number = 0;

    private lastMacro: HuffMacro = null!;

    constructor(document: string, tokens: IToken[]) {
        this.documentLines = document.split("\n");
        this.tokens = tokens;

        for (let line of this.documentLines) {
            let tempLine = line.replace(/\/\/.*/, '');
            this.maxLineLength = tempLine.length > this.maxLineLength ? tempLine.length : this.maxLineLength;
        }
    }

    /**
     * Replace the document content by the new one with the generated comments
     */
    public generateStackComments() {
        for (this.ptr = 0; this.ptr < this.tokens.length; this.ptr++) {            
            this.interpret(this.tokens[this.ptr]);

            if (
                (
                    this.tokens[this.ptr + 1] === undefined ||
                    this.tokens[this.ptr + 1] === null ||
                    this.tokens[this.ptr + 1].endLine! > this.tokens[this.ptr].endLine!
                ) &&
                this.tokens[this.ptr].tokenType.name !== "blockEnd"
            ) {
                this.documentLines[this.tokens[this.ptr].endLine! - 1] =
                    this.documentLines[this.tokens[this.ptr].endLine! - 1]
                        .replace(/\/\/.*/, '')
                        .padEnd(this.maxLineLength + 1, " ")
                    + "// "
                    + this.stack.getStackComment();
            }
        }

        editor.edit(editBuilder => {
            const start = new vscode.Position(0, 0);
            const end = new vscode.Position(Infinity, Infinity);
            const range = new vscode.Range(start, end);
            editBuilder.replace(range, this.documentLines.join("\n"));
        });
    }

    /**
     * Compute and return the array of all the generated comments
     * @returns Comments array
     */
    public getStackComments() {
        let commentLines = [];
        for (this.ptr = 0; this.ptr < this.tokens.length; this.ptr++) {
            this.interpret(this.tokens[this.ptr]);

            if (
                (
                    this.tokens[this.ptr + 1] === undefined ||
                    this.tokens[this.ptr + 1] === null ||
                    this.tokens[this.ptr + 1].endLine! > this.tokens[this.ptr].endLine!
                ) &&
                this.tokens[this.ptr].tokenType.name !== "blockEnd"
            ) {
                commentLines.push(this.stack.getStackComment());
            }
        }

        return commentLines;
    }

    /* -------------------------------------------------------------------------- */
    /*                              PRIVATE FUNCTIONS                             */
    /* -------------------------------------------------------------------------- */

    private interpret(token: IToken) {
        if ((this as any)[token.tokenType.name] !== undefined) {
            (this as any)[token.tokenType.name](token);
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                              INTERPRET TOKENS                              */
    /* -------------------------------------------------------------------------- */

    private defineMacro(t: IToken) {
        // TODO: remain old stack for "takes"
        const lexedToken = this.tokenLexer.tokenize(
            t.image
        );

        const takes: number = parseInt(
            lexedToken.tokens[0].image.replace(" ", "").slice(
                6,
                lexedToken.tokens[0].image.length - 1
            )
        );
        const returns: number = parseInt(
            lexedToken.tokens[1].image.replace(" ", "").slice(
                8,
                lexedToken.tokens[1].image.length - 1
            )
        );

        if (this.callDepth === 0) {
            const initialStack: string[] = [];

            for (let i = 0; i < takes; i++) {
                initialStack.push(`takes[${i}]`);
            }
            this.stack.reset(initialStack);
        }
        else {
            this.stack.cache(takes);
        }

        this.lastMacro = {
            takes,
            returns
        };
    }

    private functionCall(t: IToken) {
        this.callDepth++;
        const tempPtr = this.ptr;
        this.ptr = getMacroDefinitionIndexOf(this.tokens[this.ptr], this.tokens, this.ptr);
        if(tempPtr !== this.ptr){
            this.cachedPtr.push(tempPtr);
        }
    }

    private blockEnd(t: IToken) {
        this.callDepth -= this.callDepth > 0 ? 1 : 0;
        if(this.cachedPtr.slice(-1).length){
            this.ptr = this.cachedPtr.slice(-1)[0];
            this.cachedPtr.pop();
        }
        this.stack.uncache(this.lastMacro.returns);
    }

    private hexadecimal(t: IToken) {
        this.stack.push(t.image);
    }

    private integer(t: IToken) {
        this.stack.push(t.image);
    }

    private variable(t: IToken) {
        this.stack.push(t.image.replace('[', '').replace(']', ''));
    }

    private memoryPointer(t: IToken) {
        this.stack.push(t.image);
    }

    private returndatasize(t: IToken) {
        this.stack.push("returndataSize");
    }

    private returndatacopy(t: IToken) {
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
    }

    private calldataload(t: IToken) {
        const index = this.stack.pop();
        this.stack.push(`calldata[${index}]`);
    }

    private calldatasize(t: IToken) {
        this.stack.push("calldataSize");
    }

    private calldatacopy(t: IToken) {
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
    }

    private delegatecall(t: IToken) {
        this.staticcall(t);
    }

    private selfdestruct(t: IToken) {
        this.stack.pop();
    }

    private extcodesize(t: IToken) {
        this.stack.pop();
        this.stack.push("extCodeSize");
    }

    private extcodecopy(t: IToken) {
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
    }

    private extcodehash(t: IToken) {
        this.stack.pop();
        this.stack.push("extCodeHash");
    }

    private selfbalance(t: IToken) {
        this.stack.push("selfBalance");
    }

    private signextend(t: IToken) {
        this.stack.push("unsupported signextend");
    }

    private prevrandao(t: IToken) {
        this.stack.push("unsupported prevrandao");
    }

    private staticcall(t: IToken) {
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();

        this.stack.push("success?");
    }

    private callvalue(t: IToken) {
        this.stack.push("callValue");
    }

    private blockhash(t: IToken) {
        this.stack.pop();
        this.stack.push("blockHash");
    }

    private timestamp(t: IToken) {
        this.stack.push("timestamp");
    }

    private codesize(t: IToken) {
        this.stack.push("codeSize");
    }

    private codecopy(t: IToken) {
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
    }

    private gasprice(t: IToken) {
        this.gas(t);
    }

    private coinbase(t: IToken) {
        this.stack.push("minerAddress");
    }

    private gaslimit(t: IToken) {
        this.stack.push("gasLimit");
    }

    private callcode(t: IToken) {
        this.call(t);
    }

    private address(t: IToken) {
        this.stack.push("currentAddress");
    }

    private balance(t: IToken) {
        let account = this.stack.pop();

        account = account.length > 20 ? account.slice(0, 4) + "..." + account.slice(-2) : account;
        this.stack.push(`balanceOf(${account})`);
    }

    private chainid(t: IToken) {
        this.stack.push("chainId");
    }

    private basefee(t: IToken) {
        this.stack.push("baseFee");
    }

    private mstore8(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try{
            const offset = uint256(a);
            let val = uint256(b);

            val = val.shl(
                256 - Math.ceil(val.toString(16).length / 2) * 8
            );

            this.memory.mstore(val, parseInt(offset.toString()));
        }
        catch(_) {
            // Nothing
        }
    }

    private create2(t: IToken) {
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();

        this.stack.push("newAddress");
    }

    private invalid(t: IToken) {
        this.stack.push("invalid");
    }

    private addmod(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();
        const n = this.stack.pop();

        try {
            this.stack.push(
                "0x" + uint256(a).add(uint256(b)).mod(uint256(n)).toString(16)
            );
        }
        catch (err) {
            const expr = '(' + a + ' + ' + b + ') % ' + n;
            this.stack.push(expr);
        }
    }

    private mulmod(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();
        const n = this.stack.pop();

        try {
            this.stack.push(
                "0x" + uint256(a).mul(uint256(b)).mod(uint256(n)).toString(16)
            );
        }
        catch (err) {
            const expr = '(' + a + ' * ' + b + ') % ' + n;
            this.stack.push(expr);
        }
    }

    private iszero(t: IToken) {
        const a = this.stack.pop();

        const expr = a + "==0";

        try {
            this.stack.push(eval(expr) ? "1" : "0");
        }
        catch (err) {
            this.stack.push(expr);
        }
    }

    private origin(t: IToken) {
        this.stack.push("origin");
    }

    private caller(t: IToken) {
        this.stack.push("caller");
    }

    private number(t: IToken) {
        this.stack.push("blockNumber");
    }

    private mstore(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try{
            const offset = uint256(a);
            const val = uint256(b);

            this.memory.mstore(val, parseInt(offset.toString()));
        }
        catch(_) {
            // Nothing
        }
    }

    private sstore(t: IToken) {
        this.stack.pop();
        this.stack.pop();
    }

    private swap10(t: IToken) {
        this.stack.swap(10);
    }

    private swap11(t: IToken) {
        this.stack.swap(11);
    }

    private swap12(t: IToken) {
        this.stack.swap(12);
    }

    private swap13(t: IToken) {
        this.stack.swap(13);
    }

    private swap14(t: IToken) {
        this.stack.swap(14);
    }

    private swap15(t: IToken) {
        this.stack.swap(15);
    }

    private swap16(t: IToken) {
        this.stack.swap(16);
    }

    private create(t: IToken) {
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();

        this.stack.push("newAddress");
    }

    private return(t: IToken) {
        this.stack.pop();
        this.stack.pop();
    }

    private revert(t: IToken) {
        this.return(t);
    }

    private mload(t: IToken) {
        let ptr = this.stack.pop();

        try{
            const value = this.memory.mload(
                parseInt(uint256(ptr).toString())
            );

            this.stack.push("0x"+value.toString(16));
        }
        catch(err){
            ptr = ptr.length > 10 ? ptr.slice(0, 4) + "..." + ptr.slice(-2) : ptr;
            this.stack.push(`mem[${ptr}]`);
        }
    }

    private sload(t: IToken) {
        let ptr = this.stack.pop();
        ptr = ptr.length > 10 ? ptr.slice(0, 4) + "..." + ptr.slice(-2) : ptr;

        this.stack.push(`storage[${ptr}]`);
    }

    private jumpi(t: IToken) {
        this.stack.pop();
        this.stack.pop();
    }

    private msize(t: IToken) {
        this.stack.push("msize");
    }

    private dup10(t: IToken) {
        this.stack.dup(10);
    }

    private dup11(t: IToken) {
        this.stack.dup(11);
    }

    private dup12(t: IToken) {
        this.stack.dup(12);
    }

    private dup13(t: IToken) {
        this.stack.dup(13);
    }

    private dup14(t: IToken) {
        this.stack.dup(14);
    }

    private dup15(t: IToken) {
        this.stack.dup(15);
    }

    private dup16(t: IToken) {
        this.stack.dup(16);
    }

    private swap1(t: IToken) {
        this.stack.swap(1);
    }

    private swap2(t: IToken) {
        this.stack.swap(2);
    }

    private swap3(t: IToken) {
        this.stack.swap(3);
    }

    private swap4(t: IToken) {
        this.stack.swap(4);
    }

    private swap5(t: IToken) {
        this.stack.swap(5);
    }

    private swap6(t: IToken) {
        this.stack.swap(6);
    }

    private swap7(t: IToken) {
        this.stack.swap(7);
    }

    private swap8(t: IToken) {
        this.stack.swap(8);
    }

    private swap9(t: IToken) {
        this.stack.swap(9);
    }

    private stop(t: IToken) { }

    private sdiv(t: IToken) {
        let lval = this.stack.pop();
        let rval = this.stack.pop();

        try {
            let a = uint256(lval);
            let b = uint256(rval);

            const negateResult =
                b.gt(uint256(MAX_INT256)) && !a.gt(uint256(MAX_INT256)) ||
                a.gt(uint256(MAX_INT256)) && !b.gt(uint256(MAX_INT256));

            a = a.gt(uint256(MAX_INT256)) ? a.negate() : a;
            b = b.gt(uint256(MAX_INT256)) ? b.negate() : b;

            a = a.div(b);

            if (negateResult) { a = a.negate(); }

            this.stack.push(("0x" + a.toString(16).toLowerCase()));
        }
        catch (err) {
            this.stack.push(lval + "/" + rval);
        }
    }

    private smod(t: IToken) {
        let lval = this.stack.pop();
        let rval = this.stack.pop();

        try {
            let a = uint256(lval);
            let b = uint256(rval);

            const negateResult =
                b.gt(uint256(MAX_INT256)) && a.gt(uint256(MAX_INT256)) ||
                a.gt(uint256(MAX_INT256));

            a = a.gt(uint256(MAX_INT256)) ? a.negate() : a;
            b = b.gt(uint256(MAX_INT256)) ? b.negate() : b;

            a = a.mod(b);

            if (negateResult) { a = a.negate(); }

            this.stack.push(("0x" + a.toString(16).toLowerCase()));
        }
        catch (err) {
            this.stack.push(lval + "%" + rval);
        }
    }

    private byte(t: IToken) { }

    private jump(t: IToken) { }

    private dup1(t: IToken) {
        this.stack.dup(1);
    }

    private dup2(t: IToken) {
        this.stack.dup(2);
    }

    private dup3(t: IToken) {
        this.stack.dup(3);
    }

    private dup4(t: IToken) {
        this.stack.dup(4);
    }

    private dup5(t: IToken) {
        this.stack.dup(5);
    }

    private dup6(t: IToken) {
        this.stack.dup(6);
    }

    private dup7(t: IToken) {
        this.stack.dup(7);
    }

    private dup8(t: IToken) {
        this.stack.dup(8);
    }

    private dup9(t: IToken) {
        this.stack.dup(9);
    }

    private log0(t: IToken) {
        this.stack.pop();
        this.stack.pop();
    }

    private log1(t: IToken) {
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
    }

    private log2(t: IToken) {
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
    }

    private log3(t: IToken) {
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
    }

    private log4(t: IToken) {
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
    }

    private call(t: IToken) {
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();
        this.stack.pop();

        this.stack.push("success?");
    }

    private sha3(t: IToken) {
        this.sha(t);
    }

    private add(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try {
            this.stack.push(
                "0x" + uint256(a).add(uint256(b)).toString(16)
            );
        }
        catch (err) {
            const expr = a + ' + ' + b;
            this.stack.push(expr);
        }
    }

    private mul(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try {
            this.stack.push(
                "0x" + uint256(a).mul(uint256(b)).toString(16)
            );
        }
        catch (err) {
            const expr = a + ' * ' + b;
            this.stack.push(expr);
        }
    }

    private sub(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try {
            this.stack.push(
                "0x" + uint256(a).sub(uint256(b)).toString(16)
            );
        }
        catch (err) {
            const expr = a + ' - ' + b;
            this.stack.push(expr);
        }
    }

    private div(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try {
            this.stack.push(
                "0x" + uint256(a).div(uint256(b)).toString(16)
            );
        }
        catch (err) {
            const expr = a + ' / ' + b;
            this.stack.push(expr);
        }
    }

    private mod(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try {
            this.stack.push(
                "0x" + uint256(a).mod(uint256(b)).toString(16)
            );
        }
        catch (err) {
            const expr = a + ' % ' + b;
            this.stack.push(expr);
        }
    }

    private exp(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try {
            this.stack.push(
                "0x" + uint256(a).pow(parseInt(b)).toString(16)
            );
        }
        catch (err) {
            const expr = a + ' ** ' + b;
            this.stack.push(expr);
        }
    }

    private slt(t: IToken) {
        let lval = this.stack.pop();
        let rval = this.stack.pop();

        try {
            let a = uint256(lval);
            let b = uint256(rval);

            a = a.gt(uint256(MAX_INT256)) ? a.negate() : a;
            b = b.gt(uint256(MAX_INT256)) ? b.negate() : b;

            this.stack.push(a.lt(b) ? "0x1" : "0x0");
        }
        catch (err) {
            this.stack.push(lval + " < " + rval);
        }
    }

    private sgt(t: IToken) {
        let lval = this.stack.pop();
        let rval = this.stack.pop();

        try {
            let a = uint256(lval);
            let b = uint256(rval);

            a = a.gt(uint256(MAX_INT256)) ? a.negate() : a;
            b = b.gt(uint256(MAX_INT256)) ? b.negate() : b;

            this.stack.push(a.gt(b) ? "0x1" : "0x0");
        }
        catch (err) {
            this.stack.push(lval + " > " + rval);
        }
    }

    private and(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try {
            this.stack.push(
                "0x" + uint256(a).and(uint256(b)).toString(16)
            );
        }
        catch (err) {
            const expr = a + ' & ' + b;
            this.stack.push(expr);
        }
    }

    private xor(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try {
            this.stack.push(
                "0x" + uint256(a).xor(uint256(b)).toString(16)
            );
        }
        catch (err) {
            const expr = a + ' ^ ' + b;
            this.stack.push(expr);
        }
    }

    private not(t: IToken) {
        const a = this.stack.pop();

        try {
            this.stack.push(
                "0x" + uint256(a).not().toString(16)
            );
        }
        catch (err) {
            const expr = "~" + a;
            this.stack.push(expr);
        }
    }

    private shl(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try {
            this.stack.push(
                "0x" + uint256(b).shl(parseInt(a)).toString(16)
            );
        }
        catch (err) {
            const expr = `${b} << ${a}`;
            this.stack.push(expr);
        }
    }

    private shr(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try {
            this.stack.push(
                "0x" + uint256(b).shr(parseInt(a)).toString(16)
            );
        }
        catch (err) {
            const expr = `${b} >> ${a}`;
            this.stack.push(expr);
        }
    }

    private sha(t: IToken) {
        this.stack.pop();
        this.stack.pop();

        this.stack.push("hash");
    }

    private sar(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try {
            this.stack.push(
                "0x" + uint256(b).sar(parseInt(a)).toString(16)
            );
        }
        catch (err) {
            const expr = `${b} >> ${a}`;
            this.stack.push(expr);
        }
    }

    private pop(t: IToken) {
        this.stack.pop();
    }

    private gas(t: IToken) {
        this.stack.push("gasPrice");
    }

    private lt(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try {
            this.stack.push(
                uint256(a).lt(uint256(b)) ? "0x1" : "0x0"
            );
        }
        catch (err) {
            const expr = `${a} < ${b}`;
            this.stack.push(expr);
        }
    }

    private gt(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try {
            this.stack.push(
                uint256(a).gt(uint256(b)) ? "0x1" : "0x0"
            );
        }
        catch (err) {
            const expr = `${a} > ${b}`;
            this.stack.push(expr);
        }
    }

    private eq(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try {
            this.stack.push(
                uint256(a).eq(uint256(b)) ? "0x1" : "0x0"
            );
        }
        catch (err) {
            const expr = `${a} == ${b}`;
            this.stack.push(expr);
        }
    }

    private or(t: IToken) {
        const a = this.stack.pop();
        const b = this.stack.pop();

        try {
            this.stack.push(
                "0x" + uint256(a).or(uint256(b)).toString(16)
            );
        }
        catch (err) {
            const expr = `${a} | ${b}`;
            this.stack.push(expr);
        }
    }

    private pc(t: IToken) {
        this.stack.push("PC");
    }

    /* -------------------------------------------------------------------------- */
    /*                           HUFF BUILT IN FUNCTIONS                          */
    /* -------------------------------------------------------------------------- */

    private __FUNC_SIG(t: IToken) {
        this.stack.push(
            getSignatureOf(
                getDefinition(t, "function", this.tokens)
            )
        );
    }

    private __EVENT_HASH(t: IToken) {
        this.stack.push(
            getSignatureOf(
                getDefinition(t, "event", this.tokens)
            )
        );
    }

    private __ERROR(t: IToken) {
        this.stack.push(
            getSignatureOf(
                getDefinition(t, "error", this.tokens)
            )
        );
    }

    private __RIGHTPAD(t: IToken) {
        const val = getParenthesisContent(t.image).match(/0[xX][0-9a-fA-F]+/);

        if(val !== undefined && val !== null && val!.length > 0){
            const hex = val[0].slice(2, val[0].length).padStart(64, "0");
            this.stack.push(
                "0x"+hex
            );
        }
        else{
            this.stack.push(
                t.image
            );
        }

    }

    private __codesize(t: IToken) {
        this.stack.push(
            t.image
        );
    }

    private __tablestart(t: IToken) {
        this.stack.push(
            t.image
        );
    }

    private __tablesize(t: IToken) {
        this.stack.push(
            t.image
        );
    }
}