import {} from 'jasmine';
import LimiterNode from  "../src/createLimiter";
import parameters from "../src/LimiterWorkletProcessorParameters"

describe("Creating limiter wrapper", () => {
    
    it("Should Limiter by a instance of AudioNode and implements EventTarget", () => {
        const context = new AudioContext();
        const limiter = new LimiterNode(context);
        expect(limiter.channelCount).toBe(2);
        expect(limiter.channelCountMode).toBe("max");
        expect(typeof limiter.connect).toBe("function");
        expect(typeof limiter.disconnect).toBe("function");
        expect(limiter.context).toBeInstanceOf(AudioContext);
        expect(limiter.numberOfInputs).toBe(1);
        expect(limiter.numberOfOutputs).toBe(1);

        expect(typeof limiter.addEventListener).toBe("function")
        expect(typeof limiter.removeEventListener).toBe("function")
        expect(typeof limiter.dispatchEvent).toBe("function")
    })

    it("Should fail with incompatible parameters", () =>{
        const context = new AudioContext();

        expect(() => new LimiterNode(context, {numberOfInputs: 3})).toThrowError(/numberOfInputs/);
        expect(() => new LimiterNode(context, {numberOfOutputs: 3})).toThrowError(/numberOfOutputs/);
        expect(() => new LimiterNode(context, {channelCountMode: "max"})).toThrowError(/expects channelCountMode "explicit"/);
    })

    it("Should by possible connection and disconnection to audio nodes", () => {
        const context = new AudioContext();
        const limiter = new LimiterNode(context);
        const gain1 = new GainNode(context);
        const gain2 = new GainNode(context);
        
        expect(() => gain1.connect(limiter)).not.toThrowError();
        expect(() => limiter.connect(gain2)).not.toThrowError();

        expect(() => gain1.disconnect(limiter)).not.toThrowError();
        expect(() => limiter.disconnect(gain2)).not.toThrowError();;
    })

    it("Should contain all audio worklet params", async () => {
        const context = new AudioContext();
        const limiter = new LimiterNode(context)
        await limiter.isReady;
        parameters.forEach(parameter => {
            const audioParam = limiter.parameters.get(parameter.name);
            expect(audioParam).toBeInstanceOf(AudioParam);
            expect(audioParam.defaultValue).toBeCloseTo(parameter.defaultValue, .0005);
            expect(audioParam.minValue).toBeCloseTo(parameter.minValue, .0005);
            expect(audioParam.maxValue).toBeCloseTo(parameter.maxValue, .0005);
        })
        parameters.forEach(parameter => {
            const audioParam = limiter[parameter.name];
            expect(audioParam).toBeInstanceOf(AudioParam);
            expect(audioParam.defaultValue).toBeCloseTo(parameter.defaultValue, .0005);
            expect(audioParam.minValue).toBeCloseTo(parameter.minValue, .0005);
            expect(audioParam.maxValue).toBeCloseTo(parameter.maxValue, .0005);
        })    
    })

    it("Should limit gained sinus audio data", async () =>{
        const context = new OfflineAudioContext({length: 44100 * .01, numberOfChannels: 1, sampleRate: 44100});
        const limiter = new LimiterNode(context);
        await limiter.isReady;
        
        const oscillator = new OscillatorNode(context);
        oscillator.type = "sine";

        const gain = new GainNode(context);
        gain.gain.value = 10;

        oscillator.connect(gain)
        gain.connect(limiter);
        limiter.connect(context.destination);

        oscillator.start(0);
        const buffer = await context.startRendering();
        const data = buffer.getChannelData(0);
        expect(data.every(sample => sample >= -1 && sample <= 1)).toBeTrue();
    })
})