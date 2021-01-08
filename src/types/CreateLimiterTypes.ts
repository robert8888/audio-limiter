export interface LimiterAudioNodeOptions extends AudioWorkletNodeOptions{
    time?: number
}

export interface ILimiterAudioWorkletNode extends AudioWorkletNode{
    attack: AudioParam;
    release: AudioParam;
    threshold: AudioParam;
    preGain: AudioParam;
    postGain: AudioParam;
}


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


