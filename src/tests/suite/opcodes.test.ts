import * as assert from 'assert';
import * as vscode from 'vscode';
import { Lexer } from 'chevrotain';
import { HUFF_MAIN_TOKENS } from '../../lexer/HuffTokens';
import { Commenter } from '../../commenter/Commenter';
const lexer = new Lexer(HUFF_MAIN_TOKENS, {
	lineTerminatorsPattern: /\n|\r|\u2028|\u2029/g,
	lineTerminatorCharacters: [
		"\n".charCodeAt(0),
		"\r".charCodeAt(0),
		"\u2028".charCodeAt(0),
		"\u2029".charCodeAt(0)
	]
});

suite('OpCodes tests', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('returndatasize', () => {
		const doc = `
				returndatasize
			`;
		assert.equal(getCommentFor(doc), "[returndataSize]");
	});

	test('returndatacopy', () => {
		const doc = `
				0x00 0x00 0x00 returndatacopy
			`;
		assert.equal(getCommentFor(doc), "[]");
	});

	test('calldataload', () => {
		const doc = `
				0x00 calldataload
			`;
		assert.equal(getCommentFor(doc), "[calldata[0x00]]");
	});

	test('calldatasize', () => {
		const doc = `
				calldatasize
			`;

		assert.equal(getCommentFor(doc), "[calldataSize]");
	});

	test('calldatacopy', () => {
		const doc = `
				0x00 0x00 0x00 calldatacopy
			`;

		assert.equal(getCommentFor(doc), "[]");
	});

	test('delegatecall', () => {
		const doc = `
				0x00 0x20 
				0x00 0x20 
				0x00 0x00 
				delegatecall
			`;
		assert.equal(getCommentFor(doc), "[success?]");
	});

	test('selfdestruct', () => {
		const doc = `
				0x00 selfdestruct
			`;
		assert.equal(getCommentFor(doc), "[]");
	});

	test('extcodesize', () => {
		const doc = `
				0x1234123412341234123412341234123412341234
				extcodesize
			`;
		assert.equal(getCommentFor(doc), "[extCodeSize]");
	});

	test('extcodecopy', () => {
		const doc = `
				0x20 0x00 0x00 0x1234123412341234123412341234123412341234
				extcodecopy
			`;
		assert.equal(getCommentFor(doc), "[]");
	});

	test('extcodehash', () => {
		const doc = `
				0x1234123412341234123412341234123412341234
				extcodehash
			`;
		assert.equal(getCommentFor(doc), "[extCodeHash]");
	});

	test('selfbalance', () => {
		const doc = `
				selfbalance
			`;
		assert.equal(getCommentFor(doc), "[selfBalance]");
	});

	test('staticcall', () => {
		const doc = `
				0x00 0x20 
				0x00 0x20 
				0x00 0x00 
				staticcall
			`;
		assert.equal(getCommentFor(doc), "[success?]");
	});

	test('callvalue', () => {
		const doc = `
				callvalue
			`;
		assert.equal(getCommentFor(doc), "[callValue]");
	});

	test('blockhash', () => {
		const doc = `
				0xff blockhash
			`;
		assert.equal(getCommentFor(doc), "[blockHash]");
	});

	test('timestamp', () => {
		const doc = `
				timestamp
			`;
		assert.equal(getCommentFor(doc), "[timestamp]");
	});

	test('codesize', () => {
		const doc = `
				codesize
			`;
		assert.equal(getCommentFor(doc), "[codeSize]");
	});

	test('codecopy', () => {
		const doc = `
				0xf7 0x00 0x00 codecopy
			`;
		assert.equal(getCommentFor(doc), "[]");
	});

	test('gasprice', () => {
		const doc = `
				gasprice
			`;
		assert.equal(getCommentFor(doc), "[gasPrice]");
	});

	test('coinbase', () => {
		const doc = `
				coinbase
			`;
		assert.equal(getCommentFor(doc), "[minerAddress]");
	});

	test('gaslimit', () => {
		const doc = `
				gaslimit
			`;
		assert.equal(getCommentFor(doc), "[gasLimit]");
	});

	test('callcode', () => {
		const doc = `
				0x00 0x00
				0x00 0x00
				0x00
				0x1234123412341234123412341234123412341234
				gas
				callcode
			`;
		assert.equal(getCommentFor(doc), "[success?]");
	});

	test('address', () => {
		const doc = `
				address
			`;
		assert.equal(getCommentFor(doc), "[currentAddress]");
	});

	test('balance', () => {
		let doc = `
				0x1234123412341234123412341234123412341234
				balance
				[CONST_ADDRESS]
				balance
				[CONST_ADDRESS_VERY_LONG_NAME]
				balance
			`;
		assert.equal(getCommentFor(doc), "[balanceOf(CONS...ME), balanceOf(CONST_ADDRESS), balanceOf(0x12...34)]");
	});

	test('chainid', () => {
		const doc = `
				chainid
			`;
		assert.equal(getCommentFor(doc), "[chainId]");
	});

	test('basefee', () => {
		const doc = `
				basefee
			`;
		assert.equal(getCommentFor(doc), "[baseFee]");
	});

	test('mstore8', () => {
		const doc = `
				0xff 0x00 mstore8
			`;
		assert.equal(getCommentFor(doc), "[]");
	});

	test('create2', () => {
		const doc = `
				[SALT] 0xff 0x00 0x00
				create2
			`;
		assert.equal(getCommentFor(doc), "[newAddress]");
	});

	test('addmod', () => {
		let doc = `
				20
				0xa
				20
				addmod
				2
				2
				0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
				addmod
				[CONST_VAR]
				0xa
				codesize
				addmod
			`;
		assert.equal(getCommentFor(doc), "[(codeSize + 0xa) % CONST_VAR, 0x1, 0xa]");
	});

	test('mulmod', () => {
		const doc = `
				8
				10
				10
				mulmod
				12
				0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
				0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
				mulmod
				[CONST_VAR]
				0xa
				codesize
				mulmod
			`;
		assert.equal(getCommentFor(doc), "[(codeSize * 0xa) % CONST_VAR, 0x1, 0x4]");
	});

	test('iszero', () => {
		const doc = `
				0xa
				iszero
				0x00
				iszero
				0
				iszero
				[CONST_VAR]
				iszero
				codesize
				iszero
			`;
		assert.equal(getCommentFor(doc), "[codeSize==0, CONST_VAR==0, 1, 1, 0]");
	});

	test('origin', () => {
		const doc = `
				origin
			`;
		assert.equal(getCommentFor(doc), "[origin]");
	});

	test('caller', () => {
		const doc = `
				caller
			`;
		assert.equal(getCommentFor(doc), "[caller]");
	});

	test('number', () => {
		const doc = `
				number
			`;
		assert.equal(getCommentFor(doc), "[blockNumber]");
	});

	test('mstore', () => {
		const doc = `
				0x00 0x20 mstore
			`;
		assert.equal(getCommentFor(doc), "[]");
	});

	test('sstore', () => {
		const doc = `
				0xfffff 0x20 sstore
			`;
		assert.equal(getCommentFor(doc), "[]");
	});

	test('swap10', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a
				swap10
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x0a]");
	});

	test('swap11', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a 0x0b
				swap11
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x0a, 0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x0b]");
	});

	test('swap12', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a 0x0b 0x0c
				swap12
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x0b, 0x0a, 0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x0c]");
	});

	test('swap13', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a 0x0b 0x0c 0x0d
				swap13
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x0c, 0x0b, 0x0a, 0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x0d]");
	});

	test('swap14', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a 0x0b 0x0c 0x0d 0x0e
				swap14
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x0d, 0x0c, 0x0b, 0x0a, 0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x0e]");
	});

	test('swap15', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a 0x0b 0x0c 0x0d 0x0e 0x0f
				swap15
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x0e, 0x0d, 0x0c, 0x0b, 0x0a, 0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x0f]");
	});

	test('swap16', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a 0x0b 0x0c 0x0d 0x0e 0x0f 0x10
				swap16
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x0f, 0x0e, 0x0d, 0x0c, 0x0b, 0x0a, 0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x10]");
	});

	test('create', () => {
		const doc = `
				0xff 0x00 0x00
				create
			`;
		assert.equal(getCommentFor(doc), "[newAddress]");
	});

	test('return', () => {
		const doc = `
				0x00 0x20 return
			`;
		assert.equal(getCommentFor(doc), "[]");
	});

	test('revert', () => {
		const doc = `
				0x00 0x20 revert
			`;
		assert.equal(getCommentFor(doc), "[]");
	});

	test('mload', () => {
		const doc = `
				0x00 mload
				[CONST_VAR] mload
				[CONST_VAR_VERY_LONG_NAME] mload
			`;
		assert.equal(getCommentFor(doc), "[mem[CONS...ME], mem[CONST_VAR], mem[0x00]]");
	});

	test('sload', () => {
		const doc = `
				0x00 sload
				[CONST_VAR] sload
				0x4242424242424242424242424242424242424242424242424242424242424242 sload
			`;
		assert.equal(getCommentFor(doc), "[storage[0x42...42], storage[CONST_VAR], storage[0x00]]");
	});

	test('jumpi', () => {
		const doc = `
				0xaa 0x01
				dest jumpi
			`;
		assert.equal(getCommentFor(doc), "[]");
	});

	test('msize', () => {
		const doc = `
				msize
			`;
		assert.equal(getCommentFor(doc), "[msize]");
	});

	test('dup10', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09
				dup10
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00]");
	});

	test('dup11', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a 
				dup11
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x0a, 0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00]");
	});

	test('dup12', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a 0x0b 
				dup12
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x0b, 0x0a, 0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00]");
	});

	test('dup13', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a 0x0b 0x0c 
				dup13
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x0c, 0x0b, 0x0a, 0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00]");
	});

	test('dup14', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a 0x0b 0x0c 0x0d 
				dup14
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x0d, 0x0c, 0x0b, 0x0a, 0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00]");
	});

	test('dup15', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a 0x0b 0x0c 0x0d 0x0e 
				dup15
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x0e, 0x0d, 0x0c, 0x0b, 0x0a, 0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00]");
	});

	test('dup16', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a 0x0b 0x0c 0x0d 0x0e 0x0f 
				dup16
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x0f, 0x0e, 0x0d, 0x0c, 0x0b, 0x0a, 0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00]");
	});

	test('swap1', () => {
		const doc = `
				0x00 0x01
				swap1
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x01]");
	});

	test('swap2', () => {
		const doc = `
				0x00 0x01 0x02
				swap2
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x01, 0x02]");
	});

	test('swap3', () => {
		const doc = `
				0x00 0x01 0x02 0x03
				swap3
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x02, 0x01, 0x03]");
	});

	test('swap4', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04
				swap4
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x03, 0x02, 0x01, 0x04]");
	});

	test('swap5', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05
				swap5
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x04, 0x03, 0x02, 0x01, 0x05]");
	});

	test('swap6', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06
				swap6
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x05, 0x04, 0x03, 0x02, 0x01, 0x06]");
	});

	test('swap7', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07
				swap7
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x07]");
	});

	test('swap8', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08
				swap8
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x08]");
	});

	test('swap9', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09
				swap9
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x09]");
	});

	test('sdiv', () => {
		const doc = `
				10
				10
				sdiv
				0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
				0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE
				sdiv
			`;
		assert.equal(getCommentFor(doc), "[0x2, 0x1]");
	});

	test('smod', () => {
		const doc = `
				3
				10
				smod
				0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD
				0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF8
				smod
			`;
		assert.equal(getCommentFor(doc), "[0xff...fe, 0x1]");
	});

	test('dup1', () => {
		const doc = `
				0x00 dup1
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x00]");
	});

	test('dup2', () => {
		const doc = `
				0x00 0x01 
				dup2
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x01, 0x00]");
	});

	test('dup3', () => {
		const doc = `
				0x00 0x01 0x02
				dup3
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x02, 0x01, 0x00]");
	});

	test('dup4', () => {
		const doc = `
				0x00 0x01 0x02 0x03
				dup4
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x03, 0x02, 0x01, 0x00]");
	});

	test('dup5', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04
				dup5
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x04, 0x03, 0x02, 0x01, 0x00]");
	});

	test('dup6', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05
				dup6
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00]");
	});

	test('dup7', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06
				dup7
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00]");
	});

	test('dup8', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07
				dup8
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00]");
	});

	test('dup9', () => {
		const doc = `
				0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08
				dup9
			`;
		assert.equal(getCommentFor(doc), "[0x00, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00]");
	});

	test('log0', () => {
		const doc = `
				0x20 0x00
				log0
			`;
		assert.equal(getCommentFor(doc), "[]");
	});

	test('log1', () => {
		const doc = `
				0x20 0x00
				0xaa
				log1
			`;
		assert.equal(getCommentFor(doc), "[]");
	});

	test('log2', () => {
		const doc = `
				0x20 0x00
				0xaa
				0xbb
				log2
			`;
		assert.equal(getCommentFor(doc), "[]");
	});

	test('log3', () => {
		const doc = `
				0x20 0x00
				0xaa
				0xbb
				0xcc
				log3
			`;
		assert.equal(getCommentFor(doc), "[]");
	});

	test('log4', () => {
		const doc = `
				0x20 0x00
				0xaa
				0xbb
				0xcc
				0xdd
				log4
			`;
		assert.equal(getCommentFor(doc), "[]");
	});

	test('call', () => {
		const doc = `
				0x00 0x20 
				0x00 0x20 
				0x00 0x00 
				call
			`;
		assert.equal(getCommentFor(doc), "[success?]");
	});

	test('sha3', () => {
		const doc = `
				0x04 0x00
				sha3
			`;
		assert.equal(getCommentFor(doc), "[hash]");
	});

	test('add', () => {
		const doc = `
				10
				10
				add
				0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
				2
				add
				[CONST_VAR]
				codesize
				add
			`;
		assert.equal(getCommentFor(doc), "[codeSize + CONST_VAR, 0x1, 0x14]");
	});

	test('mul', () => {
		const doc = `
				10
				10
				mul
				0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
				2
				mul
				[CONST_VAR]
				codesize
				mul
			`;
		assert.equal(getCommentFor(doc), "[codeSize * CONST_VAR, 0xff...fe, 0x64]");
	});

	test('sub', () => {
		const doc = `
				10
				10
				sub
				1
				0
				sub
				[CONST_VAR]
				codesize
				sub
			`;
		assert.equal(getCommentFor(doc), "[codeSize - CONST_VAR, 0xff...f, 0x0]");
	});

	test('div', () => {
		const doc = `
				10
				10
				div
				2
				1
				div
				[CONST_VAR]
				codesize
				div
			`;
		assert.equal(getCommentFor(doc), "[codeSize / CONST_VAR, 0x0, 0x1]");
	});

	test('mod', () => {
		const doc = `
				3
				10
				mod
				5
				17
				mod
				[CONST_VAR]
				codesize
				mod
			`;
		assert.equal(getCommentFor(doc), "[codeSize % CONST_VAR, 0x2, 0x1]");
	});

	test('exp', () => {
		const doc = `
				2
				10
				exp
				2
				2
				exp
				[CONST_VAR]
				codesize
				exp
			`;
		assert.equal(getCommentFor(doc), "[codeSize ** CONST_VAR, 0x4, 0x64]");
	});

	test('slt', () => {
		const doc = `
				9
				0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
				slt
				10
				10
				slt
				[CONST_VAR]
				codesize
				slt
			`;
		assert.equal(getCommentFor(doc), "[codeSize < CONST_VAR, 0x0, 0x1]");
	});

	test('sgt', () => {
		const doc = `
				0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
				9
				sgt
				10
				10
				sgt
				[CONST_VAR]
				codesize
				sgt
			`;
		assert.equal(getCommentFor(doc), "[codeSize > CONST_VAR, 0x0, 0x1]");
	});

	test('and', () => {
		const doc = `
				0xF
				0xF
				and
				0
				0xFF
				and
				[CONST_VAR]
				codesize
				and
			`;
		assert.equal(getCommentFor(doc), "[codeSize & CONST_VAR, 0x0, 0xf]");
	});

	test('xor', () => {
		const doc = `
				0xF
				0xF0
				xor
				0xFF
				0xFF
				xor
				[CONST_VAR]
				codesize
				xor
			`;
		assert.equal(getCommentFor(doc), "[codeSize ^ CONST_VAR, 0x0, 0xff]");
	});

	test('not', () => {
		const doc = `
			0
			not
			codesize
			not
		`;
		assert.equal(getCommentFor(doc), "[~codeSize, 0xff...f]");
	});

	test('shl', () => {
		const doc = `
			1
			1
			shl
			0xFF00000000000000000000000000000000000000000000000000000000000000
			4
			shl
			[CONST_VAR]
			codesize
			shl
		`;
		assert.equal(getCommentFor(doc), "[CONST_VAR << codeSize, 0xf00...0, 0x2]");
	});

	test('shr', () => {
		const doc = `
			2
			1
			shr
			0xFF
			4
			shr
			[CONST_VAR]
			codesize
			shr
		`;
		assert.equal(getCommentFor(doc), "[CONST_VAR >> codeSize, 0xf, 0x1]");
	});

	test('sar', () => {
		const doc = `
			2
			1
			sar
			0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0
			4
			sar
			[CONST_VAR]
			codesize
			sar
		`;
		assert.equal(getCommentFor(doc), "[CONST_VAR >> codeSize, 0xff...f, 0x1]");
	});

	test('pop', () => {
		const doc = `
			0x00 0x01 0x02 0x03
			pop pop
		`;
		assert.equal(getCommentFor(doc), "[0x01, 0x00]");
	});

	test('gas', () => {
		const doc = `
			gas
		`;
		assert.equal(getCommentFor(doc), "[gasPrice]");
	});

	test('lt', () => {
		const doc = `
			10
			9
			lt
			10
			10
			lt
			[CONST_VAR]
			codesize
			lt
		`;
		assert.equal(getCommentFor(doc), "[codeSize < CONST_VAR, 0x0, 0x1]");
	});

	test('gt', () => {
		const doc = `
			9
			10
			gt
			10
			10
			gt
			[CONST_VAR]
			codesize
			gt
		`;
		assert.equal(getCommentFor(doc), "[codeSize > CONST_VAR, 0x0, 0x1]");
	});

	test('eq', () => {
		const doc = `
			10
			10
			eq
			5
			10
			eq
			[CONST_VAR]
			codesize
			eq
		`;
		assert.equal(getCommentFor(doc), "[codeSize == CONST_VAR, 0x0, 0x1]");
	});

	test('or', () => {
		const doc = `
			0xF
			0xF0
			or
			0xFF
			0xFF
			or
			[CONST_VAR]
			codesize
			or
		`;
		assert.equal(getCommentFor(doc), "[codeSize | CONST_VAR, 0xff, 0xff]");
	});

	test('pc', () => {
		const doc = `
			pc
		`;
		assert.equal(getCommentFor(doc), "[PC]");
	});

	/* -------------------------------------------------------------------------- */
	/*                               UNSUPPORTED YET                              */
	/* -------------------------------------------------------------------------- */

	// test('signextend', () => {
	// 	const doc = `
	// 		#define macro TEST() = takes(0) returns(0) {
	// 			0x20 0x00 0x00 0x1234123412341234123412341234123412341234
	// 			extcodecopy
	// 		}
	// 	`;
	// 	assert.equal(getCommentFor(doc), "[]");
	// });

	// test('prevrandao', () => {
	// 	const doc = `
	// 		#define macro TEST() = takes(0) returns(0) {
	// 			0x20 0x00 0x00 0x1234123412341234123412341234123412341234
	// 			extcodecopy
	// 		}
	// 	`;
	// 	assert.equal(getCommentFor(doc), "[]");
	// });

	// test('byte', () => {
	// 	const doc = `
	// 		#define macro TEST() = takes(0) returns(0) {
	// 			byte
	// 		}
	// 	`;
	// 	assert.equal(getCommentFor(doc), "[]");
	// });
});

function getCommentFor(doc: string){
	const lexingResult = lexer.tokenize(
		doc
	);

	const commenter = new Commenter(doc, lexingResult.tokens);
	return commenter.getStackComments().slice(-1);
}
