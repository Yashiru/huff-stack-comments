import { createToken, Lexer, TokenType, TokenVocabulary } from "chevrotain";

export const HUFF_MAIN_TOKENS: TokenType[] = [
    // /* --------------------------------- Skipped -------------------------------- */
    createToken({ name: "whiteSpace", pattern: /\s+/, group: Lexer.SKIPPED }),
    createToken({ name: "comments", pattern: /\/\/.*/, group: Lexer.SKIPPED }),
    createToken({ name: "comments", pattern: /\/\*.*\*\//, group: Lexer.SKIPPED }),
    createToken({ name: "multiline comments", pattern: /\/\*(.|\n)*\*\//, group: Lexer.SKIPPED }),
    /* ---------------------------- Huff definitions ---------------------------- */
    createToken({ name: "defineMacro", pattern: /#define macro [0-9a-zA-Z_]*\([0-9a-zA-Z_, ]*\)( )?=( )?takes( )?\([0-9]*\) returns( )?\([0-9]*\)( )?{/ }),
    createToken({ name: "defineFunction", pattern: /#define function [0-9a-zA-Z_]*\([0-9a-z, ]*\)( )?.*returns( )?\(.*\)/ }),
    createToken({ name: "defineEvent", pattern: /#define event [0-9a-zA-Z_]*\([0-9a-z, ]*\)/ }),
    createToken({ name: "defineError", pattern: /#define error [0-9a-zA-Z_]*\([0-9a-z, ]*\)/ }),
    createToken({ name: "defineConstant", pattern: /#define constant [0-9a-zA-Z_]*( )?=( )?.*/ }),
    createToken({ name: "include", pattern: /#include (")?(')?.*(")?(')?/ }),
    /* ------------------------------- Expressions ------------------------------ */
    createToken({ name: "hexadecimal", pattern: /0[xX][0-9a-fA-F]+/ }),
    createToken({ name: "integer", pattern: /0|[1-9]\d*/ }),
    createToken({ name: "variable", pattern: /\[[a-zA-Z_]*]/ }),
    createToken({ name: "functionCall", pattern: /[<>_a-zA-Z0-9]*\((.*)?\)/ }),
    createToken({ name: "memoryPointer", pattern: /\<[a-zA-Z0-9_]*\>/ }),
    // /* --------------------------------- OpCodes -------------------------------- */
    createToken({ name: "returndatasize", pattern: /returndatasize/ }),
    createToken({ name: "returndatacopy", pattern: /returndatacopy/ }),
    createToken({ name: "calldataload", pattern: /calldataload/ }),
    createToken({ name: "calldatasize", pattern: /calldatasize/ }),
    createToken({ name: "calldatacopy", pattern: /calldatacopy/ }),
    createToken({ name: "delegatecall", pattern: /delegatecall/ }),
    createToken({ name: "selfdestruct", pattern: /selfdestruct/ }),
    createToken({ name: "extcodesize", pattern: /extcodesize/ }),
    createToken({ name: "extcodecopy", pattern: /extcodecopy/ }),
    createToken({ name: "extcodehash", pattern: /extcodehash/ }),
    createToken({ name: "selfbalance", pattern: /selfbalance/ }),
    createToken({ name: "signextend", pattern: /signextend/ }),
    createToken({ name: "prevrandao", pattern: /prevrandao/ }),
    createToken({ name: "staticcall", pattern: /staticcall/ }),
    createToken({ name: "keccak256", pattern: /keccak256/ }),
    createToken({ name: "callvalue", pattern: /callvalue/ }),
    createToken({ name: "blockhash", pattern: /blockhash/ }),
    createToken({ name: "timestamp", pattern: /timestamp/ }),
    createToken({ name: "codesize", pattern: /codesize/ }),
    createToken({ name: "codecopy", pattern: /codecopy/ }),
    createToken({ name: "gasprice", pattern: /gasprice/ }),
    createToken({ name: "coinbase", pattern: /coinbase/ }),
    createToken({ name: "gaslimit", pattern: /gaslimit/ }),
    createToken({ name: "jumpdest", pattern: /.*:/ }),
    createToken({ name: "callcode", pattern: /callcode/ }),
    createToken({ name: "address", pattern: /address/ }),
    createToken({ name: "balance", pattern: /balance/ }),
    createToken({ name: "chainid", pattern: /chainid/ }),
    createToken({ name: "basefee", pattern: /basefee/ }),
    createToken({ name: "mstore8", pattern: /mstore8/ }),
    createToken({ name: "create2", pattern: /create2/ }),
    createToken({ name: "invalid", pattern: /invalid/ }),
    createToken({ name: "addmod", pattern: /addmod/ }),
    createToken({ name: "mulmod", pattern: /mulmod/ }),
    createToken({ name: "iszero", pattern: /iszero/ }),
    createToken({ name: "origin", pattern: /origin/ }),
    createToken({ name: "caller", pattern: /caller/ }),
    createToken({ name: "number", pattern: /number/ }),
    createToken({ name: "mstore", pattern: /mstore/ }),
    createToken({ name: "sstore", pattern: /sstore/ }),
    createToken({ name: "swap10", pattern: /swap10/ }),
    createToken({ name: "swap11", pattern: /swap11/ }),
    createToken({ name: "swap12", pattern: /swap12/ }),
    createToken({ name: "swap13", pattern: /swap13/ }),
    createToken({ name: "swap14", pattern: /swap14/ }),
    createToken({ name: "swap15", pattern: /swap15/ }),
    createToken({ name: "swap16", pattern: /swap16/ }),
    createToken({ name: "create", pattern: /create/ }),
    createToken({ name: "return", pattern: /return/ }),
    createToken({ name: "revert", pattern: /revert/ }),
    createToken({ name: "mload", pattern: /mload/ }),
    createToken({ name: "sload", pattern: /sload/ }),
    createToken({ name: "jumpi", pattern: /.* jumpi/ }),
    createToken({ name: "msize", pattern: /msize/ }),
    createToken({ name: "dup10", pattern: /dup10/ }),
    createToken({ name: "dup11", pattern: /dup11/ }),
    createToken({ name: "dup12", pattern: /dup12/ }),
    createToken({ name: "dup13", pattern: /dup13/ }),
    createToken({ name: "dup14", pattern: /dup14/ }),
    createToken({ name: "dup15", pattern: /dup15/ }),
    createToken({ name: "dup16", pattern: /dup16/ }),
    createToken({ name: "swap1", pattern: /swap1/ }),
    createToken({ name: "swap2", pattern: /swap2/ }),
    createToken({ name: "swap3", pattern: /swap3/ }),
    createToken({ name: "swap4", pattern: /swap4/ }),
    createToken({ name: "swap5", pattern: /swap5/ }),
    createToken({ name: "swap6", pattern: /swap6/ }),
    createToken({ name: "swap7", pattern: /swap7/ }),
    createToken({ name: "swap8", pattern: /swap8/ }),
    createToken({ name: "swap9", pattern: /swap9/ }),
    createToken({ name: "stop", pattern: /stop/ }),
    createToken({ name: "sdiv", pattern: /sdiv/ }),
    createToken({ name: "smod", pattern: /smod/ }),
    createToken({ name: "byte", pattern: /byte/ }),
    createToken({ name: "jump", pattern: /.* jump/ }),
    createToken({ name: "dup1", pattern: /dup1/ }),
    createToken({ name: "dup2", pattern: /dup2/ }),
    createToken({ name: "dup3", pattern: /dup3/ }),
    createToken({ name: "dup4", pattern: /dup4/ }),
    createToken({ name: "dup5", pattern: /dup5/ }),
    createToken({ name: "dup6", pattern: /dup6/ }),
    createToken({ name: "dup7", pattern: /dup7/ }),
    createToken({ name: "dup8", pattern: /dup8/ }),
    createToken({ name: "dup9", pattern: /dup9/ }),
    createToken({ name: "log0", pattern: /log0/ }),
    createToken({ name: "log1", pattern: /log1/ }),
    createToken({ name: "log2", pattern: /log2/ }),
    createToken({ name: "log3", pattern: /log3/ }),
    createToken({ name: "log4", pattern: /log4/ }),
    createToken({ name: "call", pattern: /call/ }),
    createToken({ name: "sha3", pattern: /sha3/ }),
    createToken({ name: "add", pattern: /add/ }),
    createToken({ name: "mul", pattern: /mul/ }),
    createToken({ name: "sub", pattern: /sub/ }),
    createToken({ name: "div", pattern: /div/ }),
    createToken({ name: "mod", pattern: /mod/ }),
    createToken({ name: "exp", pattern: /exp/ }),
    createToken({ name: "slt", pattern: /slt/ }),
    createToken({ name: "sgt", pattern: /sgt/ }),
    createToken({ name: "and", pattern: /and/ }),
    createToken({ name: "xor", pattern: /xor/ }),
    createToken({ name: "not", pattern: /not/ }),
    createToken({ name: "shl", pattern: /shl/ }),
    createToken({ name: "shr", pattern: /shr/ }),
    createToken({ name: "sha", pattern: /sha/ }),
    createToken({ name: "sar", pattern: /sar/ }),
    createToken({ name: "pop", pattern: /pop/ }),
    createToken({ name: "gas", pattern: /gas/ }),
    createToken({ name: "lt", pattern: /lt/ }),
    createToken({ name: "gt", pattern: /gt/ }),
    createToken({ name: "eq", pattern: /eq/ }),
    createToken({ name: "or", pattern: /or/ }),
    createToken({ name: "pc", pattern: /pc/ }),
    createToken({ name: "blockEnd", pattern: /}/ }),
];

export const HUFF_CHILDREN_TOKENS: TokenType[] = [
    createToken({ name: "takes", pattern: /takes\([0-9]*\)/ }),
    createToken({ name: "returns", pattern: /returns\([0-9]*\)/ }),
];