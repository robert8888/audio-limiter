import { validateLimiterNodeOptions } from "./LimiterAudioNodeOptions";
import "./AudioNodePatch";
export default class LimiterNode extends EventTarget {
    constructor(context, options) {
        validateLimiterNodeOptions(options);
        super();
        this._context = context;
        const gainOptions = {
            channelCount: options?.channelCount ?? 2,
            channelCountMode: options?.channelCountMode || "max",
            channelInterpretation: "speakers"
        };
        this._input = new GainNode(context, gainOptions);
        this._output = new GainNode(context, gainOptions);
        this._input.connect(this._output);
        this._initLimiter(options);
    }
    get isReady() {
        if (this._limiter)
            return Promise.resolve(true);
        return new Promise((res, rej) => {
            this._readyResolve = res;
            this._readyReject = rej;
        });
    }
    async _initLimiter(options) {
        this._limiter = await this._context.createLimiter(options);
        if (!this._limiter && this._readyReject)
            this._readyReject(false);
        this._input.disconnect(this._output);
        this._input.connect(this._limiter);
        this._limiter.connect(this._output);
        if (this._readyResolve)
            this._readyResolve();
    }
    get input() {
        return this._input;
    }
    connect(destination, output, input) {
        this._output.connect(destination, output, input);
        return destination;
    }
    disconnect(destination, output, input) {
        this._output.disconnect(destination, output, input);
    }
    __connectFrom(source) {
        source.connect(this._input);
    }
    __disconnectFrom(source) {
        source.disconnect(this._input);
    }
    get context() {
        return this._context;
    }
    get numberOfInputs() {
        return 1;
    }
    get numberOfOutputs() {
        return 1;
    }
    get channelCount() {
        return this._limiter?.channelCount || this._input.channelCount;
    }
    set channelCount(value) {
        this._input.channelCount = value;
        this._output.channelCount = value;
        if (this._limiter)
            this._limiter.channelCount = value;
    }
    get channelCountMode() {
        if (this._limiter)
            return this._limiter.channelCountMode;
        return this._input.channelCountMode;
    }
    set channelCountMode(value) {
        this._output.channelCountMode = value;
        this.input.channelCountMode = value;
    }
    get channelInterpretation() {
        if (this._limiter)
            return this._limiter.channelInterpretation;
        return this._input.channelInterpretation;
    }
    set channelInterpretation(value) {
        this._input.channelInterpretation = value;
        this._output.channelInterpretation = value;
        if (this._limiter)
            this._limiter.channelInterpretation = value;
    }
    get parameters() {
        return this._limiter?.parameters;
    }
    get attack() {
        return this._limiter.attack;
    }
    get release() {
        return this._limiter.release;
    }
    get threshold() {
        return this._limiter.threshold;
    }
    get preGain() {
        return this._limiter.preGain;
    }
    get postGain() {
        return this._limiter.postGain;
    }
    get bypass() {
        return this._limiter.bypass;
    }
}
