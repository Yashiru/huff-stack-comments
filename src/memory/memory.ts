import { UInt256, uint256 } from "../uint256";

export class Memory{
    private _heap: Uint8Array;

    constructor(defaultMem?: Uint8Array){
        this._heap = defaultMem || new Uint8Array();
    }

    public mload(offset: number): UInt256{
        return uint256(
            this._heap.slice(
                offset,
                offset + 32
            ).reverse().buffer
        );
    }

    public mstore(word: UInt256, offset: number){
        if(this.heap.length >= offset + 32){
            // Write memory
            this._heap.set(
                word.toByteArray(),
                offset
            );
        }
        else{
            // Extend and write memory
            const tempMem = this.heap;
            this._heap = new Uint8Array(offset + 32);

            this._heap.set(tempMem);
            this._heap.set(
                word.toByteArray(),
                offset
            );
        }
    }

    public get heap(): Uint8Array{
        return this._heap;
    }
}