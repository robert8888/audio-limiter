import {createContext} from "preact";

const data = {
    context: null,
    source: null,
    limiter: null
}

const AudioContext = createContext(data)

export default AudioContext;

export function AudioContextProvider({children}){
    return (
        <AudioContext.Provider value={data}>
            {children}
        </AudioContext.Provider>
    )
}