import { IConnectable } from "./AudioNodePatch";
import { LimiterAudioWorkletNode } from "./LimiterAudioWorkletNode";
import { LimiterAudioNodeOptions, validateLimiterNodeOptions } from "./LimiterAudioNodeOptions";
import "./AudioNodePatch";



export default class LimiterNode extends EventTarget implements IConnectable, AudioNode{
    private _context: AudioContext | OfflineAudioContext ;
    private _input: GainNode;
    private _output: GainNode;
    private _limiter: LimiterAudioWorkletNode | undefined;
    private _readyResolve;
    private _readyReject;

    constructor(context: AudioContext | OfflineAudioContext, options?: LimiterAudioNodeOptions){
        validateLimiterNodeOptions(options);
        super()
        this._context = context;
        const gainOptions = <GainOptions>{
            channelCount: options?.channelCount ?? 2,
            channelCountMode: options?.channelCountMode || "max",
            channelInterpretation: "speakers"
        }
        this._input = new GainNode(context, gainOptions);
        this._output = new GainNode(context, gainOptions);
        this._input.connect(this._output)
        this._initLimiter(options);
    }

    public get isReady(): Promise<boolean>{
        if(this._limiter)  
            return Promise.resolve(true);

        return new Promise((res, rej) => {
            this._readyResolve = res;
            this._readyReject = rej;
        })
    }

    private async _initLimiter(options?: LimiterAudioNodeOptions){
        this._limiter = <LimiterAudioWorkletNode>await this._context.createLimiter(options);
        if(!this._limiter && this._readyReject)
            this._readyReject(false);
        this._input.disconnect(this._output);     
        this._input.connect(this._limiter);
        this._limiter.connect(this._output);
        if(this._readyResolve)
            this._readyResolve();
    }

    public get input(): AudioNode{
        return this._input;
    }

    public connect(destinationNode: AudioNode, output?: number, input?: number): AudioNode;
    public connect(destinationParam: AudioParam, output?: number): void;
    public connect(destination: any, output: any, input?: number){
        this._output.connect(destination, output, input);
        return destination;
        
    }

    public disconnect(): void;
    public disconnect(output: number): void;
    public disconnect(destinationNode: AudioNode): void;
    public disconnect(destinationNode: AudioNode, output: number): void;
    public disconnect(destinationNode: AudioNode, output: number, input: number): void;
    public disconnect(destinationParam: AudioParam): void;
    public disconnect(destinationParam: AudioParam, output: number): void;
    public disconnect(destination?: any, output?: number, input?: number){
        this._output.disconnect(destination, <number>output, <number>input)
    }

    public __connectFrom(source: AudioNode){
        source.connect(this._input)
    }

    public __disconnectFrom(source: AudioNode){
        source.disconnect(this._input)
    }


    public get context(): BaseAudioContext{
        return this._context;
    }

    public get numberOfInputs(): number{
        return 1;
    }

    public get numberOfOutputs(): number{
        return 1;
    }

    public get channelCount(): number{
        return this._limiter?.channelCount || this._input.channelCount;
    }

    public set channelCount(value: number){
        this._input.channelCount = value;
        this._output.channelCount = value;
        if(this._limiter)
            this._limiter.channelCount = value;
    }

    public get channelCountMode(): ChannelCountMode{
        if(this._limiter)
            return this._limiter.channelCountMode;
        
        return this._input.channelCountMode;
    }

    public set channelCountMode(value: ChannelCountMode){
        this._output.channelCountMode = value;
        this.input.channelCountMode = value;
    }

    public get channelInterpretation(): ChannelInterpretation{
        if(this._limiter)
            return this._limiter.channelInterpretation;
        return this._input.channelInterpretation;
    }

    public set channelInterpretation(value: ChannelInterpretation){
        this._input.channelInterpretation = value;
        this._output.channelInterpretation = value;
        if(this._limiter)
            this._limiter.channelInterpretation = value;
    }

    public get parameters(){
        return this._limiter?.parameters
    }

    public get attack(): AudioParam{
        return (<LimiterAudioWorkletNode>this._limiter).attack;
    }

    public get release(): AudioParam{
        return (<LimiterAudioWorkletNode>this._limiter).release;
    }

    public get threshold(): AudioParam{
        return (<LimiterAudioWorkletNode>this._limiter).threshold;
    }

    public get preGain(): AudioParam{
        return (<LimiterAudioWorkletNode>this._limiter).preGain;
    }

    public get postGain(): AudioParam{
        return (<LimiterAudioWorkletNode>this._limiter).postGain;
    }

    public get bypass(): AudioParam{
        return (<LimiterAudioWorkletNode>this._limiter).bypass;
    }
}