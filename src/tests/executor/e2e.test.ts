import * as assert from 'assert';
import * as vscode from 'vscode';
import { getAllCommentFor, getCommentFor } from '../utils';


suite('End to end tests', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Macro input and output stack', () => {
        const doc = `
            #define macro MACRO1() = takes(0) returns(0) {
                0x01 0x02 0x30 0x40                         // Testing this line
                MACRO2()                                    // Testing this line
                0x05 0x06                                   // Testing this line
            }
            
            #define macro MACRO2() = takes(2) returns(2) {  // Testing this line
                pop pop                                     // Testing this line
                0x03 0x04
            }
        `;

        const comments = getAllCommentFor(doc);
        assert.equal(comments[1], "[0x40, 0x30, 0x02, 0x01]");
        assert.equal(comments[5], "[0x04, 0x03, 0x02, 0x01]");
        assert.equal(comments[6], "[0x06, 0x05, 0x04, 0x03, 0x02, 0x01]");
        assert.equal(comments[7], "[takes[0], takes[1]]");
        assert.equal(comments[8], "[]");
    });

    test('Store words from the stack into memory', () => {
        let doc = `
            0x20 0x00 mstore
            0x01 0x00 sub
            0x20 mstore
        `;

        assert.equal(getCommentFor(doc), "[]");

        doc = `
            0x20 codesize mstore
        `;

        assert.equal(getCommentFor(doc), "[]");
    });

    test('Load memory words onto the stack', () => {
        let doc = `
            0x20 0x00 mstore
            0x01 0x00 sub
            0x20 mstore

            0x00 mload
            0x20 mload
            0x00 mload
            0x02 mload
        `;

        assert.equal(getCommentFor(doc), "[0x20ffff, 0x20, 0xff...f, 0x20]");

        doc = `
            0x20 codesize mstore
            codesize mload
        `;

        assert.equal(getCommentFor(doc), "[mem[codeSize]]");
    });
});