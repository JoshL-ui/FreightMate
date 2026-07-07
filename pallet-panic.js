(() => {
  let typed = "";
  const secretCode = "FORKLIFT";

  document.addEventListener("keydown", (e) => {
    typed += e.key.toUpperCase();
    typed = typed.slice(-secretCode.length);

    if (typed === secretCode) {
      openPalletPanic();
      typed = "";
    }
  });

  function openPalletPanic() {
    if (document.getElementById("pallet-panic-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "pallet-panic-overlay";
    overlay.innerHTML = `
      <div class="pp-modal">
        <button class="pp-close">×</button>
        <h2>🚜 Pallet Panic 📦</h2>
        <p>Move with ← → or A/D. Catch the pallets. Miss 3 and you're cooked.</p>
        <canvas id="pp-canvas" width="360" height="500"></canvas>
        <button id="pp-start">Start Game</button>
      </div>
    `;

    document.body.appendChild(overlay);

    const style = document.createElement("style");
    style.innerHTML = `
      #pallet-panic-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        color: white;
        font-family: Arial, sans-serif;
      }

      .pp-modal {
        background: #111827;
        border: 2px solid #38bdf8;
        border-radius: 16px;
        padding: 20px;
        width: 420px;
        max-width: 95vw;
        text-align: center;
        box-shadow: 0 0 30px rgba(56,189,248,0.5);
        position: relative;
      }

      .pp-close {
        position: absolute;
        top: 10px;
        right: 14px;
        background: none;
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
      }

      #pp-canvas {
        background: #1f2937;
        border: 2px solid #374151;
        border-radius: 10px;
        display: block;
        margin: 15px auto;
        max-width: 100%;
      }

      #pp-start {
        background: #38bdf8;
        border: none;
        padding: 10px 18px;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);

    document.querySelector(".pp-close").onclick = () => overlay.remove();

    const canvas = document.getElementById("pp-canvas");
    const ctx = canvas.getContext("2d");
    const startBtn = document.getElementById("pp-start");

    let forklift;
    let pallets;
    let score;
    let misses;
    let speed;
    let gameRunning;
    let keys = {};

    function resetGame() {
      forklift = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 55,
        width: 50,
        height: 35,
        speed: 6
      };

      pallets = [];
      score = 0;
      misses = 0;
      speed = 2;
      gameRunning = true;
    }

    function spawnPallet() {
      pallets.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30
      });
    }

    function drawForklift() {
      ctx.font = "34px Arial";
      ctx.fillText("🚜", forklift.x, forklift.y + 32);
    }

    function drawPallet(pallet) {
      ctx.font = "28px Arial";
      ctx.fillText("📦", pallet.x, pallet.y + 26);
    }

    function drawText() {
      ctx.fillStyle = "white";
      ctx.font = "18px Arial";
      ctx.fillText(`Score: ${score}`, 12, 25);
      ctx.fillText(`Misses: ${misses}/3`, 250, 25);
    }

    function update() {
      if (!gameRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (keys["ArrowLeft"] || keys["a"]) forklift.x -= forklift.speed;
      if (keys["ArrowRight"] || keys["d"]) forklift.x += forklift.speed;

      forklift.x = Math.max(0, Math.min(canvas.width - forklift.width, forklift.x));

      pallets.forEach((pallet, index) => {
        pallet.y += speed;

        const caught =
          pallet.x < forklift.x + forklift.width &&
          pallet.x + pallet.width > forklift.x &&
          pallet.y < forklift.y + forklift.height &&
          pallet.y + pallet.height > forklift.y;

        if (caught) {
          pallets.splice(index, 1);
          score++;
          if (score % 10 === 0) speed += 0.5;
        }

        if (pallet.y > canvas.height) {
          pallets.splice(index, 1);
          misses++;
        }
      });

      drawForklift();
      pallets.forEach(drawPallet);
      drawText();

      if (misses >= 3) {
        gameRunning = false;
        ctx.fillStyle = "white";
        ctx.font = "32px Arial";
        ctx.fillText("GAME OVER", 90, 230);
        ctx.font = "20px Arial";
        ctx.fillText(`Final Score: ${score}`, 115, 265);
        startBtn.textContent = "Play Again";
        return;
      }

      requestAnimationFrame(update);
    }

    let spawnInterval;

    startBtn.onclick = () => {
      resetGame();
      clearInterval(spawnInterval);
      spawnInterval = setInterval(spawnPallet, 900);
      startBtn.textContent = "Game Running...";
      update();
    };

    document.addEventListener("keydown", (e) => {
      keys[e.key] = true;
    });

    document.addEventListener("keyup", (e) => {
      keys[e.key] = false;
    });
  }
})();
