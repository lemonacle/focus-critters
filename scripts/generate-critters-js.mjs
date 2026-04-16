import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.resolve(__dirname, "../js/data/critters.csv");
const outPath = path.resolve(__dirname, "../js/data/critters.js");

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function parseCsv(text) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error("critters.csv must include a header row and at least one data row.");
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, i) => {
      row[header] = (values[i] ?? "").trim();
    });

    if (row.id === "" || row.name === "") {
      throw new Error(`Missing required id or name on CSV row ${index + 2}.`);
    }

    return {
      id: Number(row.id),
      name: row.name,
      emoji: row.emoji,
      group: row.group,
      passives: {
        exploreGroupBonus: Number(row.exploreGroupBonus || 0),
        extractBonus: Number(row.extractBonus || 0)
      }
    };
  });
}

function validateCritters(critters) {
  const ids = new Set();

  for (const critter of critters) {
    if (!Number.isInteger(critter.id)) {
      throw new Error(`Invalid id for critter "${critter.name}": ${critter.id}`);
    }

    if (ids.has(critter.id)) {
      throw new Error(`Duplicate critter id found: ${critter.id}`);
    }

    ids.add(critter.id);

    if (!critter.name) {
      throw new Error(`Critter ${critter.id} is missing a name.`);
    }

    if (!critter.emoji) {
      throw new Error(`Critter ${critter.id} is missing an emoji.`);
    }

    if (!critter.group) {
      throw new Error(`Critter ${critter.id} is missing a group.`);
    }

    if (Number.isNaN(critter.passives.exploreGroupBonus)) {
      throw new Error(`Critter ${critter.id} has invalid exploreGroupBonus.`);
    }

    if (Number.isNaN(critter.passives.extractBonus)) {
      throw new Error(`Critter ${critter.id} has invalid extractBonus.`);
    }
  }
}

function toJs(critters) {
  const critterObjects = critters
    .map((critter) => {
      return `  {
    id: ${critter.id},
    name: ${JSON.stringify(critter.name)},
    emoji: ${JSON.stringify(critter.emoji)},
    group: ${JSON.stringify(critter.group)},
    passives: {
      exploreGroupBonus: ${critter.passives.exploreGroupBonus},
      extractBonus: ${critter.passives.extractBonus}
    }
  }`;
    })
    .join(",\n");

  return `export const critters = [
${critterObjects}
];

export function getCritterById(id) {
  return critters.find((critter) => critter.id === id) || null;
}
`;
}

function main() {
  const csvText = fs.readFileSync(csvPath, "utf8");
  const critters = parseCsv(csvText);

  validateCritters(critters);

  critters.sort((a, b) => a.id - b.id);

  const jsOutput = toJs(critters);
  fs.writeFileSync(outPath, jsOutput, "utf8");

  console.log(\`Generated \${outPath} from \${csvPath} with \${critters.length} critters.\`);
}

main();