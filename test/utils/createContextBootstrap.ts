import createOscillator from "./createOscillator";

export default function createContextBootstrap(offlineAudioContextOptions: OfflineAudioContextOptions, type = "sine", freq = 440){
    const context = new OfflineAudioContext(offlineAudioContextOptions);
    const oscillator = createOscillator(context, freq, type);
    const gain = context.createGain();
    return {oscillator, gain, context };
}

