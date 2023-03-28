import * as assert from 'assert';
import * as vscode from 'vscode';
import { getAllCommentFor, getCommentFor } from '../utils';


suite('Huff built-in functions', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('__FUNC_SIG', () => {
        let doc = `
            #define function testFunction(uint256, bytes32) view returns(bytes memory)
            __FUNC_SIG(testFunction)
        `;

        assert.equal(getCommentFor(doc), "[0xa458e8ac]");

        doc = `
            __FUNC_SIG(testFunction(uint256,bytes32))
        `;

        assert.equal(getCommentFor(doc), "[0xa458e8ac]");
    });

    test('__ERROR', () => {
        let doc = `
            #define error InsufficientAllowance()
            __ERROR(InsufficientAllowance)
        `;

        assert.equal(getCommentFor(doc), "[0x13be252b]");

        doc = `
            __ERROR(InsufficientAllowance())
        `;

        assert.equal(getCommentFor(doc), "[0x13be252b]");
    });

    test('__EVENT_HASH', () => {
        let doc = `
            #define event Transfer(address,address,uint256)
            __EVENT_HASH(Transfer)
        `;

        assert.equal(getCommentFor(doc), "[0xddf252ad]");

        doc = `
            __EVENT_HASH(Transfer(address,address,uint256))
        `;

        assert.equal(getCommentFor(doc), "[0xddf252ad]");
    });

    test('__RIGHTPAD', () => {
        let doc = `
            __RIGHTPAD(10)
        `;

        assert.equal(getCommentFor(doc), "[__RIGHTPAD(10)]");

        doc = `
            __RIGHTPAD(0xaa)
        `;

        assert.equal(getCommentFor(doc), "[0x00...0aa]");
    });

    test('__codesize', () => {
        let doc = `
            __codesize(10)
        `;

        assert.equal(getCommentFor(doc), "[__codesize(10)]");

        doc = `
            __codesize(MACRO1)
        `;

        assert.equal(getCommentFor(doc), "[__codesize(MACRO1)]");
    });

    test.only('__tablestart', () => {
        let doc = `
            __tablestart(10)
        `;

        assert.equal(getCommentFor(doc), "[__tablestart(10)]");

        doc = `
            #define jumptable SWITCH_TABLE {
                jump_one jump_two jump_three jump_four
            }
            __tablestart(SWITCH_TABLE)
        `;

        assert.equal(getCommentFor(doc), "[__tablestart(SWITCH_TABLE)]");
    });
});