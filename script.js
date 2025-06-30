const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
const jsonOutput = document.getElementById('json-output');

// MediaPipe Hands setup
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(onResults);

// Kamera ishga tushirish
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480
});
camera.start();

// Natijani qayta ishlash
function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];

    // Chizma (qiziqarli emas, faqat ko‘rsatish uchun)
    for (const point of landmarks) {
      canvasCtx.beginPath();
      canvasCtx.arc(point.x * canvasElement.width, point.y * canvasElement.height, 5, 0, 2 * Math.PI);
      canvasCtx.fillStyle = "#00FF00";
      canvasCtx.fill();
    }

    // JSON shaklida chiqaramiz (faqat 21 nuqta)
    const output = {
      hand: "right",
      landmarks: landmarks.map((p, i) => ({
        point: i,
        x: p.x.toFixed(3),
        y: p.y.toFixed(3),
        z: p.z.toFixed(3)
      }))
    };

    jsonOutput.textContent = JSON.stringify(output, null, 2);
  } else {
    jsonOutput.textContent = "Qo‘l aniqlanmadi...";
  }

  canvasCtx.restore();
}
