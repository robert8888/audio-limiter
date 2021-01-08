export default function createOscillator(context: BaseAudioContext, frequency: number, type = "sine"){
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    return oscillator;
}