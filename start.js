require('dotenv').config({ override: true });
const { spawn } = require('child_process');
const path = require('path');

const SERVER_PORT = process.env.SERVER_PORT || process.env.PORT || 3001;
process.env.SERVER_PORT = String(SERVER_PORT);

// When running both server.js and bot.js together, give the bot its own HTTP
// port so it doesn't collide with server.js. Defaults to SERVER_PORT + 1.
if (!process.env.BOT_HTTP_PORT) {
  process.env.BOT_HTTP_PORT = String(parseInt(SERVER_PORT) + 1);
}

function spawnProcess(script, label, extraEnv = {}) {
  const child = spawn(process.execPath, [path.join(__dirname, script)], {
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv }
  });
  child.on('error', e => console.error(`[${label}] Erro ao iniciar: ${e.message}`));
  child.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`[${label}] Encerrado com código ${code} — reiniciando em 5s`);
      setTimeout(() => spawnProcess(script, label, extraEnv), 5000);
    }
  });
  return child;
}

console.log(`[START] FinanceEdge iniciando | porta=${SERVER_PORT} | bot-http=${process.env.BOT_HTTP_PORT}`);
spawnProcess('server.js', 'SERVER');

// Bot inicia 3s depois do server
setTimeout(() => {
  spawnProcess('bot.js', 'BOT');
}, 3000);
