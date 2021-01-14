import "@babel/polyfill";
import "../src/createLimiter";
import { LimiterAudioWorkletNode } from "../src/LimiterAudioWorkletNode";
import compareAudioBuffers from "./utils/compareAudioBuffers";
import connectInChain from "./utils/connectNodesInChain";
import createContextBootstrap from "./utils/createContextBootstrap";
import renderBufferAudio from "./utils/renderBufferAudio";
//@ts-ignore


const offlineAudioContextOptions = <OfflineAudioContextOptions>{
  length: 44100 * .5, // half second
  sampleRate: 44100,
  numberOfChannels: 2, 
}
  
describe('Processing audio - limiting', () => {

    it("Processing not clipping audio - left it untouched", async () => {
        const defaultTime = 0.005;
        const delaySize = ~~(offlineAudioContextOptions.sampleRate * defaultTime);
        // reference signal
        const { 
          oscillator: refOscillatorNode,
          gain: refGainNode,
          context: refContext 
        } = createContextBootstrap(offlineAudioContextOptions);

        refOscillatorNode.start(refContext.currentTime + 0);
        refOscillatorNode.stop(refContext.currentTime + 5);

        refGainNode.gain.value = 0.5;

        connectInChain([
          refOscillatorNode, 
          refGainNode, 
          refContext.destination
        ])

        const referenceAudioBuffer = await refContext.startRendering();

        // with limiter apply

        const {
          oscillator: oscillatorNode, 
          gain: gainNode, 
          context 
        } = createContextBootstrap(offlineAudioContextOptions);
  
        const limiterNode = <AudioNode>await context.createLimiter()
        gainNode.gain.value = 0.5;
    
        oscillatorNode.start(context.currentTime + 0);
        oscillatorNode.stop(context.currentTime + 5);

        connectInChain([
          oscillatorNode, 
          gainNode, 
          limiterNode, 
          context.destination
        ])

        const audioBuffer = await context.startRendering();

        expect(compareAudioBuffers(referenceAudioBuffer, audioBuffer, delaySize)).toBeTrue();
    })

    
    it("Should limit clipping gained sinus wave", async () => {
        const {
           oscillator: refOscillator,
           gain: refGain,
           context: refContext
        } = createContextBootstrap(offlineAudioContextOptions);

        refGain.gain.value = 5;

        refOscillator.start(0);

        connectInChain([refOscillator, refGain, refContext.destination])

        const refBuffer = await refContext.startRendering();

        expect(refBuffer.getChannelData(0)
          .some(sample => sample > 1 || sample < -1)
        ).toBe(true);

        const {
           oscillator,
           gain,
           context
        } = createContextBootstrap(offlineAudioContextOptions);
        
        gain.gain.value = 5;
        oscillator.start(0);

        const limiter = <AudioNode>await context.createLimiter({time: .01})

        connectInChain([oscillator, gain, limiter, context.destination])

        const buffer = await context.startRendering();

        expect(buffer.getChannelData(0)
          .some(sample => sample > 1 || sample < -1)
        ).toBe(false)
    })


    it("Should limit constant power audio buffer source", async () => {
      //@ts-ignore
      const renderBufferGenerator = <AsyncIterator>renderBufferAudio(offlineAudioContextOptions, {});
      await renderBufferGenerator.next();
      const bufferSource = new Float32Array(44100).fill(2);
      await renderBufferGenerator.next(bufferSource)
      const outputBuffer = (await renderBufferGenerator.next()).value;

      [0, 1].forEach(channel => {
          const data = outputBuffer.getChannelData(channel);
          expect(data.every(sample => sample >= -1 && sample <= 1)).toBe(true)
      })
    })


    it("Should limit random wide gained noise", async () => {
      //@ts-ignore
      const renderBufferGenerator = <AsyncIterator>renderBufferAudio(
        offlineAudioContextOptions,
        {threshold: -1}
      );
      await renderBufferGenerator.next();
      const bufferSource = new Float32Array(44100).fill(0).map(() => (Math.random() * 6) - 3)
      await renderBufferGenerator.next(bufferSource)
      const outputBuffer = (await renderBufferGenerator.next()).value;

      [0, 1].forEach(channel => {
         const data = outputBuffer.getChannelData(channel);
         expect(data.every(sample => sample >= -1 && sample <= 1)).toBe(true)
      })
    })


    it("Should have correct response to pre i post gain param", async () => {
      //@ts-ignore
      const renderBufferGenerator = <AsyncIterator>renderBufferAudio(
        offlineAudioContextOptions, 
        {threshold: -2, preGain: 8, postGain: 1.5}
      );
      await renderBufferGenerator.next();
      const bufferSource = new Float32Array(44100).fill(1).map(() => {
          return  [-.25, .25, -.5, .5, ][Math.round(Math.random() * 3)]
        })
      await renderBufferGenerator.next(bufferSource)
      const outputBuffer = (await renderBufferGenerator.next()).value;


      [0, 1].forEach(channel => {
         const data = outputBuffer.getChannelData(channel);
         expect(data.every(sample => sample >= -1 && sample <= 1)).toBe(true)
      })
    })


    it("Should have correct response to params change in time", async () => {
      offlineAudioContextOptions.length = 5 * 44100; // 5 seconds
        //@ts-ignore
      const renderBufferGenerator = <AsyncIterator>renderBufferAudio(
        offlineAudioContextOptions, 
        {threshold: -2, preGain: 8, postGain: 1.5}
      );
      await renderBufferGenerator.next();
      const bufferSource = new Float32Array(44100).fill(1).map(() => (Math.random() * 2) - 1)
      const limiter = <AudioWorkletNode>(await renderBufferGenerator.next(bufferSource)).value;

      const attack = limiter.parameters.get("attack");
      const release = limiter.parameters.get("release");
      const preGain = limiter.parameters.get("preGain");
      const postGain = limiter.parameters.get("postGain");
      const threshold = limiter.parameters.get("threshold");

      attack.setValueAtTime(0, 0)
      attack.setTargetAtTime(3, 0, 3);
      attack.setTargetAtTime(-1, 0, 2);

      release.setValueAtTime(0, 0)
      release.setTargetAtTime(3, 0, 3);
      release.setTargetAtTime(0, 0, 2);


      preGain.setValueAtTime(0, 0)
      preGain.setTargetAtTime(10, 0, 3);
      preGain.setTargetAtTime(0, 0, 2);

      postGain.setValueAtTime(0, 0)
      postGain.setTargetAtTime(-10, 0, 3);
      postGain.setTargetAtTime(0, 0, 2);

      
      threshold.setValueAtTime(0, 0)
      threshold.setTargetAtTime(-10, 0, 3);
      threshold.setTargetAtTime(-1, 0, 2);

      const outputBuffer = (await renderBufferGenerator.next()).value;

      [0, 1].forEach(channel => {
         const data = outputBuffer.getChannelData(channel);
         expect(data.every(sample => sample >= -1 && sample <= 1)).toBe(true)
      })

      offlineAudioContextOptions.length = .5 * 44100; // back to .5 seconds
    })

    it("Should switch to bypass mode", async () => {
      offlineAudioContextOptions.length = .5 * offlineAudioContextOptions.sampleRate; // 5 seconds
        //@ts-ignore
      const renderBufferGenerator = <AsyncIterator>renderBufferAudio(offlineAudioContextOptions);
      await renderBufferGenerator.next();
      const bufferSource = new Float32Array(44100).fill(5)
      const limiter = <LimiterAudioWorkletNode>(await renderBufferGenerator.next(bufferSource)).value;

      limiter.bypass.setValueAtTime(0.1, 0.25);

      const outputBuffer = (await renderBufferGenerator.next()).value;
      const data = outputBuffer.getChannelData(0);

      const frameSize = 128
      const bypassIndex = 0.25 * offlineAudioContextOptions.sampleRate
      const limited = data.slice(0, bypassIndex - frameSize); // 
      const bypassed = data.slice(bypassIndex + frameSize);
      expect(limited.every(sample => sample > -1  && sample <= 1)).toBeTrue();
      expect(bypassed.every(sample => sample === 5)).toBeTrue();
    })

})



