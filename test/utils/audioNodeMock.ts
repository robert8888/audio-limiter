import { Interface } from "readline";

let connect;
let disconnect;

declare global {
    interface AudioNode {
        outputs: AudioNode[]
    }
}

export const mockAudioNode = () => {
    AudioNode.prototype.connect = (function(){
        connect = AudioNode.prototype.connect;
        return function(){
         ( this.outputs || ( this.outputs = [] ) ).push(arguments[0]);
         return connect.apply(this, arguments);
        }
    }());

    AudioNode.prototype.disconnect = (function(){
        disconnect = AudioNode.prototype.disconnect;
        return function(){
         ( this.outputs || ( this.outputs = [] ) ).pop();
         return disconnect.apply(this, arguments);
        }
    }());
}


export const unMockAudioNode = () => {
    AudioNode.prototype.connect = connect;
    AudioNode.prototype.disconnect = disconnect;
}