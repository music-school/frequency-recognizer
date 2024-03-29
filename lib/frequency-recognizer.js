import { getAudioContext, initGetUserMedia } from './utils';

class FrequencyRecognizerNode {
  constructor (audioContext, recognizer, recognizerListener) {
    this.audioContext = audioContext || getAudioContext();
    this.recognizer = recognizer;
    this.recognizerListener = recognizerListener;
    this.stream = null;
    this.frequency = null;
    this.pitchDetector = null;
    this.mediaStreamSource = null;
    this.scriptProcessor = null;
  }

  audioProcessCallback = e => {
    const frequency = this.pitchDetector.do(e.inputBuffer.getChannelData(0));

    this.recognizerListener({
      frequency
    });

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
    this.recognizer = null;

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

  function createInstance(...args) {
    const object = new FrequencyRecognizerNode(...args);
    return object;
  }

  return {
    getInstance: (...args) => {
      if (!instance) {
        instance = createInstance(...args);
      }
      return instance;
    }
  };
})();

export default FrequencyRecognizerNodeWrapper;