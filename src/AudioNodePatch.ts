export interface IConnectable {
    __connectFrom(source: AudioNode)
    __disconnectFrom(source: AudioNode)
}

const AudioNode$connect = AudioNode.prototype.connect; 
AudioNode.prototype.connect = connect;
function connect(this: AudioNode, destinationNode: AudioNode, output?: number, input?: number): AudioNode;
function connect(this: AudioNode, destinationParam: AudioParam, output?: number): void;
function connect(this: AudioNode, destination: any, output: any, input?: number){
    const args = <any>[].slice.call(arguments);

    if (args.length && typeof (<IConnectable>args[0]).__connectFrom === "function") {
        (<IConnectable>args[0]).__connectFrom.apply(args[0], <any>[ this ].concat(args.slice(1)));
      } else {
        AudioNode$connect.apply(this, args);
      }

    if(destination === AudioNode)
        return destination;
}

const AudioNode$disconnect = AudioNode.prototype.disconnect;
AudioNode.prototype.disconnect = disconnect;

function disconnect(this: AudioNode): void;
function disconnect(this: AudioNode, output: number): void;
function disconnect(this: AudioNode, destinationNode: AudioNode): void;
function disconnect(this: AudioNode, destinationNode: AudioNode, output: number): void;
function disconnect(this: AudioNode, destinationNode: AudioNode, output: number, input: number): void;
function disconnect(this: AudioNode, destinationParam: AudioParam): void;
function disconnect(this: AudioNode, destinationParam: AudioParam, output: number): void;
function disconnect(this: AudioNode, destination?: any, output?: number, input?: number){
    var args = <any>[].slice.call(arguments);

    if (args.length && typeof (<IConnectable>args[0]).__disconnectFrom === "function") {
      (<IConnectable>args[0]).__disconnectFrom.apply(args[0], <any>[ this ].concat(args.slice(1)));
    } else {
      AudioNode$disconnect.apply(this, args);
    }
}