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
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();

    const source = audioContext.createMediaElementSource(backgroundAudio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;

    dataArray = new Uint8Array(analyser.frequencyBinCount);
    console.log("✅ Audio analyzer setup successful");
  } catch (error) {
    console.error("❌ Audio analyzer error:", error);
  }
}

function animateSpectrum() {
  if (!analyser || !isPlaying) return;

  try {
    analyser.getByteFrequencyData(dataArray);

    const totalBars = spectrumBars.length;
    const halfBars = totalBars / 2;
    const binSize = Math.floor(dataArray.length / halfBars);

    for (let i = 0; i < halfBars; i++) {
      let leftSum = 0;
      const samples = 3;
      for (let j = 0; j < samples; j++) {
        const sampleIndex = Math.min(i * binSize + j, dataArray.length - 1);
        leftSum += dataArray[sampleIndex];
      }
      const leftValue = leftSum / samples;

      const targetHeight = 5 + (leftValue / 255) * 115;

      const leftBarIndex = i;
      const leftCurrentHeight =
        parseFloat(spectrumBars[leftBarIndex].style.height) || 5;
      const leftNewHeight =
        leftCurrentHeight + (targetHeight - leftCurrentHeight) * 0.4;
      spectrumBars[leftBarIndex].style.height = `${leftNewHeight}px`;

      const rightBarIndex = totalBars - 1 - i;
      const rightCurrentHeight =
        parseFloat(spectrumBars[rightBarIndex].style.height) || 5;
      const rightNewHeight =
        rightCurrentHeight + (targetHeight - rightCurrentHeight) * 0.4;
      spectrumBars[rightBarIndex].style.height = `${rightNewHeight}px`;

      if (leftValue > 25) {
        spectrumBars[leftBarIndex].classList.add("active");
        spectrumBars[rightBarIndex].classList.add("active");
      } else {
        spectrumBars[leftBarIndex].classList.remove("active");
        spectrumBars[rightBarIndex].classList.remove("active");
      }

      const opacity = 0.7 + (leftValue / 255) * 0.3;
      spectrumBars[leftBarIndex].style.opacity = opacity;
      spectrumBars[rightBarIndex].style.opacity = opacity;
    }
  } catch (error) {
    console.error("❌ Animation error:", error);
  }

  if (isPlaying) {
    requestAnimationFrame(animateSpectrum);
  }
}

function startAudio() {
  console.log("🎵 Attempting to start audio...");

  if (backgroundAudio.readyState < 2) {
    console.log("⏳ Audio not ready, waiting...");
    setTimeout(startAudio, 500);
    return;
  }

  backgroundAudio
    .play()
    .then(() => {
      console.log("✅ Audio started successfully");
      isPlaying = true;
      setupAudioAnalyzer();
      createSpectrumBars();
      animateSpectrum();
    })
    .catch((error) => {
      console.log("❌ Audio play failed:", error);
      console.log("👉 Click anywhere to start audio");
    });
}

function handleUserClick() {
  if (!isPlaying) {
    console.log("🖱️ User clicked, starting audio...");
    startAudio();
  }
}

document.addEventListener("click", handleUserClick);

document.addEventListener("visibilitychange", function () {
  if (!document.hidden && isPlaying && backgroundAudio.paused) {
    console.log("🔁 Tab active, resuming audio...");
    backgroundAudio.play().catch(console.error);
  }
});

window.addEventListener("load", function () {
  console.log("🚀 Page loaded");

  createSpectrumBars();

  setTimeout(() => {
    startAudio();
  }, 1000);
});

backgroundAudio.addEventListener("canplay", function () {
  console.log("🔊 Audio can play");
});

backgroundAudio.addEventListener("error", function (e) {
  console.error("❌ Audio error:", e);
  console.log("💡 Check:");
  console.log("1. Audio file exists at URL");
  console.log("2. File is accessible");
  console.log("3. File format is supported");
});

backgroundVideo.addEventListener("loadeddata", function () {
  console.log("🎥 Video loaded");
});
