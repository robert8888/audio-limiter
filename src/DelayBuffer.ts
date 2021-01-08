import { time } from "console";

export interface IDelayBuffer{
    read(): number;
    write(number): void;
    readonly length: number;
    readonly size: number;

    readonly debug: {
        source :Float32Array,
        writePointer: number,
        readPointer: number
    }
}

export default class DelayBuffer implements IDelayBuffer{
    private array: Float32Array;
    private readPointer: number;
    private writePointer: number;

    public readonly length: number;
    public readonly size: number;

    constructor(length){
        length = Math.floor(length);
        this.array = new Float32Array(length * 2).fill(0);
        this.readPointer = 0;
        this.writePointer = length;

        this.length = length;
        this.size = this.array.length;
    }


    public read(){
        const value = this.array[this.readPointer % this.size];
        this.readPointer++;
        return value;
    }

    public write(value){
        this.array[this.writePointer++ % this.size] = value;
    }

    public get debug() {
        return {
            source: Float32Array.from(this.array),
            writePointer: this.writePointer,
            readPointer: this.readPointer
        }
    }
}