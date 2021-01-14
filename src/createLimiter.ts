import {worklet}  from  "../dist/limiter-audio-worklet-processor-module.js";
import { ILimiterAudioWorkletNode, LimiterAudioWorkletNode } from "./LimiterAudioWorkletNode";
import {LimiterAudioNodeOptions, validateLimiterNodeOptions ,normalizeLimiterNodeOptions} from "./LimiterAudioNodeOptions";
export {default} from "./Limiter";

const blob = new Blob([worklet], { type: 'application/javascript; charset=utf-8' });

declare global {
    interface AudioContext {
        createLimiter(options?: LimiterAudioNodeOptions): Promise<ILimiterAudioWorkletNode | Error>
    }

    interface OfflineAudioContext {
        createLimiter(options?: LimiterAudioNodeOptions): Promise<ILimiterAudioWorkletNode | Error>
    }

    interface AudioParamMap {
        get(name: string): AudioParam;
    }
} 


async function createLimiterNode(context: BaseAudioContext, options?: LimiterAudioNodeOptions): Promise<LimiterAudioWorkletNode>{
    options = normalizeLimiterNodeOptions(options);

    const url = URL.createObjectURL(blob);

    await context.audioWorklet.addModule(url);

    URL.revokeObjectURL(url);

    const worklet =  new LimiterAudioWorkletNode(context, 'limiter-processor', options);

    return worklet;
}

AudioContext.prototype.createLimiter = async function(options?: LimiterAudioNodeOptions){
    validateLimiterNodeOptions(options);

    return createLimiterNode(this, options)
}


OfflineAudioContext.prototype.createLimiter = async function(options?: LimiterAudioNodeOptions){
    validateLimiterNodeOptions(options);

    return createLimiterNode(this, options)
}

