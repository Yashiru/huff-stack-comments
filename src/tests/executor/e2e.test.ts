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

    test('Complex jumps', () => {
        let doc = `
            #define macro MAIN_ERC20() = takes(0) returns (0) {                       // []
                // Identify which function is being called.
                0x00 calldataload 0xE0 shr                                            // [calldata[0x00] >> 0xE0]
            
                /* ERC20 JumpDest */
                dup1 __FUNC_SIG(transfer) eq transfer jumpi                           // [calldata[0x00] >> 0xE0]
                dup1 __FUNC_SIG(transferFrom) eq transferFrom jumpi                   // [calldata[0x00] >> 0xE0]
                dup1 __FUNC_SIG(balanceOf) eq balanceOf jumpi                         // [calldata[0x00] >> 0xE0]
                dup1 __FUNC_SIG(totalSupply) eq totalSupply jumpi                     // [calldata[0x00] >> 0xE0]
                dup1 __FUNC_SIG(approve) eq approve jumpi                             // [calldata[0x00] >> 0xE0]
                dup1 __FUNC_SIG(increaseAllowance) eq increaseAllowance jumpi         // [calldata[0x00] >> 0xE0]
                dup1 __FUNC_SIG(decreaseAllowance) eq decreaseAllowance jumpi         // [calldata[0x00] >> 0xE0]
                dup1 __FUNC_SIG(allowance) eq allowance jumpi                         // [calldata[0x00] >> 0xE0]
                dup1 __FUNC_SIG(decimals) eq decimals jumpi                           // [calldata[0x00] >> 0xE0]
                dup1 __FUNC_SIG(name) eq name jumpi                                   // [calldata[0x00] >> 0xE0]
                dup1 __FUNC_SIG(symbol) eq symbol jumpi                               // [calldata[0x00] >> 0xE0]
                /* Ownable JumpDest */
                dup1 __FUNC_SIG(owner) eq owner jumpi                                 // []
            
                0xaaaaaa                                                              // [0xaa...a]
            
                continue jump                                                         // [0xaa...a]
            
                /* ERC20 JumpDest */
                transfer:                                                             // [calldata[0x00] >> 0xE0]
                    0x01                                                              // [0x01, calldata[0x00] >> 0xE0]
                    TRANSFER()                                                        // [0x01, calldata[0x00] >> 0xE0]
                transferFrom:                                                         // [calldata[0x00] >> 0xE0]
                    0x02                                                              // [0x02, calldata[0x00] >> 0xE0]
                    TRANSFER_FROM()                                                   // [0x02, calldata[0x00] >> 0xE0]
                balanceOf:                                                            // [0x02, calldata[0x00] >> 0xE0]
                    0x03                                                              // [0x03, 0x02, calldata[0x00] >> 0xE0]
                    BALANCE_OF()                                                      // [0x03, 0x02, calldata[0x00] >> 0xE0]
                totalSupply:                                                          // [calldata[0x00] >> 0xE0]
                    0x04                                                              // [0x04, calldata[0x00] >> 0xE0]
                    TOTAL_SUPPLY()                                                    // [0x04, calldata[0x00] >> 0xE0]
                approve:                                                              // [calldata[0x00] >> 0xE0]
                    0x05                                                              // [0x05, calldata[0x00] >> 0xE0]
                    APPROVE()                                                         // [0x05, calldata[0x00] >> 0xE0]
                increaseAllowance:                                                    // [calldata[0x00] >> 0xE0]
                    0x06                                                              // [0x06, calldata[0x00] >> 0xE0]
                    INCREASE_ALLOWANCE()                                              // [0x06, calldata[0x00] >> 0xE0]
                decreaseAllowance:                                                    // [calldata[0x00] >> 0xE0]
                    0x07                                                              // [0x07, calldata[0x00] >> 0xE0]
                    DECREASE_ALLOWANCE()                                              // [0x07, calldata[0x00] >> 0xE0]
                allowance:                                                            // [calldata[0x00] >> 0xE0]
                    0x08                                                              // [0x08, calldata[0x00] >> 0xE0]
                    ALLOWANCE()                                                       // [0x08, calldata[0x00] >> 0xE0]
                decimals:                                                             // [calldata[0x00] >> 0xE0]
                    0x09                                                              // [0x09, calldata[0x00] >> 0xE0]
                    DECIMALS()                                                        // [0x09, calldata[0x00] >> 0xE0]
                name:                                                                 // [calldata[0x00] >> 0xE0]
                    0x0a                                                              // [0x0a, calldata[0x00] >> 0xE0]
                    NAME()                                                            // [0x0a, calldata[0x00] >> 0xE0]
                symbol:                                                               // [calldata[0x00] >> 0xE0]
                    0x0b                                                              // [0x0b, calldata[0x00] >> 0xE0]
                    SYMBOL()                                                          // [0x0b, calldata[0x00] >> 0xE0]
            
                /* Ownable JumpDest */
                owner:                                                                // []
                    0x0c                                                              // [0x0c, calldata[0x00] >> 0xE0]
                    OWNER()                                                           // [0x0c, calldata[0x00] >> 0xE0]
            
                continue:                                                             // [0xaa...a]
            }
        `;
        const comments = getAllCommentFor(doc);

        // Check all jumpi
        for(let i = 1; i <= 12; i++){
            assert.equal(comments[i], "[calldata[0x00] >> 0xE0]");
        }
        comments.splice(0, 14);

        // Check stack when no jumpi jumps
        assert.equal(comments[0], "[0xaa...a, calldata[0x00] >> 0xE0]");
        assert.equal(comments[1], "[0xaa...a, calldata[0x00] >> 0xE0]");
        comments.splice(0, 2);

        // Check all jumpdest
        let index = 1;
        for(let i = 0; i < 12*3; i+=3){
            const hexIndex = "0x0"+index.toString(16);
            assert.equal(comments[i], "[calldata[0x00] >> 0xE0]");
            assert.equal(comments[i+1], `[${hexIndex}, calldata[0x00] >> 0xE0]`);
            assert.equal(comments[i+2], `[${hexIndex}, calldata[0x00] >> 0xE0]`);
            index++;
        }
        comments.splice(0, 12*3);

        // Check "continue" jumpdest
        assert.equal(comments[0], "[0xaa...a, calldata[0x00] >> 0xE0]");
    });
});