export default function connectInChain(nodes: AudioNode[]){
    nodes.reduce((previousNode: AudioNode, currentNode: AudioNode) => {
        previousNode.connect(currentNode);
        return currentNode;
    })
}

