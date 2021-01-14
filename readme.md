## Audio Limiter Node 
***
This library extending built in browser AudioContext and OfflineAudioContext 
by createLimiter() function. 

## Installation 
```
npm install audio-limiter
```

## Usage 
**By calling createLimiter on AudioContext / OffLineAudioContext**
```javascript
import "audio-limiter" 
// call this import in any file on your project 
// recommendation - do it in main file
// this file will patch AudioContext prototype

crateAudio = async () => {
    const context = new AudioContext();
    const buffer = await fetch("./your-audio.mp3")
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => context.decodeAudioData(arrayBuffer); 
    
    const source = context.createBufferSource();
    source.buffer = buffer;

    // and now most important 
    const limiter = await context.createLimiter();
    // connect
    source.connect(limiter)
    limiter.connect(context.destination);
    
    source.start(0);
} 
```
**By creating new instance of LimiterNode**

Whats allows connecting node in sync code
```javascript
import LimiterNode from "audio-limiter"

const context = new AudioContext();
const limiter = new LimiterNode(context, {time: 0.005});
const oscillator = new OscillatorNode(context)
const gain = new GainNode(context);

gain.gain.value = 10; // should be strongly overdrive
oscillator.start(0);

oscillator.connect(gain)
gain.connect(limiter);
limiter.connect(context.destination);


limiter.attack.setValueAtTime(0.1, 10)// set value 100ms in 10 second
limiter.bypass.setValueAtTime(1, 20)// any not zero value active bypass

```

**Creating LimiterNode always is asynchronous under the hood.**
If you need to be shure that everything inside LimiterNode is configured then you can wait for it by calling isReady. This will return Promise witch will be resolved when limiter worklet will be connected. before that LimiterNode is bypassed. But you don't have to wait to make you connections with other AudioNodes. 
```javascript
const context = new AudioContext();
const limiter = new LimiterNode(context)
await limiter.isReady;
// now signal is processed
```

## Configuration

**Time** - [in seconds] - Latency time witch limiter will delay output. Any non zero attack/release time will lag envelope behind current processed audio. To attenuate right part of signal this limiter implements delay buffer. This value should be minium equal to attack time. If value of time will be less that attack then limiter will act on the past envelope change. By default value is 5ms. This means that audio is delayed by 5 ms and in this range is analyzed envelope. 
```javascript
const context = new OfflineAudioContext(OfflineAudioContextOptions)
//time - min: 0, max: 10s
const limiter = await context.createLimiter({time: 0.005})
```
**Number of channels** - default value is 2. you can change it by define it. 
```javascript
const context = new OfflineAudioContext(OfflineAudioContextOptions)
const limiter = await context.createLimiter({
        channelCount: 1, 
        time: 0.005 // 5ms
    })
```
Predefined configs that you **can't change**
```javascript
const limiter = await context.createLimiter({
        channelCountMode: "explicit" 
        numberOfInputs: 1,
        numberOfOutputs: 1
    })
```

## Parameters
**Attack** - [in seconds] defining how quickly the detection responds to rising amplitudes. 
```javascript
const limiter = await context.createLimiter();
//by access params map

const attack = limiter.parameters.get("attack");

attack.value = .001// 1ms - by default 0
attack.setValueAtTime(0.001, context.currentTime);

//or by shortcut getter 
limiter.attack.setValueAtTime(.001, context.currentTime)
limiter.attack.minValue // 0
limiter.attack.maxValue // 2s
limiter.attack.defaultValue // 0
```

**Release** - [in seconds] - defining how quickly the detection responds to falling amplitudes. 
```javascript
limiter.parameters.get("release").setValueAtTime(.001, context.currentTime)
//or
limiter.release.setValueAtTime(.001, context.currentTime)
limiter.release.minValue // 0
limiter.release.maxValue // 2
limiter.release.defaultValue // 0.1 - 100 ms
```

**Threshold** - [in dB] - level to witch will be limiting audio. Be default is -2dB this means that max amplitude value will be ~0.79... Set it to 0 if you expect sample value +- 1.  
```javascript
limiter.threshold.setValueAtTime(2, 0);
limiter.threshold.minValue // -100
limiter.threshold.maxValue // 0
limiter.threshold.defaultValue // -2dB
```


**Pre Gain** - [in dB] - just like apply gain before limiter node. can be useful in kind of normalization process. 
```javascript
limiter.preGain.setValueAtTime(2, 0);
limiter.preGain.minValue // -100
limiter.preGain.maxValue // 100
limiter.preGain.defaultValue // 0 dB
```

**Post Gain** - [in dB] - post limiting gain. Be careful if you expect not clipping data. If you set threshold -2dB then max post gain can be set to +2dB.   
```javascript
limiter.postGain.setValueAtTime(2, 0);
limiter.postGain.minValue // -100
limiter.postGain.maxValue // 100
limiter.postGain.defaultValue // 0 dB
```
**Bypass** - [boolean number] - Every value other than 0 is tracked as truth. If you pass truthy value to bypass param then signal will not be limited. But, delay buffer will still by the same. 
```javascript
limiter.bypass.setValueAtTime(1, 0);
limiter.bypass.minValue // 0
limiter.bypass.maxValue // 1
limiter.bypass.defaultValue // 0
```

***

### **What if I don't want modify AudioContext prototype ??**

No problem. Don't import main library file. Just register limiter worklet processor and add module. You fill find it in library dist folder.

```javascript
const context = new AudioContext();
const path = [
    "node_models",
    "limiter-audio-node",
    "dist",
    "limiter-audio-worklet-processor.js"
].join("/");

await context.audioWorklet.addMode(path);
const limiter = new LimiterAudioWorkletNode(context, 'limiter-processor', options);
```
***

### **Stack**

Built with: 
* TypeScript
* Webpack 5

Test:
* Karma
* Jasmine

***
### [MIT](https://github.com/angular/angular.js/blob/master/LICENSE)