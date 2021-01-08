export default function compareAudioBuffers(reference, buffer, latency){
    let areTheSame = true;
    for(let channel = 0; channel < reference.numberOfChannels; channel++){
        const referenceChannelData = reference.getChannelData(channel);
        const channelData = buffer.getChannelData(channel);
        for(let i = 0; i < channelData.length - latency; i++){
        // expect(referenceChannelData[i]).toBe(channelData[i + latency ])
        if(referenceChannelData[i] !== channelData[i + latency]){
            return areTheSame = false;
            break;
        }
        }
    }

    return areTheSame;
}


  
  