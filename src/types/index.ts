
export interface IAudioWorkletProcessor {
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: { [name: string]: Float32Array }): boolean;
    port: MessagePort;
}

export interface AudioWorkletProcessor {
    port: MessagePort;
}

export interface AudioWorkletProcessorConstructor {
    parameterDescriptors: AudioParamDescriptor[];
    new (options: AudioWorkletNodeOptions): AudioWorkletProcessor;
}

export declare const AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor;
    new (): AudioWorkletProcessor;
};

export declare function registerProcessor<T extends AudioWorkletProcessorConstructor>(name: string, processorConstructor: T): void;
