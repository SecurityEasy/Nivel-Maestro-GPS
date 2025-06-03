let premios = [
  "2 VL103M \n+ 1 R83 \n+ 15 SIM Telcel",
  "1 LG300 \n+ 2 GT06E \n+ 10 SIM Telcel",
  "2 renovaciones\n de 10 años \n+ 10 SIM",
  "1 LG300 \n+ 1 R83 \n+ 10 SIM Telcel",
  "1 VL103M \n+ 2 GT06E \n+ 10 SIM Telcel"
];

premios = shuffleArray(premios); // ✅ primero baraja

const fixedPremio = "2 VL103M \n+ 1 R83 \n+ 15 SIM Telcel"";

const fixedIndex = premios.findIndex(p =>
  p.replace(/\n/g, " ").trim() === fixedPremio.replace(/\n/g, " ").trim()
);

const colors = ["#A9CFE7", "#8EC5C0", "#B6D8F2", "#A7D3C1", "#5D7692"];
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spin");
const resultado = document.getElementById("resultado");
const fuego = document.getElementById("fuego");

const token = new URLSearchParams(window.location.search).get("token");
let girado = false;

const endpoint = "https://script.google.com/macros/s/AKfycbzDrumE_4J8HzHjBZLu6yob5px6nA00h9QKOoK8zEvM2hgh76q7hEelxqTAEtc-ApTfrA/exec";

fetch(`${endpoint}?check=${token}`)
  .then(res => res.text())
  .then(res => {
    if (res === "YA_USADO") {
      girado = true;
      alert("Este token ya fue utilizado. No puedes girar la ruleta más de una vez.");
      spinButton.disabled = true;
    }
  });

let canvasSize = 500;

function resizeCanvas() {
  canvasSize = Math.min(window.innerWidth * 0.9, 500);
  canvas.width = canvasSize;
  canvas.height = canvasSize;
}

// 🔀 Mezcla visual
function shuffleArray(arr) {
  let array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 🎨 Dibujo con offset
function drawWheel(rotationOffset = 0) {
  const numPremios = premios.length;
  const arc = (2 * Math.PI) / numPremios;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = canvas.width / 2;

  for (let i = 0; i < numPremios; i++) {
    const angle = i * arc + (rotationOffset * Math.PI / 180);
    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, angle, angle + arc);
    ctx.fill();

    ctx.save();
    ctx.fillStyle = "#000";
    ctx.translate(cx, cy);
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = "right";
    ctx.font = `${canvasSize * 0.045}px Arial`;
    const lines = premios[i].split("\n");
    for (let j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j], radius - 10, (j - 0.5) * 20);
    }
    ctx.restore();
  }
}

resizeCanvas();
drawWheel();
window.addEventListener("resize", () => {
  resizeCanvas();
  drawWheel();
});

let angle = 0;
let isSpinning = false;

function findAngle() {
  if (fixedIndex === -1) {
    console.error("❌ Premio no encontrado");
    return [0, 0];
  }

  const sliceAngle = 360 / premios.length;
  const middleOfSlice = sliceAngle * fixedIndex + sliceAngle / 2;
  const rotation = 5 * 360 + 90 - middleOfSlice; // ✅ fuego visualmente está en 90°
  return [rotation, fixedIndex];
}

function spinWheel() {
  if (!token) return alert("No tienes un token válido.");
  if (girado) return alert("Ya has girado la ruleta.");

  isSpinning = true;
  const [rotation, fixedIndex] = findAngle();
  const duration = 5000;
  const start = performance.now();

  function animate(time) {
    let progress = (time - start) / duration;
    if (progress > 1) progress = 1;

    angle = rotation * progress;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWheel(angle); // 🌀 ahora dibuja la ruleta rotada correctamente

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      const premio = premios[fixedIndex];
      resultado.textContent = "🎉 ¡Felicidades! Ganaste: " + premio;
      fuego.style.visibility = "visible";

      const premioLimpio = premio.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
      fetch(`${endpoint}?token=${token}&premio=${encodeURIComponent(premioLimpio)}`)
        .then(res => res.text())
        .then(data => {
          girado = true;
          spinButton.disabled = true;
        });
    }
  }

  requestAnimationFrame(animate);
}

spinButton.addEventListener("click", () => {
  if (!isSpinning) spinWheel();
});
