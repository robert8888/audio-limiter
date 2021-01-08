import connectInChain from "./connectNodesInChain";
    

export default async function* renderBufferAudio(
        offlineAudioContextOptions, 
        limiterParams, 
        nodeParams = {}
    ){
    const context = new OfflineAudioContext(offlineAudioContextOptions);
  
    const buffer = context.createBuffer(
        offlineAudioContextOptions.numberOfChannels, 
        offlineAudioContextOptions.length, 
        offlineAudioContextOptions.sampleRate
    );
  
    const limiter = <AudioWorkletNode>await context.createLimiter(nodeParams);
    for(let name in limiterParams){
      limiter.parameters.get(name).value = limiterParams[name];
    }
  
    const bufferSource = yield;
  
    buffer.copyToChannel(bufferSource, 0);
    buffer.copyToChannel(bufferSource, 1);
  
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.start()
  
  
    connectInChain([source, limiter, context.destination])
  
    yield limiter;
  
    const outputBuffer = await context.startRendering();
  
    return outputBuffer;
  }