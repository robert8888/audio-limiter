import DelayBuffer from "../../src/DelayBuffer";


describe("Delay Buffer Tests ", () => {
    it("It should implements delayBuffer interface", () => {
        const buffer = new DelayBuffer(10);

        expect(buffer).toBeInstanceOf(DelayBuffer);
        expect(buffer.length).toBe(10);
        expect(typeof buffer.write).toBe("function");
        expect(typeof buffer.read).toBe("function");
    })

    it("Should implement FIFO queue", () => {
        const data =[1,2,3,4,5,6,7,8,9,10];
        const buffer = new DelayBuffer(data.length);
        
        data.forEach(n => buffer.write(n));
        data.forEach(() => buffer.read()); // empty part of buffer 
        data.forEach(n => expect(n).toBe(buffer.read()))
    })

    it("Should implement FIFO queue - overwriting", () => {
        const data =[1,2,3, 4,5,6, 7,8,9, 10];
        
        const buffer = new DelayBuffer(3);

        data.forEach(n => buffer.write(n));
        

        [10,5,6].forEach(n => expect(n).toBe(buffer.read()));
        //read pointer should work in 'ring'
        [7,8,9].forEach(n => expect(n).toBe(buffer.read()));
    })
})
