const parameters = [
    {
        name: "attack",
        minValue: 0,
        maxValue: 2,
        defaultValue: 0,
    },
    {
        name: "release",
        minValue: 0,
        maxValue: 2,
        defaultValue: 0.2,
    },
    {
        name: "threshold",
        minValue: -100,
        maxValue: 0,
        defaultValue: -2,
    },
    {
        name: "preGain",
        minValue: -100,
        maxValue: 100,
        defaultValue: 0,
    },
    {
        name: "postGain",
        minValue: -100,
        maxValue: 100,
        defaultValue: 0,
    }
];
export default parameters;
