const { exec } = require('child_process');
const fs = require('fs');

// 定义要执行的10个命令

let crfs = [17, 19, 21, 23, 25, 27, 29, 31, 33, 35]
let codecs = ['libx264', 'libx265']
let presets = ['ultrafast', 'superfast', 'veryfast', 'faster', 'fast', 'medium', 'slow', 'slower', 'veryslow']
let outname = (codec, crf, preset) => `${codec}-${crf}-${preset}.mp4`
let cmdgen = (codec, crf, preset) => `ffmpeg -i sample.mp4 -c:v ${codec} -crf ${crf} -preset ${preset} -c:a copy ${codec}-${crf}-${preset}.mp4`

let commands = []

for (let crf of crfs) {
    for (let codec of codecs) {
        for (let preset of presets) {
            commands.push({ n: outname(codec, crf, preset), c: cmdgen(codec, crf, preset) })
        }
    }
}



// 记录开始时间
const startTime = new Date();

// 递归函数，依次执行命令
function executeCommand(index) {
    if (index < commands.length) {
        const outname = commands[index].n;
        const command = commands[index].c;

        if (fs.existsSync(outname)) {
            console.log(`File ${outname} exists, skipping command ${index + 1}: ${command}`);
            fs.appendFileSync('log.txt', `File ${outname} exists, skipping command ${index + 1}: ${command}`, 'utf8');
            executeCommand(index + 1);
        } else {

            console.log(`Executing command ${index + 1}: ${command}`);

            // 记录命令开始执行的时间
            const commandStartTime = new Date();

            // 执行命令
            const childProcess = exec(command);

            // 监听命令的输出
            childProcess.stdout.on('data', (data) => {
                console.log(`${data}`);
                fs.appendFileSync('details.log', `STD: ${data}`, 'utf-8')
            });

            // 监听命令的错误输出
            childProcess.stderr.on('data', (data) => {
                console.error(`${data}`);
                fs.appendFileSync('details.log', `ERR: ${data}`, 'utf-8')
            });

            // 监听命令结束事件
            childProcess.on('close', (code) => {
                // 记录命令结束执行的时间
                const commandEndTime = new Date();


                let log = `${index + 1}:${command} Time taken: ${((commandEndTime - commandStartTime) / 1000).toFixed(3)} s\n`
                console.log(log);
                fs.appendFileSync('log.txt', log, 'utf-8');

                // 递归执行下一个命令
                executeCommand(index + 1);
            });
        }
    } else {
        // 所有命令执行完成后输出总体执行时间
        const endTime = new Date();
        let log = `All commands finished. Total time taken: ${((endTime - startTime) / 1000).toFixed(3)} s\n`
        console.log(log);
        fs.appendFileSync('log.txt', log, 'utf-8');
    }

}

// 开始执行第一个命令
executeCommand(0);
