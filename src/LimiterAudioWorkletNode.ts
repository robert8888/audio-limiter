export interface ILimiterAudioWorkletNode extends AudioWorkletNode{
    attack: AudioParam;
    release: AudioParam;
    threshold: AudioParam;
    preGain: AudioParam;
    postGain: AudioParam;
}


export class LimiterAudioWorkletNode extends AudioWorkletNode implements ILimiterAudioWorkletNode{
    get attack(){ 
        return this.parameters.get("attack") 
    }

    get release(){
        return this.parameters.get("release")
    }

    get threshold(){
        return this.parameters.get("threshold")
    }

    get preGain(){
        return this.parameters.get("preGain")
    }

    get postGain(){
        return this.parameters.get("postGain")
    }

    get bypass(){
        return this.parameters.get("bypass")
    }
}