const parameters: Array<AudioParamDescriptor> = [
    <AudioParamDescriptor>{
        name: "attack", // time in s
        minValue: 0,
        maxValue: 2,
        defaultValue: 0,
    }, 
    <AudioParamDescriptor>{
        name: "release", // time in s 
        minValue: 0,
        maxValue: 2,
        defaultValue: 0.1,
    },
    <AudioParamDescriptor>{
        name: "threshold", // in dB
        minValue: -100,
        maxValue: 0,
        defaultValue: -2,
    },
    <AudioParamDescriptor>{
        name: "preGain", // in dB
        minValue: -100,
        maxValue: 100,
        defaultValue: 0,
    },
    <AudioParamDescriptor>{
        name: "postGain", // in dB
        minValue: -100,
        maxValue: 100,
        defaultValue: 0,
    },
    <AudioParamDescriptor>{
        name: "bypass", // boolean
        minValue: 0,
        maxValue: 1,
        defaultValue: 0,
    }
]

    export default parameters;