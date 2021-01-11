const getAudioContext = () => {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!window.AudioContext) {
    throw new Error("Web Audio API is not supported in this browser");
  }

  return new window.AudioContext();
};

const initGetUserMedia = () => {
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      const getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        throw new Error("getUserMedia is not implemented in this browser");
      }

      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }
};

exports.default = { getAudioContext, initGetUserMedia };