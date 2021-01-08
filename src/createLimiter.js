import { worklet } from "../dist/limiter-audio-worklet-processor-module.js";
const blob = new Blob([worklet], { type: 'application/javascript; charset=utf-8' });
class LimiterAudioWorkletNode extends AudioWorkletNode {
    get attack() {
        return this.parameters.get("attack");
    }
    get release() {
        return this.parameters.get("release");
    }
    get threshold() {
        return this.parameters.get("threshold");
    }
    get preGain() {
        return this.parameters.get("preGain");
    }
    get postGain() {
        return this.parameters.get("postGain");
    }
}
function validateOptions(options) {
    if (!options)
        return;
    if (options.channelCount &&
        options.outputChannelCount?.length &&
        options.channelCount !== options.outputChannelCount[0]) {
        throw new Error('The channelCount must be the same as the outputChannelCount of the first output.');
    }
    if (options.channelCountMode && options.channelCountMode !== "explicit") {
        throw new Error('Limiter audio node expects channelCountMode "explicit".');
    }
    if (options.numberOfInputs && options.numberOfInputs !== 1) {
        throw new Error('Limiter audio node expect numberOfInputs equal 1.');
    }
    if (options.numberOfOutputs && options.numberOfOutputs !== 1) {
        throw new Error('Limiter audio node expect numberOfOutputs equal 1.');
    }
    if (options.time && (options.time < 0 || options.time > 10)) {
        throw new Error("Time parameter in limiter audio node have to be in range 0 - 10");
    }
}
function normalizeOptions(options) {
    const time = options?.time || 0.005;
    delete options?.time;
    const channelCount = options?.channelCount || 2;
    const outputChannelCount = [2];
    return { ...options,
        channelCountMode: "explicit",
        channelCount,
        outputChannelCount,
        processorOptions: {
            ...options?.processorOptions,
            time,
        }
    };
}
async function createLimiterNode(context, options) {
    options = normalizeOptions(options);
    const url = URL.createObjectURL(blob);
    await context.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);
    const worklet = new LimiterAudioWorkletNode(context, 'limiter-processor', options);
    return worklet;
}
AudioContext.prototype.createLimiter = async function (options) {
    validateOptions(options);
    return createLimiterNode(this, options);
};
OfflineAudioContext.prototype.createLimiter = async function (options) {
    validateOptions(options);
    return createLimiterNode(this, options);
};
