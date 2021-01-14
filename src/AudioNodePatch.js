const AudioNode$connect = AudioNode.prototype.connect;
AudioNode.prototype.connect = connect;
function connect(destination, output, input) {
    const args = [].slice.call(arguments);
    if (args.length && typeof args[0].__connectFrom === "function") {
        args[0].__connectFrom.apply(args[0], [this].concat(args.slice(1)));
    }
    else {
        AudioNode$connect.apply(this, args);
    }
    if (destination === AudioNode)
        return destination;
}
const AudioNode$disconnect = AudioNode.prototype.disconnect;
AudioNode.prototype.disconnect = disconnect;
function disconnect(destination, output, input) {
    var args = [].slice.call(arguments);
    if (args.length && typeof args[0].__disconnectFrom === "function") {
        args[0].__disconnectFrom.apply(args[0], [this].concat(args.slice(1)));
    }
    else {
        AudioNode$disconnect.apply(this, args);
    }
}
export {};
