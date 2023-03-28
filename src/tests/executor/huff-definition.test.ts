import * as assert from 'assert';
import * as vscode from 'vscode';
import { getCommentFor, getTokensFor } from '../utils';


suite('Huff definition tests', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('defineMacro', () => {
        let doc = `
            #define macro TEST() = takes(1) returns(0){
            }
        `;
        assert.equal(getCommentFor(doc), "[takes[0]]");

        doc = `
            #define macro TEST() =takes(1) returns(0){
            }
        `;
        assert.equal(getCommentFor(doc), "[takes[0]]");

        doc = `
            #define macro TEST()= takes(1) returns(0){
            }
        `;
        assert.equal(getCommentFor(doc), "[takes[0]]");

        doc = `
            #define macro TEST() = takes(10) returns(0){
            }
        `;
        assert.equal(getCommentFor(doc), "[takes[0], takes[1], takes[2], takes[3], takes[4], takes[5], takes[6], takes[7], takes[8], takes[9]]");

        doc = `
            #define macro TEST(mem_ptr) = takes(1) returns(0){
            }
        `;
        assert.equal(getCommentFor(doc), "[takes[0]]");

        doc = `
            #define macro TEST(mem_ptr1, mem_ptr2, mem_ptr2) = takes(1) returns(0){
            }
        `;
        assert.equal(getCommentFor(doc), "[takes[0]]");
    });

    test('defineFunction', () => {
        const doc = `
            #define function test0() returns ()
            #define function test1() returns()
            #define function test2(address) returns ()
            #define function test3() returns (address)
            #define function test4(address,uint256) returns (address,uint256)
            #define function test5(address,uint256) nonpayable returns (address)
        `;

        assert.equal(getTokensFor(doc).length, 6);

        for(let token of getTokensFor(doc)){
            assert.equal(token.tokenType.name, "defineFunction");
        }
    });

    test('defineEvent', () => {
        const doc = `
            #define event Upgraded()
            #define event Upgraded(address)
            #define event Upgraded(address,uint256)
            #define event Upgraded(address, uint256)
        `;

        assert.equal(getTokensFor(doc).length, 4);

        for(let token of getTokensFor(doc)){
            assert.equal(token.tokenType.name, "defineEvent");
        }
    });

    test('defineError', () => {
        const doc = `
            #define error ErrorName()
            #define error ErrorName(address)
            #define error ErrorName(address,uint256)
            #define error ErrorName(address, uint256)
        `;

        assert.equal(getTokensFor(doc).length, 4);

        for(let token of getTokensFor(doc)){
            assert.equal(token.tokenType.name, "defineError");
        }
    });

    test('defineConstant', () => {
        const doc = `
            #define constant CONST_VAL = 0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b
            #define constant CONST_VAL = 0xaaaa
            #define constant CONST_VAL = 25
            #define constant CONST_VAL = test
            #define constant CONST_VAL = TEST()
        `;

        assert.equal(getTokensFor(doc).length, 5);

        for(let token of getTokensFor(doc)){
            assert.equal(token.tokenType.name, "defineConstant");
        }
    });

    test('include', () => {
        const doc = `
            #include "../Proxy.huff"
            #include "../../utils/Address.huff"
            #include "../../utils/Require.huff"
        `;

        assert.equal(getTokensFor(doc).length, 3);

        for(let token of getTokensFor(doc)){
            assert.equal(token.tokenType.name, "include");
        }
    });


});