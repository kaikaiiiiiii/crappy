const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ffmpegcmd = (input, output) => `ffmpeg -i "${input}" -c:v libx264 -crf 21 -c:a copy -preset medium -threads 2 "${output}"`;
const formatlist = ['mp4', 'mkv', 'webm', 'ts', 'm3u8', 'avi'];

const targetfolder = process.argv[2] || './';

async function ffmpegWorker(input) {
    console.log(input);

    const ext = path.parse(input).ext.slice(1);
    // 使用正则表达式检查是否包含 .S.，并忽略大小写
    let outext = ext
    if (ext == 'ts' || ext == 'm3u8') { outext = 'mp4' }
    const output = input.replace(new RegExp(`\\.${ext}$`), '.S.' + outext);

    if (/\.S\./i.test(input)) { return; }
    if (fs.existsSync(output)) { return; }

    if (!formatlist.includes(ext)) return;
    if (!fs.existsSync(input)) return;

    const cmd = 'ffmpeg';
    const args = [
        '-i', input,
        '-c:v', 'libx265',
        '-crf', '26',
        '-c:a', 'copy',
        '-preset', 'medium',
        // '-tune', 'film', // animation, grain, stillimage, fastdecode, zerolatency
        '-threads', '4',
        output
    ];

    const ffmpegProcess = spawn(cmd, args);

    return new Promise((resolve, reject) => {
        ffmpegProcess.stdout.on('data', (data) => {
            process.stdout.write(`${data}`);
        });

        ffmpegProcess.stderr.on('data', (data) => {
            process.stdout.write(`${data}`);
        });

        ffmpegProcess.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`ffmpeg process exited with code ${code}`));
            }
        });

        ffmpegProcess.on('error', (err) => {
            reject(err);
        });
    });
}

async function walkSync(dir) {
    if (!fs.existsSync(dir)) return console.log(`Path not exist: ${dir}`)
    let stats = fs.statSync(dir)
    if (stats.isDirectory()) {
        const files = fs.readdirSync(dir)
        for (const file of files) {
            const filepath = path.join(dir, file)
            await walkSync(filepath)
        }
    } else if (stats.isFile()) {
        await ffmpegWorker(dir)
    } else {
        console.log(`Unknown target: ${dir}`)
    }
}

walkSync(targetfolder)