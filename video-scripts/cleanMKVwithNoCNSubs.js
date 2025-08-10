const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

console.log(`CLI: node clean.js [target folder] <del>`);

// const folder = "W:\\Shinban"
const folder = process.argv[2] || 'W:\\Shinban';
const isDelete = process.argv[3] == 'del' ? true : false;

// get all files under folder

const langmatch = ['chi', 'zh-Hans', 'zh-Hant', '中文', 'cht', 'chs'];



function getMKVInfo(filepath) {
    return new Promise((resolve, reject) => {
        const cmd = spawn('mkvmerge', ['-F', 'json', '-i', filepath]);

        let result = '';

        cmd.stdout.on('data', (data) => {
            result += data.toString();
        });

        cmd.on('close', (code) => {
            if (code === 0) {
                try {
                    const info = JSON.parse(result);
                    resolve(info);
                } catch (err) {
                    reject(new Error('Failed to parse JSON', err));
                }
            } else {
                reject(new Error(`Process exited with code ${code}`));
            }
        });
    });
}

function readHistory() {
    let history
    try {
        history = fs.readFileSync('history.log', 'utf-8');
    } catch (error) {
        history = '';
    }
    history = history.split('\n');
    return history;
}

function writeToHistory(arr) {
    let content = arr.join('\n');
    fs.existsSync('history.log') && fs.unlinkSync('history.log');
    fs.writeFileSync('history.log', content);
}

async function hasCNSub(str) {
    // 文件被占用（下载/编辑中）时，得不到mkvinfor，返回-1
    let formatInfo;
    try {
        formatInfo = await getMKVInfo(str);
    } catch (error) {
        return -1
    }
    if (formatInfo.container.recognized == false) {
        console.log('not recognized: ', str);
        return -1
    };
    let subs = formatInfo.tracks.filter(e => e.type == 'subtitles').map(e => {
        let track_name = e.properties.track_name,
            language = e.properties.language,
            language_ietf = e.properties.language_ietf
        return { track_name, language, language_ietf }
    });
    let flag = subs.some(
        e => {
            let a = langmatch.some(l => e.track_name.includes(l));
            let b = e.language.includes('chi');
            let c = e.language_ietf.includes('zh-Han');
            return a || b || c
        }
    );
    if (flag == false) console.log(subs)
    // 无中文，返回0；有中文，返回1
    return flag ? 1 : 0
}

(async () => {

    const filelist = fs.readdirSync(folder).filter(e => e.endsWith('.mkv'));
    const lastlist = readHistory();
    let keeplist = [];

    for (let i = 0; i < filelist.length; i++) {
        let thisfile = path.join(folder, filelist[i]);
        if (lastlist.includes(thisfile)) {
            console.log(true, thisfile);
            keeplist.push(thisfile);
            continue
        } else {
            let flag = await hasCNSub(thisfile);
            if (flag == -1) {
                console.log('?: ', thisfile);
                continue
            }
            if (flag == 1) {
                console.log(true, thisfile);
                keeplist.push(thisfile);
            }
            if (flag == 0) {
                console.log(false, thisfile);
                if (isDelete) {
                    try {
                        fs.unlinkSync(thisfile);
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        }
    }
    writeToHistory(keeplist);
})()