export function validateLimiterNodeOptions(options) {
    if (!options)
        return;
    if (options.channelCount &&
        options.outputChannelCount?.length &&
        options.channelCount !== options.outputChannelCount[0]) {
        throw new Error('The channelCount must be the same as the outputChannelCount of the first output.');
    }
    if (options.channelCountMode && options.channelCountMode !== "explicit") {
        throw new Error('Limiter audio node expects channelCountMode "explicit".');
    }
    if (options.numberOfInputs && options.numberOfInputs !== 1) {
        throw new Error('Limiter audio node expect numberOfInputs equal 1.');
    }
    if (options.numberOfOutputs && options.numberOfOutputs !== 1) {
        throw new Error('Limiter audio node expect numberOfOutputs equal 1.');
    }
    if (options.time && (options.time < 0 || options.time > 10)) {
        throw new Error("Time parameter in limiter audio node have to be in range 0 - 10");
    }
}
export function normalizeLimiterNodeOptions(options) {
    const time = options?.time || 0.005;
    delete options?.time;
    const channelCount = options?.channelCount || 2;
    const outputChannelCount = [channelCount];
    return { ...options,
        channelCountMode: "explicit",
        channelCount,
        outputChannelCount,
        processorOptions: {
            ...options?.processorOptions,
            time,
        }
    };
}
