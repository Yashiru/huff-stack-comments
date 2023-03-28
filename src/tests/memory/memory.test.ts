import * as assert from 'assert';
import * as vscode from 'vscode';
import { Memory } from '../../memory/memory';
import { uint256 } from '../../uint256';
import { MAX_INT256 } from '../../uint256/arithmetic';

suite('Memory', () => {
    vscode.window.showInformationMessage('Start memory tests.');

    test('mstore', () => {
        const mem = new Memory();
        let word = uint256(10);

        mem.mstore(word, 0);

        assert.deepEqual(
            mem.heap, 
            new Uint8Array(
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10]
            )
        );

        word = uint256(20);
        mem.mstore(word, 32);

        assert.deepEqual(
            mem.heap, 
            new Uint8Array(
                [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20,
                ]
            )
        );

        word = uint256(30);
        mem.mstore(word, 16);

        assert.deepEqual(
            mem.heap, 
            new Uint8Array(
                [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20
                ]
            )
        );

        word = uint256(MAX_INT256).mul(2).add(1);
        mem.mstore(word, 0);

        assert.deepEqual(
            mem.heap, 
            new Uint8Array(
                [
                    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20
                ]
            )
        );
    });

    test('mload', () => {
        const mem = new Memory();
        const word1 = uint256(MAX_INT256).mul(2).add(1);
        const word2 = uint256(0);
        const word3 = uint256(MAX_INT256);

        mem.mstore(word1, 0);
        mem.mstore(word2, 32);
        mem.mstore(word3, 64);

        assert.deepEqual(mem.mload(0).toByteArray(), word1.toByteArray());
        assert.equal(mem.mload(0).eq(word1), true);

        assert.deepEqual(mem.mload(32).toByteArray(), word2.toByteArray());
        assert.equal(mem.mload(32).eq(word2), true);

        assert.deepEqual(mem.mload(64).toByteArray(), word3.toByteArray());
        assert.equal(mem.mload(64).eq(word3), true);

        const word4 = uint256("0xffffffffffffffffffffffffffffffff00000000000000000000000000000000");
        assert.deepEqual(mem.mload(16).toByteArray(), word4.toByteArray());
        assert.equal(mem.mload(16).eq(word4), true);
    });
});