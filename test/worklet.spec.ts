import "../src/createLimiter";
import parameters from "../src/LimiterWorkletProcessorParameters"


describe("Audio worklet configuration", () =>{
    let audioContext; 
    let limiter; 
  
    beforeEach(async () => {
      audioContext = new AudioContext();
      limiter = await audioContext.createLimiter();
    });

    it("Should limiter node implements AudioNode interface", async () => {
        expect(limiter.channelCount).toBe(2);
        expect(limiter.channelCountMode).toBe("explicit");
        expect(typeof limiter.connect).toBe("function");
        expect(typeof limiter.disconnect).toBe("function");
        expect(limiter.context).toBeInstanceOf(AudioContext);
        expect(limiter.numberOfInputs).toBe(1);
        expect(limiter.numberOfOutputs).toBe(1);
    })
  
    it("Should limiter node implements EventTarget interface", async() => {
      expect(typeof limiter.addEventListener).toBe("function")
      expect(typeof limiter.removeEventListener).toBe("function")
      expect(typeof limiter.dispatchEvent).toBe("function")
    })
  
    it("Should limiter node implements AudioWorkletNode", () => {
      expect(limiter.parameters).toBeDefined()
      expect(limiter.onprocessorerror).toBeNull();
    })
  
    it("Should throw error if passed options are not correct", async  () => {
      await expectAsync(audioContext.createLimiter({numberOfInputs: 3}))
      .toBeRejectedWithError(/numberOfInputs/)
  
      await expectAsync(audioContext.createLimiter({numberOfOutputs: 3}))
      .toBeRejectedWithError(/numberOfOutputs/)
  
      await expectAsync(audioContext.createLimiter({channelCountMode: "max"}))
      .toBeRejectedWithError(/expects channelCountMode "explicit"/)
    })
  
    it("Should contain all limiter custom parameters", () => {
        parameters.forEach(parameter => {
            const audioParam = limiter.parameters.get(parameter.name);
            expect(audioParam).toBeInstanceOf(AudioParam);
            expect(audioParam.defaultValue).toBeCloseTo(parameter.defaultValue, .0005);
            expect(audioParam.minValue).toBeCloseTo(parameter.minValue, .0005);
            expect(audioParam.maxValue).toBeCloseTo(parameter.maxValue, .0005);
        })  
    })
    it("Should contain all limiter custom parameters available on worklet getters", () => {
        parameters.forEach(parameter => {
          const audioParam = limiter[parameter.name];
          expect(audioParam).toBeInstanceOf(AudioParam);
          expect(audioParam.defaultValue).toBeCloseTo(parameter.defaultValue, .0005);
          expect(audioParam.minValue).toBeCloseTo(parameter.minValue, .0005);
          expect(audioParam.maxValue).toBeCloseTo(parameter.maxValue, .0005);
      })  
    })
})