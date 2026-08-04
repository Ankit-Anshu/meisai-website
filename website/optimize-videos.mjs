import { readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const websiteDirectory = path.dirname(fileURLToPath(import.meta.url));
const assetsDirectory = path.join(websiteDirectory, "assets");

const boxType = (buffer, offset) => buffer.toString("ascii", offset + 4, offset + 8);
const boxSize = (buffer, offset) => buffer.readUInt32BE(offset);

function topLevelBoxes(buffer) {
  const boxes = [];
  let offset = 0;
  while (offset + 8 <= buffer.length) {
    const size = boxSize(buffer, offset);
    if (size < 8 || offset + size > buffer.length) {
      throw new Error(`Invalid MP4 box at byte ${offset}.`);
    }
    boxes.push({ offset, size, type: boxType(buffer, offset) });
    offset += size;
  }
  if (offset !== buffer.length) throw new Error("Unexpected bytes after the final MP4 box.");
  return boxes;
}

function patchChunkOffsets(moov, delta) {
  for (let index = 4; index <= moov.length - 16; index += 1) {
    const type = moov.toString("ascii", index, index + 4);
    if (type !== "stco" && type !== "co64") continue;

    const start = index - 4;
    const size = moov.readUInt32BE(start);
    const count = moov.readUInt32BE(index + 8);
    const entrySize = type === "stco" ? 4 : 8;
    const entriesStart = index + 12;
    if (size < 16 || entriesStart + count * entrySize > start + size) continue;

    for (let entry = 0; entry < count; entry += 1) {
      const offset = entriesStart + entry * entrySize;
      if (type === "stco") {
        moov.writeUInt32BE(moov.readUInt32BE(offset) + delta, offset);
      } else {
        moov.writeBigUInt64BE(moov.readBigUInt64BE(offset) + BigInt(delta), offset);
      }
    }
  }
}

async function optimize(file) {
  const source = await readFile(file);
  const boxes = topLevelBoxes(source);
  const moov = boxes.find((box) => box.type === "moov");
  const mdat = boxes.find((box) => box.type === "mdat");
  if (!moov || !mdat) throw new Error(`${path.basename(file)} is missing moov or mdat data.`);
  if (moov.offset < mdat.offset) return false;

  const relocatedMoov = Buffer.from(source.subarray(moov.offset, moov.offset + moov.size));
  patchChunkOffsets(relocatedMoov, moov.size);

  const output = Buffer.concat(
    boxes.flatMap((box) => {
      if (box.type === "moov") return [];
      const bytes = source.subarray(box.offset, box.offset + box.size);
      return box.type === "mdat" ? [relocatedMoov, bytes] : [bytes];
    }),
  );
  if (output.length !== source.length) throw new Error(`${path.basename(file)} changed size unexpectedly.`);

  const temporary = `${file}.faststart`;
  await writeFile(temporary, output);
  await rename(temporary, file);
  return true;
}

const files = (await readdir(assetsDirectory))
  .filter((name) => name.toLowerCase().endsWith(".mp4"))
  .map((name) => path.join(assetsDirectory, name));

for (const file of files) {
  const changed = await optimize(file);
  console.log(`${path.basename(file)}: ${changed ? "optimized for web playback" : "already optimized"}`);
}
