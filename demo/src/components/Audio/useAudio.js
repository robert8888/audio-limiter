import {useCallback, useContext} from "preact/compat";
import BusAudioContext from "./AudioContext";

export default function useAudio(){
    const data = useContext(BusAudioContext)

    const buildAudioChain = async (context) => {
        const _limiter = await context.createLimiter();
        const gain = context.createGain();

        data.limiter = _limiter;

        data.source.connect(gain)
        gain.connect(_limiter)
        _limiter.connect(context.destination);

        gain.gain.value = 5;
    }

    const connectSource = (mediaElement) =>{
        data.context = data.context || new AudioContext();

        data.source = data.context.createMediaElementSource(mediaElement)
        buildAudioChain(data.context);
    }

    const setLimiterParam = useCallback((name, value) => {
        if(!data.limiter)
            return;
        data.limiter.parameters.get(name).setValueAtTime(value, data.context.currentTime)
    }, [data])

    return [{
        connectSource,
        setLimiterParam,
    }]
}