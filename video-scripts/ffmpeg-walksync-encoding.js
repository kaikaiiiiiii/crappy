const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 需要转换音频为 AAC 并输出为 mp4 的格式
const mp4outputlist = ['wmv', 'ts', 'm3u8', 'avi'];
// 保持原格式且音频直接复制的格式
const keepformatlist = ['mp4', 'mkv', 'webm'];
const targetfolder = process.argv[2] || './';
// 检查是否启用了265编码
const use265 = process.argv[3] === '265';

// 详细输出当前配置信息
console.log('========================================');
console.log('            FFMPEG 批量转换工具');
console.log('========================================');
console.log(`目标目录: ${targetfolder}`);
console.log(`视频编码器: ${use265 ? 'libx265' : 'libx264'}`);
console.log(`CRF 值: ${use265 ? '26' : '21'}`);
console.log(`预设: slow`);
console.log('');
console.log('格式处理规则:');
console.log(`- 以下格式将转换为 MP4 并使用 AAC 音频: ${mp4outputlist.join(', ')}`);
console.log(`- 以下格式保持原格式并复制音频流: ${keepformatlist.join(', ')}`);
console.log('');
console.log('输出文件将添加 ".S." 标记');
console.log('========================================\n');

// 倒计时函数
function countdown(seconds) {
    return new Promise((resolve) => {
        let count = seconds;
        const timer = setInterval(() => {
            console.log(`倒计时: ${count} 秒后开始处理...`);
            count--;
            if (count < 0) {
                clearInterval(timer);
                console.log('开始处理文件...');
                resolve();
            }
        }, 1000);
    });
}

async function main() {
    // 进行5秒倒计时
    await countdown(5);

    // 开始处理文件
    await walkSync(targetfolder);
}

async function ffmpegWorker(input) {
    const ext = path.parse(input).ext.slice(1);
    const lowerEXT = ext.toLocaleLowerCase();

    // 跳过已处理的文件
    if (/\.S\./i.test(input)) return;

    // 只处理两个列表中的格式
    if (!keepformatlist.includes(lowerEXT) && !mp4outputlist.includes(lowerEXT)) return;
    if (!fs.existsSync(input)) return;

    // 确定输出格式
    let outext = lowerEXT;
    if (mp4outputlist.includes(lowerEXT)) {
        outext = 'mp4';
    }

    const output = input.replace(new RegExp(`\\.${ext}$`), '.S.' + outext);
    if (fs.existsSync(output)) return;

    const cmd = 'ffmpeg';
    const args = ['-i', input];

    // 根据是否使用265编码设置不同的视频参数
    if (use265) {
        // libx265 参数
        args.push(
            '-c:v', 'libx265',
            '-crf', '26',
            '-preset', 'slow',
            '-x265-params', 'pools=4'
        );
    } else {
        // libx264 参数
        args.push(
            '-c:v', 'libx264',
            '-crf', '21',
            '-preset', 'slow',
            '-threads', '4'
        );
    }

    // 根据格式列表决定音频编码
    if (mp4outputlist.includes(lowerEXT)) {
        args.push('-c:a', 'aac');  // mp4outputlist 中的格式转换音频为 AAC
    } else {
        args.push('-c:a', 'copy'); // keepformatlist 中的格式保持音频复制
    }

    args.push(output);

    console.log(`转换: ${input} -> ${output}`);
    console.log(`视频编码: ${use265 ? 'libx265' : 'libx264'}`);
    console.log(`音频: ${mp4outputlist.includes(lowerEXT) ? 'AAC' : 'Copy'}`);

    const ffmpegProcess = spawn(cmd, args);

    return new Promise((resolve, reject) => {
        ffmpegProcess.stdout.on('data', (data) => {
            process.stdout.write(`${data}`);
        });

        ffmpegProcess.stderr.on('data', (data) => {
            process.stderr.write(`${data}`);
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
    if (!fs.existsSync(dir)) return console.log(`路径不存在: ${dir}`);

    const stats = fs.statSync(dir);
    if (stats.isDirectory()) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filepath = path.join(dir, file);
            await walkSync(filepath);
        }
    } else if (stats.isFile()) {
        await ffmpegWorker(dir);
    } else {
        console.log(`未知目标: ${dir}`);
    }
}

// 启动主程序
main().catch(console.error);
