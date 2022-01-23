const fs = require('fs').promises;
const file_system = require('fs');
const path = require('path');

var SWFReader = require('@gizeta/swf-reader');
const { readFromBufferP, extractImages } = require("swf-extract");
var archiver = require('archiver');

const resourceDirectories = [
  "resource/gordon/PRODUCTION-202201142210-995314542",
  "resource/dcr/hof_furni"
]

const iconDirectory = "resource/dcr/hof_furni";

const targetDir = "assets2/";

/*
const start = async (resourceDir) => {
  console.log("Extracting all SWF files from: " + resourceDir);
  const files = await fs.readdir(resourceDir);

  
  for(var file of files) {
    const swfPath = path.join(resourceDir, file);

    if(file.endsWith(".swf")) {
      const rawData = await fs.readFile(path.join(resourceDir, file));
      const swfObject = SWFReader.readSync(swfPath);
      const swf = await readFromBufferP(rawData);
      const assetMap = getAssetMapFromSWF(swfObject);

      const tempLocation = "./dump";

      const dirName = tempLocation + "/" + file.replace(".swf", "");
      await fs.mkdir(dirName, {recursive: true});

      const xmlPaths = await extractXml(swfObject, assetMap, dirName, file.replace(".swf", ""));
      const imagePaths = await extractSwfImages(swf, assetMap, dirName, file.replace(".swf", ""))
    }
  }

  
  console.log("Successfully extracted SWF files!");

  console.log("Converting all furniture to .zip format...");
  const directories = await fs.readdir("./dump");

  for(var directory of directories) {
    console.log(targetDir + directory + '.zip')
    var output = file_system.createWriteStream(targetDir + directory + '.zip');
    var archive = archiver('zip');

    archive.pipe(output);

    archive.directory("./dump/" + directory, false);
    
    await archive.finalize();
  }

  
  console.log("Done converting furniture!");
}

const getAssetMapFromSWF = (swf) => {
  const assetMap = {};

  for (const tag of swf.tags) {
    if (tag.header.code == 76) {
      for (const asset of tag.symbols) {
        const current = assetMap[asset.id] ?? [];
        assetMap[asset.id] = [...current, asset.name]
      }
    }
  }

  return assetMap;
}

const extractXml = async (swf, assetMap, folderName, baseName) => {
  const xmlPaths = [];

  for (const tag of swf.tags) {
    if (tag.header.code == 87) {
      const buffer = tag.data;
      const characterId = buffer.readUInt16LE();

      const value = assetMap[characterId] ?? [];

      for (const rawName of value) {
        const fileName = rawName.substr(baseName.length + 1) + ".xml";
        const savePath = path.join(folderName, fileName);

        const data = buffer.subarray(6);
        await fs.writeFile(savePath, data, "binary");
        xmlPaths.push({ path: savePath, buffer: data })
      }
    }
  }
}

const extractSwfImages = async (swf, assetMap, folderName, baseName) => {
  const images = await Promise.all(extractImages(swf.tags));
  const imagePaths = [];

  console.log(images)
  for (const image of images) {
    console.log(image.characterId)
    const assets = assetMap[image.characterId] ?? [];

    for (const rawName of assets) {
      const fileName = rawName.substr(baseName.length + 1) + ".png";
      const savePath = path.join(folderName, fileName);

      await fs.writeFile(savePath, image.imgData, "binary");

      imagePaths.push({ path: savePath, buffer: image.imgData });
    }
  }

  return imagePaths;
}

for(var resourceDir of resourceDirectories) {
  start(resourceDir);
}
*/

// Finally do the icon extraction
const files = await fs.readdir(iconDirectory);

const targetLocation = targetDir + "furni_icons"

for(var file of files) {
  if(file.endsWith(".png")) {
    // Move icon to target location
    const sourcePath = path.join(iconDirectory, file);
    const targetPath = path.join(targetLocation, file);

    await fs.copyFile(sourcePath, targetPath);
  }
}
