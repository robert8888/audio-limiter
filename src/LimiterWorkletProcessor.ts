import {IAudioWorkletProcessor} from "./LimiterWorkletProcessorTypes";
import parameterDescriptors from "./LimiterWorkletProcessorParameters";
import {ampToDB, dBToAmp} from "./utils/dBTransforms";
import DelayBuffer from "./DelayBuffer";
import { env } from "process";

const contextSampleRate = sampleRate;

export default class LimiterWorkletProcessor extends AudioWorkletProcessor implements IAudioWorkletProcessor {
    //currentTime, sampleRater, currentFrame
    private time: number;
    private buffers: DelayBuffer[];
    private sampleEnvelope: number[];

    public static get parameterDescriptors() { return parameterDescriptors };

    constructor({
        numberOfInputs,
        numberOfOutputs,
        channelCount,
        outputChannelCount,
        channelCountMode,
        parameterData,
        processorOptions}: AudioWorkletNodeOptions) {
            
        if(outputChannelCount === undefined || channelCount !== outputChannelCount[0]){
            throw new Error('Channel count of first output have to be the same as channelCount');
        }
    
        if(channelCountMode !== "explicit"){
            throw new Error('Limiter worklet processor - channelCountMode must be "explicit".');
        }
        
        if(numberOfInputs !== 1){
            throw new Error('Limiter worklet processor expect numberOfInputs equal 1.');
        }
    
        if(numberOfOutputs !== 1){
            throw new Error('Limiter worklet processor expect numberOfOutputs equal 1.');
        }
    
        if(processorOptions.time < 0 || processorOptions.time > 10){
            throw new Error("Time parameter in limiter worklet processor have to be in range 0 - 10")
        }

        super();

        this.time = processorOptions.time;
        this.buffers = new Array<DelayBuffer>(channelCount || outputChannelCount[0])
            .fill(new DelayBuffer(0)).map(() => new DelayBuffer(~~(contextSampleRate * this.time)))

        this.sampleEnvelope = new Array(channelCount || outputChannelCount[0]).fill(0);
    }

    private getEnvelope(output: Float32Array, attackTime: number, releaseTime: number, channel: number): Float32Array
    {
        let sampleEnvelope = this.sampleEnvelope[channel];
        const envelope = new Float32Array(output.length);

        const attackGain = Math.exp(-1 / (contextSampleRate * attackTime));
        const releaseGain = Math.exp(-1 / (contextSampleRate * releaseTime))


        for(let i = 0; i < output.length; i++){
            const inputEnvelope = Math.abs(output[i]);
            if(sampleEnvelope < inputEnvelope){
                sampleEnvelope = inputEnvelope + attackGain * (sampleEnvelope - inputEnvelope);
            } else {
                sampleEnvelope = inputEnvelope + releaseGain * (sampleEnvelope - inputEnvelope)
            }
            envelope[i] = sampleEnvelope;
        }

        this.sampleEnvelope[channel] = sampleEnvelope;
        return envelope;
    }

    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: { [p: string]: Float32Array }): boolean {
        const input = inputs[0];
        const output = outputs[0]

        const postGainAmp = dBToAmp(parameters.postGain[0] || 0);
        const preGainAmp = dBToAmp(parameters.preGain[0] || 0)
        const threshold = parameters.threshold[0] || 0;
        const attack = parameters.attack[0] || 0;
        const release = parameters.release[0] || 0;
        const bypass = parameters.bypass[0] || 0;

        for(let channel = 0; channel < input.length; channel++){
            const length = input[channel].length;
        
            for(let i = 0 ; i < length; i++){
                output[channel][i] = input[channel][i] * preGainAmp;
            }

            const envelope  = this.getEnvelope(output[channel], attack, release, channel);

            if(this.time > 0){
                for(let i = 0; i < length; i++){
                    this.buffers[channel].write(output[channel][i])
                    output[channel][i] = this.buffers[channel].read();
                }
            }
            if(!bypass)
                for(let i = 0; i < length; i++){
                    const gainDB = Math.min(threshold - ampToDB(envelope[i]), 0);
                    const gainAmp = dBToAmp(gainDB);
                    output[channel][i] *= (gainAmp * postGainAmp); 
                }
        }

        return true;
    }
}

registerProcessor('limiter-processor', LimiterWorkletProcessor);