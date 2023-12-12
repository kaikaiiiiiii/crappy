const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

var folderpath = process.argv[2] || __dirname;
const mkvFiles = fs.readdirSync(folderpath).filter(file => path.extname(file) === '.mkv');

console.log(mkvFiles);



const processNextMkvFile = (mkvFiles, index) => {
  if (index >= mkvFiles.length) {
    console.log('All files have been processed.');
    return;
  }

  const file = path.join(folderpath, mkvFiles[index]);
  const inputFilePath = path.resolve(file);
  const srcFilePath = path.resolve(folderpath, `${path.parse(file).name}.src.mkv`);

  console.log(inputFilePath, srcFilePath)

  // rename source file
  fs.renameSync(inputFilePath, srcFilePath);
  console.log(`Renaming ${file} to ${path.parse(file).name}.src.mkv...`);

  const mkvmerge = spawn('mkvmerge', ['-o', srcFilePath, '--audio-tracks', '1', inputFilePath]);
  console.log(`Processing ${file}...`);

  mkvmerge.on('exit', (code, signal) => {
    if (code !== 0) {
      console.error(`Failed to process ${file}. Error code: ${code}`);
    } else {
      console.log(`${file} has been processed successfully.`);
      // delete source file
      fs.unlinkSync(srcFilePath);
      console.log(`Deleting ${path.parse(file).name}.src.mkv...`);
    }
    processNextMkvFile(mkvFiles, index + 1);
  });
};

processNextMkvFile(mkvFiles, 0);
