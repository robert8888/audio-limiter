import createOscillator from "../utils/createOscillator";


describe("Testing buffer in bypass worklet node", ()=>{
    let audioContext: OfflineAudioContext;

    const offlineAudioContextOptions = <OfflineAudioContextOptions>{
        length: 1 * 44100, // one second
        numberOfChannels: 2,
        sampleRate: 44100,
    }
       
    beforeEach(async () => {
        audioContext = new OfflineAudioContext(offlineAudioContextOptions);
        await audioContext.audioWorklet.addModule( 'utils/DelayWorkletProcessor.js')
        .catch(error => console.error("Can't add audio worklet processor " + error.message))
    })

    it("Should context and worklet node be created", () => {
        expect(audioContext).toBeInstanceOf(OfflineAudioContext);

        const bypassEmptyBuffer = new AudioWorkletNode(audioContext, "bypass-processor", {
            processorOptions: {
                bufferSize: 0,
            }
        })

        expect(bypassEmptyBuffer).toBeInstanceOf(AudioWorkletNode);


        const bypassNode = new AudioWorkletNode(audioContext, "bypass-processor", {
            processorOptions: {
                bufferSize: 128,
            }
        })

        expect(bypassNode).toBeInstanceOf(AudioWorkletNode);
    })

    it("Should process audio with delay created by buffer size", async () => {
        let oscillator = createOscillator(audioContext, 440);
        
        oscillator.connect(audioContext.destination);
        oscillator.start(audioContext.currentTime + 0);//0
        oscillator.stop(audioContext.currentTime + 5);// end in 5 seconds
        const audioBuffer = await audioContext.startRendering();

        const bufferSizes = [0, 10, 110, 250, 500, 1000, 10_0000];
        for(let bufferIndex = 0 ; bufferIndex < bufferSizes.length; bufferIndex++){
            const bufferSize = bufferSizes[bufferIndex];
            audioContext = new OfflineAudioContext(offlineAudioContextOptions);
            await audioContext.audioWorklet.addModule( 'utils/DelayWorkletProcessor.js')
            const bypassNode = new AudioWorkletNode(audioContext, "bypass-processor", {
                processorOptions: { bufferSize }
            })
            
            oscillator = createOscillator(audioContext, 440);
            oscillator.connect(bypassNode)
            bypassNode.connect(audioContext.destination);
    
            oscillator.start(audioContext.currentTime + 0);//0
            oscillator.stop(audioContext.currentTime + 5);// end in 5 seconds
    
            const transformedBuffer = await audioContext.startRendering();
    
            for(let channel = 0; channel < audioBuffer.numberOfChannels; channel++){
                const channelData = audioBuffer.getChannelData(channel);
                const transformedChannelData = transformedBuffer.getChannelData(channel);
                for(let i = 0; i < audioBuffer.length - bufferSize; i++){
                    expect(channelData[i]).toBe(transformedChannelData[i + bufferSize]);
                }
            }
        }
    })

})