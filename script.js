const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('.tab-button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-selected', 'false');
    });

    button.classList.add('is-active');
    button.setAttribute('aria-selected', 'true');
  });
});

const canvas = document.querySelector('#gameCanvas');
const statusLabel = document.querySelector('#game-status');
const countdownLabel = document.querySelector('#game-countdown');
const scoreLabel = document.querySelector('#game-score');

if (canvas && canvas.getContext) {
  const ctx = canvas.getContext('2d');
  const state = {
    w: canvas.width,
    h: canvas.height,
    enemy: null,
    explosion: null,
    score: 0,
    lastTime: performance.now(),
    nextExplosionAt: performance.now() + 5000,
  };

  const randomBetween = (min, max) => Math.random() * (max - min) + min;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const spawnEnemy = () => {
    const speed = randomBetween(1.6, 3.4);
    const angle = randomBetween(0, Math.PI * 2);
    const radius = randomBetween(18, 26);

    state.enemy = {
      x: randomBetween(radius + 20, state.w - radius - 20),
      y: randomBetween(radius + 20, state.h - radius - 20),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius,
      pulse: 0,
      hue: randomBetween(335, 360),
    };

    state.explosion = null;
    state.nextExplosionAt = performance.now() + 5000;

    if (statusLabel) {
      statusLabel.textContent = '이동 중';
    }
  };

  const triggerExplosion = (time) => {
    if (!state.enemy) {
      return;
    }

    state.score += 1;
    state.explosion = {
      x: state.enemy.x,
      y: state.enemy.y,
      start: time,
      duration: 700,
      maxRadius: 140,
    };
    state.enemy = null;
    state.nextExplosionAt = time + 5000;

    if (statusLabel) {
      statusLabel.textContent = '폭발';
    }

    if (scoreLabel) {
      scoreLabel.textContent = String(state.score);
    }

    window.setTimeout(() => {
      spawnEnemy();
    }, 900);
  };

  const drawBackground = () => {
    ctx.clearRect(0, 0, state.w, state.h);

    const gradient = ctx.createLinearGradient(0, 0, 0, state.h);
    gradient.addColorStop(0, '#161824');
    gradient.addColorStop(1, '#0e1016');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.w, state.h);

    ctx.save();
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < 8; i += 1) {
      const x = (i / 8) * state.w;
      ctx.fillStyle = i % 2 === 0 ? '#ff4d7d' : '#6ea8ff';
      ctx.fillRect(x, 0, 2, state.h);
    }
    ctx.restore();
  };

  const drawEnemy = (enemy) => {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, enemy.radius * 3);
    glow.addColorStop(0, `hsla(${enemy.hue}, 95%, 70%, 0.45)`);
    glow.addColorStop(1, 'rgba(255, 77, 125, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius * 3, 0, Math.PI * 2);
    ctx.fill();

    const body = ctx.createRadialGradient(-enemy.radius * 0.35, -enemy.radius * 0.35, enemy.radius * 0.2, 0, 0, enemy.radius);
    body.addColorStop(0, '#ffe3ea');
    body.addColorStop(0.45, '#ff5e8d');
    body.addColorStop(1, '#b21d55');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.beginPath();
    ctx.arc(-enemy.radius * 0.28, -enemy.radius * 0.3, Math.max(2, enemy.radius * 0.18), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawExplosion = (time) => {
    if (!state.explosion) {
      return;
    }

    const elapsed = time - state.explosion.start;
    const progress = clamp(elapsed / state.explosion.duration, 0, 1);
    const radius = progress * state.explosion.maxRadius;
    const alpha = 1 - progress;

    ctx.save();
    ctx.translate(state.explosion.x, state.explosion.y);

    const ring = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
    ring.addColorStop(0, `rgba(255, 246, 180, ${0.8 * alpha})`);
    ring.addColorStop(0.5, `rgba(255, 141, 97, ${0.36 * alpha})`);
    ring.addColorStop(1, 'rgba(255, 77, 125, 0)');

    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * alpha})`;
    ctx.lineWidth = 2 + (1 - alpha) * 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.66, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  };

  const update = (time, delta) => {
    if (state.enemy) {
      state.enemy.pulse += delta * 0.006;

      const turnChance = Math.min(0.06, delta * 0.0012);
      if (Math.random() < turnChance) {
        const speed = randomBetween(1.8, 3.6);
        const angle = randomBetween(0, Math.PI * 2);
        state.enemy.vx += Math.cos(angle) * speed * 0.35;
        state.enemy.vy += Math.sin(angle) * speed * 0.35;
      }

      const drift = 0.024;
      state.enemy.vx += Math.sin(time * 0.003 + state.enemy.pulse) * drift;
      state.enemy.vy += Math.cos(time * 0.0026 + state.enemy.pulse) * drift;

      const speedLimit = 3.8;
      state.enemy.vx = clamp(state.enemy.vx, -speedLimit, speedLimit);
      state.enemy.vy = clamp(state.enemy.vy, -speedLimit, speedLimit);

      state.enemy.x += state.enemy.vx;
      state.enemy.y += state.enemy.vy;

      const bounce = 0.92;
      if (state.enemy.x <= state.enemy.radius + 12) {
        state.enemy.x = state.enemy.radius + 12;
        state.enemy.vx = Math.abs(state.enemy.vx) * bounce;
      }
      if (state.enemy.x >= state.w - state.enemy.radius - 12) {
        state.enemy.x = state.w - state.enemy.radius - 12;
        state.enemy.vx = -Math.abs(state.enemy.vx) * bounce;
      }
      if (state.enemy.y <= state.enemy.radius + 12) {
        state.enemy.y = state.enemy.radius + 12;
        state.enemy.vy = Math.abs(state.enemy.vy) * bounce;
      }
      if (state.enemy.y >= state.h - state.enemy.radius - 12) {
        state.enemy.y = state.h - state.enemy.radius - 12;
        state.enemy.vy = -Math.abs(state.enemy.vy) * bounce;
      }
    }

    if (time >= state.nextExplosionAt && !state.explosion) {
      triggerExplosion(time);
    }

    if (countdownLabel) {
      const remaining = Math.max(0, state.nextExplosionAt - time);
      countdownLabel.textContent = `${(remaining / 1000).toFixed(1)}s`;
    }
  };

  const render = (time) => {
    const delta = time - state.lastTime;
    state.lastTime = time;

    update(time, delta);
    drawBackground();

    if (state.enemy) {
      drawEnemy(state.enemy);
    }

    drawExplosion(time);

    requestAnimationFrame(render);
  };

  spawnEnemy();
  if (scoreLabel) {
    scoreLabel.textContent = '0';
  }

  requestAnimationFrame(render);
}
