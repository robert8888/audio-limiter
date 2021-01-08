export default class DelayBuffer {
    constructor(length) {
        length = Math.floor(length);
        this.array = new Float32Array(length * 2).fill(0);
        this.readPointer = 0;
        this.writePointer = length;
        this.length = length;
        this.size = this.array.length;
    }
    read() {
        const value = this.array[this.readPointer % this.size];
        this.readPointer++;
        return value;
    }
    write(value) {
        this.array[this.writePointer++ % this.size] = value;
    }
    get debug() {
        return {
            source: Float32Array.from(this.array),
            writePointer: this.writePointer,
            readPointer: this.readPointer
        };
    }
}
