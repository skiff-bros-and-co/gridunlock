import { mkdirSync, existsSync } from "fs";
import * as gm from "gm";
import * as path from "node:path";

const magick = gm.subClass({ imageMagick: "7+" as any });

const sourceSvgPath = path.join(__dirname, "..", "src", "assets", "grid-unlock.svg");

interface IconDimensions {
  width: number;
  height: number;
}

const androidDimensions: IconDimensions[] = [
  { width: 72, height: 72 },
  { width: 96, height: 96 },
  { width: 128, height: 128 },
  { width: 144, height: 144 },
  { width: 152, height: 152 },
  { width: 192, height: 192 },
  { width: 384, height: 384 },
  { width: 512, height: 512 },
];
const iosDimensions: IconDimensions[] = [
  { width: 120, height: 120 },
  { width: 180, height: 180 },
];

const outputDirectoryPath = path.join(__dirname, "..", "public", "icons");

if (!existsSync(outputDirectoryPath)) {
  console.log(`creating output directory ${outputDirectoryPath}`);
  mkdirSync(outputDirectoryPath);
}

[...androidDimensions, ...iosDimensions].forEach(async (iconDimensions) => {
  const outputPath = path.join(outputDirectoryPath, `icon-${iconDimensions.width}x${iconDimensions.height}.png`);
  console.log(`generating ${outputPath}`);

  try {
    await new Promise((resolve, reject) => {
      magick(sourceSvgPath)
        .background("none")
        .resize(iconDimensions.width, iconDimensions.height)
        .write(outputPath, function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(undefined);
        });
    });
  } catch (err) {
    console.log(`Failed while generating ${outputPath}`, err);
    throw err;
  }
});
