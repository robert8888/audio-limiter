import parameterDescriptors from "./LimiterWorkletProcessorParameters";
import { ampToDB, dBToAmp } from "./utils/dBTransforms";
import DelayBuffer from "./DelayBuffer";
const contextSampleRate = sampleRate;
export default class LimiterWorkletProcessor extends AudioWorkletProcessor {
    constructor({ numberOfInputs, numberOfOutputs, channelCount, outputChannelCount, channelCountMode, parameterData, processorOptions }) {
        if (outputChannelCount === undefined || channelCount !== outputChannelCount[0]) {
            throw new Error('Channel count of first output have to be the same as channelCount');
        }
        if (channelCountMode !== "explicit") {
            throw new Error('Limiter worklet processor - channelCountMode must be "explicit".');
        }
        if (numberOfInputs !== 1) {
            throw new Error('Limiter worklet processor expect numberOfInputs equal 1.');
        }
        if (numberOfOutputs !== 1) {
            throw new Error('Limiter worklet processor expect numberOfOutputs equal 1.');
        }
        if (processorOptions.time < 0 || processorOptions.time > 10) {
            throw new Error("Time parameter in limiter worklet processor have to be in range 0 - 10");
        }
        super();
        this.time = processorOptions.time;
        this.buffers = new Array(channelCount || outputChannelCount[0])
            .fill(new DelayBuffer(0)).map(() => new DelayBuffer(~~(contextSampleRate * this.time)));
        this.sampleEnvelope = 0;
    }
    static get parameterDescriptors() { return parameterDescriptors; }
    ;
    getEnvelope(output, attackTime, releaseTime) {
        const envelope = new Float32Array(output.length);
        const attackGain = Math.exp(-1 / (contextSampleRate * attackTime));
        const releaseGain = Math.exp(-1 / (contextSampleRate * releaseTime));
        for (let i = 0; i < output.length; i++) {
            const inputEnvelope = Math.abs(output[i]);
            if (this.sampleEnvelope < inputEnvelope) {
                this.sampleEnvelope = inputEnvelope + attackGain * (this.sampleEnvelope - inputEnvelope);
            }
            else {
                this.sampleEnvelope = inputEnvelope + releaseGain * (this.sampleEnvelope - inputEnvelope);
            }
            envelope[i] = this.sampleEnvelope;
        }
        return envelope;
    }
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];
        const postGainAmp = dBToAmp(parameters.postGain[0] || 0);
        const preGainAmp = dBToAmp(parameters.preGain[0] || 0);
        const threshold = parameters.threshold[0] || 0;
        const attack = parameters.attack[0] || 0;
        const release = parameters.release[0] || 0;
        const bypass = parameters.bypass[0] || 0;
        for (let channel = 0; channel < input.length; channel++) {
            const length = input[channel].length;
            for (let i = 0; i < length; i++) {
                output[channel][i] = input[channel][i] * preGainAmp;
            }
            const envelope = this.getEnvelope(output[channel], attack, release);
            if (this.time > 0) {
                for (let i = 0; i < length; i++) {
                    this.buffers[channel].write(output[channel][i]);
                    output[channel][i] = this.buffers[channel].read();
                }
            }
            if (!bypass)
                for (let i = 0; i < length; i++) {
                    const gainDB = Math.min(threshold - ampToDB(envelope[i]), 0);
                    const gainAmp = dBToAmp(gainDB);
                    output[channel][i] *= (gainAmp * postGainAmp);
                }
        }
        return true;
    }
}
registerProcessor('limiter-processor', LimiterWorkletProcessor);
