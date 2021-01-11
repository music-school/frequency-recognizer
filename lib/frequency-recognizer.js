import { getAudioContext, initGetUserMedia } from './utils';

class FrequencyRecognizerNode {
  constructor (audioContext, recognizer) {
    this.audioContext = audioContext || getAudioContext();
    this.recognizer = recognizer;
    this.stream = null;
    this.frequency = null;
    this.pitchDetector = null;
    this.mediaStreamSource = null;
    this.scriptProcessor = null;
  }

  audioProcessCallback = e => {
    const frequency = this.pitchDetector.do(e.inputBuffer.getChannelData(0));

    console.log(frequency);

    if (frequency) {
      this.frequency = frequency.toFixed(1);
    }
  };

  startRecognize = () => {
     this.recognizer().then(async aubio => {
      this.pitchDetector = new aubio.Pitch(
        "default",
        2048,
        1,
        this.audioContext.sampleRate
      );

      await navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        this.stream = stream;
        this.scriptProcessor = this.audioContext.createScriptProcessor(2048, 1, 1);
        this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);

        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 2048;
        this.mediaStreamSource.connect(analyser);
        analyser.connect(this.scriptProcessor);

        this.scriptProcessor.connect(this.audioContext.destination);
        this.scriptProcessor.onaudioprocess = this.audioProcessCallback;
      });
    });
  }

  init = () => {
    initGetUserMedia();

    this.startRecognize();
  }

  destroy = () => {
    this.frequency = null;
    this.pitchDetector = null;

    if (this.scriptProcessor) {
      this.scriptProcessor.onaudioprocess = null;
      this.scriptProcessor = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    if (
      this.mediaStreamSource &&
      this.mediaStreamSource.mediaStream &&
      this.mediaStreamSource.mediaStream.stop
    ) {
      this.mediaStreamSource.mediaStream.stop();
    }
  }
}

const FrequencyRecognizerNodeWrapper = (() => {
  let instance;

  function createInstance(audioContext, recognizer) {
    const object = new FrequencyRecognizerNode(audioContext, recognizer);
    return object;
  }

  return {
    getInstance: (audioContext, recognizer) => {
      if (!instance) {
        instance = createInstance(audioContext, recognizer);
      }
      return instance;
    }
  };
})();

export default FrequencyRecognizerNodeWrapper;