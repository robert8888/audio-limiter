import DelayBuffer from "/base/src/DelayBuffer.js";


class BypassBufferProcessor extends AudioWorkletProcessor{
    constructor({
        outputChannelCount = [1],
        processorOptions
    }){
        super();
        const {bufferSize} = processorOptions;
        this.bufferSize = bufferSize;
        this.buffers = new Array(outputChannelCount).fill(1).map(() => new DelayBuffer(bufferSize));
    }

    process(inputs, outputs, parameters){

        const input = inputs[0];
        const output = outputs[0];    

        for (let channel = 0; channel < output.length; channel++) {
            if(!this.bufferSize){
                for(let i = 0; i < input[channel].length; i++){
                    output[channel][i] = input[channel][i]
                }
                continue;
            } 
            
            for(let i = 0; i < input[channel].length; i++){
                this.buffers[channel].write(input[channel][i])
                output[channel][i] = this.buffers[channel].read();
            }
        }
    
        return true;
    }
}

registerProcessor('bypass-processor', BypassBufferProcessor);