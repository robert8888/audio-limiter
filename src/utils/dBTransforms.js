export const ampToDB = value => {
    return 20 * Math.log10(value);
};
export const dBToAmp = db => {
    return Math.pow(10, db / 20);
};
