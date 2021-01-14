import { worklet } from "../dist/limiter-audio-worklet-processor-module.js";
import { LimiterAudioWorkletNode } from "./LimiterAudioWorkletNode";
import { validateLimiterNodeOptions, normalizeLimiterNodeOptions } from "./LimiterAudioNodeOptions";
export { default } from "./Limiter";
const blob = new Blob([worklet], { type: 'application/javascript; charset=utf-8' });
async function createLimiterNode(context, options) {
    options = normalizeLimiterNodeOptions(options);
    const url = URL.createObjectURL(blob);
    await context.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);
    const worklet = new LimiterAudioWorkletNode(context, 'limiter-processor', options);
    return worklet;
}
AudioContext.prototype.createLimiter = async function (options) {
    validateLimiterNodeOptions(options);
    return createLimiterNode(this, options);
};
OfflineAudioContext.prototype.createLimiter = async function (options) {
    validateLimiterNodeOptions(options);
    return createLimiterNode(this, options);
};
