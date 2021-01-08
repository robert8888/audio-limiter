import {} from 'jasmine';
import "../src/createLimiter";
import { mockAudioNode, unMockAudioNode } from "./utils/audioNodeMock";


describe('Check limiter node builder', () => {

  it("Should exist creator function on audio context constructor", () => {
    expect(AudioContext.prototype.createLimiter).toBeDefined();
    expect(typeof AudioContext.prototype.createLimiter).toBe("function")
  })

  it("Should exist creator function on offline audio context constructor", () => {
    expect(OfflineAudioContext.prototype.createLimiter).toBeDefined();
    expect(typeof OfflineAudioContext.prototype.createLimiter).toBe("function")
  })

  it("Should be possible creation of audioNodeWorklet", async() => {
    const audioContext = new AudioContext();
    const limiter = await audioContext.createLimiter();

    expect(limiter).toBeDefined();
    expect(limiter).toBeInstanceOf(AudioWorkletNode)
  })

  it("Should be possible creation of audioNodeWorklet on offline audio context", async() => {
    const offlineAudioContext = new OfflineAudioContext({length: 1, numberOfChannels: 2, sampleRate: 44100});
    const limiter = await offlineAudioContext.createLimiter();

    expect(limiter).toBeDefined();
    expect(limiter).toBeInstanceOf(AudioWorkletNode)
  })

  it("Should be possible connection to source", async() => {
    const audioContext = new AudioContext();
    const limiter = <AudioWorkletNode> await audioContext.createLimiter();

    mockAudioNode()

    limiter.connect(audioContext.destination);
    expect(limiter.outputs.length).toBe(1);
    expect(limiter.outputs[0]).toBeInstanceOf(AudioDestinationNode);
    
    limiter.disconnect();
    expect(limiter.outputs.length).toBe(0);
    expect(true).toBeTrue();

    unMockAudioNode();
  })
})