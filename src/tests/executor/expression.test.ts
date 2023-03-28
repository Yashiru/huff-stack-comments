import * as assert from 'assert';
import * as vscode from 'vscode';
import { getCommentFor } from '../utils';


suite('Expression push tests', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('hexadecimal', () => {
        const doc = `
            0x1
            0xa
            0x01
            0xaa
            0x001
            0xaaa
            0xffffffffffffffffffffffffffffffffffa
            0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
        `;
        assert.equal(getCommentFor(doc), "[0xaa...a, 0xff...fa, 0xaaa, 0x001, 0xaa, 0x01, 0xa, 0x1]");
    });

    test('integer', () => {
        const doc = `
            10
            10000000000000000000000000000000000000000000000000000
        `;
        assert.equal(getCommentFor(doc), "[100...0, 10]");
    });

    test('variable', () => {
        const doc = `
            [CONST_VAL]
            [CONST_VAL_VERY_VERY_LONG_NAME]
            [lower_case_val]
        `;
        assert.equal(getCommentFor(doc), "[lower_case_val, CONST_VAL_VERY_VERY_LONG_NAME, CONST_VAL]");
    });

    test('memoryPointer', () => {
        const doc = `
            <mem_pointer>
            <mem_prt>
            <UPPERCASE_MEM_PRT>
        `;
        assert.equal(getCommentFor(doc), "[<UPPERCASE_MEM_PRT>, <mem_prt>, <mem_pointer>]");
    });


});