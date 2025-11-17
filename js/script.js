const backgroundVideo = document.getElementById("backgroundVideo");
const backgroundAudio = document.getElementById("backgroundAudio");
const spectrumContainer = document.getElementById("spectrumContainer");

let audioContext, analyser, dataArray;
let spectrumBars = [];
let isPlaying = false;

function createSpectrumBars() {
  spectrumContainer.innerHTML = "";
  spectrumBars = [];

  const barCount = 30;
  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement("div");
    bar.className = "spectrum-bar";
    bar.style.height = "5px";
    spectrumContainer.appendChild(bar);
    spectrumBars.push(bar);
  }
}

function setupAudioAnalyzer() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();

  const source = audioContext.createMediaElementSource(backgroundAudio);
  source.connect(analyser);
  analyser.connect(audioContext.destination);

  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;

  dataArray = new Uint8Array(analyser.frequencyBinCount);
}

function animateSpectrum() {
  if (!isPlaying) return;

  analyser.getByteFrequencyData(dataArray);

  const totalBars = spectrumBars.length;
  const halfBars = totalBars / 2;
  const binSize = Math.floor(dataArray.length / halfBars);

  for (let i = 0; i < halfBars; i++) {
    let sum = dataArray[i * binSize];
    const height = 5 + (sum / 255) * 120;

    const left = i;
    const right = totalBars - 1 - i;

    spectrumBars[left].style.height = `${height}px`;
    spectrumBars[right].style.height = `${height}px`;
  }

  requestAnimationFrame(animateSpectrum);
}

function startAll() {
  if (isPlaying) return;

  backgroundAudio
    .play()
    .then(() => {
      isPlaying = true;
      setupAudioAnalyzer();
      createSpectrumBars();
      animateSpectrum();
    })
    .catch(() => {
      console.log("Click to start audio");
    });

  backgroundVideo.play().catch(() => {});
}

document.addEventListener("click", startAll);

window.addEventListener("load", () => {
  createSpectrumBars();
  startAll();
});
