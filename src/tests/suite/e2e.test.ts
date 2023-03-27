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
});