#!/usr/bin/env node
// =============================================================================
// npm run setup — get Verdict ready to play.
//
// This exists because the two steps most likely to defeat someone setting the
// project up for the first time are invisible ones: having the wrong Node
// version (npm install half-works and the error arrives much later), and
// creating a file whose name starts with a dot — Finder hides it, Windows
// Notepad silently appends ".txt", and the app then reports no API key while
// a file that looks correct sits right there.
//
// So: check the version properly, write the file correctly, and never clobber
// anything already in it.
// =============================================================================

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = path.join(ROOT, ".env.local");
const KEY = "ANTHROPIC_API_KEY";

// Next 14.2 needs Node 18.17 or newer.
const MIN = [18, 17];

const bold = (s) => `[1m${s}[0m`;
const dim = (s) => `[2m${s}[0m`;
const green = (s) => `[32m${s}[0m`;
const red = (s) => `[31m${s}[0m`;
const yellow = (s) => `[33m${s}[0m`;

function checkNode() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major > MIN[0] || (major === MIN[0] && minor >= MIN[1])) return;

  console.error(`
${red("Your Node.js is too old.")}

  You have:  ${process.versions.node}
  You need:  ${MIN[0]}.${MIN[1]} or newer

Install the "LTS" version from ${bold("https://nodejs.org")}, close this
window, open a new one, and run ${bold("npm run setup")} again.
`);
  process.exit(1);
}

/** Ask for the key without echoing it to the screen. */
function askForKey() {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      // Piped or non-interactive (a CI run, or `echo ... | npm run setup`).
      resolve("");
      return;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    rl.question("Paste your key here and press Enter: ", (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer.trim());
    });

    // The prompt above has already been written, so muting from here hides only
    // the key as it is typed or pasted.
    rl._writeToOutput = () => {};
  });
}

/**
 * Set one variable in .env.local, leaving every other line exactly as it was.
 * Someone may already have Supabase or Resend values in here.
 */
function writeKey(value) {
  let lines = [];
  if (fs.existsSync(ENV_PATH)) {
    lines = fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/);
  }

  const index = lines.findIndex((line) => line.trimStart().startsWith(`${KEY}=`));
  if (index === -1) {
    if (lines.length && lines[lines.length - 1].trim() !== "") lines.push("");
    lines.push(`${KEY}=${value}`, "");
  } else {
    lines[index] = `${KEY}=${value}`;
  }

  fs.writeFileSync(ENV_PATH, lines.join("\n"), { mode: 0o600 });
}

function existingKey() {
  if (!fs.existsSync(ENV_PATH)) return null;
  const match = fs
    .readFileSync(ENV_PATH, "utf8")
    .split(/\r?\n/)
    .find((line) => line.trimStart().startsWith(`${KEY}=`));
  const value = match?.slice(match.indexOf("=") + 1).trim();
  return value ? value : null;
}

async function main() {
  checkNode();

  console.log(`
${bold("Setting up Verdict")}
${dim("This asks for one thing: your Anthropic API key.")}
`);

  const already = existingKey();
  if (already) {
    console.log(
      `${green("You already have a key saved.")} ${dim(`(ends ...${already.slice(-4)})`)}`
    );
    console.log(`\nRun ${bold("npm run dev")}, then open ${bold("http://localhost:3000/verdict")}\n`);
    console.log(dim("To replace the key, run: npm run setup -- --replace\n"));
    if (!process.argv.includes("--replace")) return;
    console.log("Replacing it.\n");
  }

  // Allow `npm run setup -- sk-ant-...` for anyone who prefers one line.
  const fromArgs = process.argv.slice(2).find((a) => a.startsWith("sk-"));

  console.log(`Get a key at ${bold("https://console.anthropic.com")} → API keys → Create key.`);
  console.log(dim("It starts with 'sk-ant-'. It won't show on screen as you paste — that's normal.\n"));

  const key = fromArgs ?? (await askForKey());

  if (!key) {
    console.error(`
${red("No key entered, so nothing was saved.")}

Run ${bold("npm run setup")} again when you have one. The app still runs
without a key — you can read the cases, but no witness will answer you.
`);
    process.exit(1);
  }

  if (!key.startsWith("sk-ant-")) {
    console.log(
      yellow("That doesn't look like an Anthropic key (they start with 'sk-ant-'),")
    );
    console.log(yellow("but saving it anyway. If the witness won't answer, that's why.\n"));
  }

  writeKey(key);

  console.log(`${green("Saved to .env.local.")} ${dim("That file is git-ignored — the key stays on your machine.")}

${bold("Now run:")}  npm run dev

Then open ${bold("http://localhost:3000/verdict")} in Chrome or Safari.
`);
}

main().catch((err) => {
  console.error(red("\nSetup failed:"), err.message);
  process.exit(1);
});
