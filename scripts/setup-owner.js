'use strict';

const readline = require('readline');
const chalk    = require('chalk');
const setting  = require('../Sebastool/setting');

const cleanNumber = (raw) => String(raw || '').replace(/[^0-9]/g, '');
const isValidNumber = (num) => num.length >= 8 && num.length <= 15;

const WIDTH = 46;

const line = (char = '─') => char.repeat(WIDTH);

const box = (title) => {
  const pad = Math.max(0, Math.floor((WIDTH - title.length) / 2));
  const centered = ' '.repeat(pad) + title + ' '.repeat(WIDTH - title.length - pad);
  console.log(chalk.hex('#6C5CE7')(`┌${line()}┐`));
  console.log(chalk.hex('#6C5CE7')('│') + chalk.bold.white(centered) + chalk.hex('#6C5CE7')('│'));
  console.log(chalk.hex('#6C5CE7')(`└${line()}┘`));
};

const label = (text) => chalk.hex('#A29BFE')(`  ${text}`);
const success = (text) => console.log(chalk.hex('#00D9A3')(`  ✔ ${text}`));
const warn = (text) => console.log(chalk.hex('#FFB020')(`  ! ${text}`));
const hint = (text) => console.log(chalk.gray(`    ${text}`));

const ask = (prompt) => new Promise((resolve) => {
  if (!process.stdin.isTTY) { resolve(null); return; }

  console.log(label(prompt));
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  rl.question(chalk.hex('#6C5CE7')('  ❯ '), (answer) => { rl.close(); resolve(answer.trim()); });
});

async function ensureOwnerSetup() {
  try {

    const envNumber = cleanNumber(process.env.OWNER_NUMBER);
    const existing  = setting.ownerNumber;
    const hasNumber = isValidNumber(envNumber) ||
      (Array.isArray(existing) && existing.some(n => isValidNumber(cleanNumber(n))));

    const envName  = process.env.OWNER_NAME;
    const hasName  = Boolean(envName || setting.ownerName);

    if (hasNumber && hasName) return;

    if (!process.stdin.isTTY) {
      warn('Sin terminal interactiva, se continúa sin pedir owner.');
      hint('Configuralo con OWNER_NUMBER / OWNER_NAME en el panel de hosting.');
      return;
    }

    console.log('');
    box('CONFIGURACIÓN DEL OWNER');
    console.log('');

    if (!hasName) {
      const name = await ask('Escribe El Nombre Del Owner');
      if (name) {
        setting.set('ownerName', name);
        success(`Nombre configurado: ${chalk.bold(name)}`);
      } else {
        warn('No ingresaste nombre, se continúa sin él.');
      }
      console.log('');
    }

    if (!hasNumber) {
      const answer = await ask('Número del Owner  (código de país, sin + ni espacios · ej: 56912345678)');
      const num = cleanNumber(answer);

      if (isValidNumber(num)) {
        setting.set('ownerNumber', [num]);
        success(`Owner configurado: ${chalk.bold(setting.ownerName || 'sin nombre')} · ${chalk.bold(num)}`);
      } else if (answer) {
        warn('Número inválido, se continúa sin owner configurado.');
        hint('Podés configurarlo luego con OWNER_NUMBER o el comando de owner.');
      } else {
        warn('Bot arrancando sin owner configurado.');
        hint('Configuralo con la variable de entorno OWNER_NUMBER en el panel de hosting.');
      }
      console.log('');
    }

    console.log(chalk.hex('#6C5CE7')(line()));
    console.log('');
  } catch (e) {
    console.error(chalk.red('  [setup-owner] Error inesperado, se continúa el arranque:'), e.message);
  }
}

module.exports = { ensureOwnerSetup };
