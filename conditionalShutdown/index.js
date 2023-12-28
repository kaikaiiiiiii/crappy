const iconv = require("iconv-lite");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const encoding = 'cp936';
const binaryEncoding = 'binary';
const DOWNTHRESHOLD = 1024 * 50;

const pName = process.argv[2] || 'explorer.exe';
const netFlowWindow = process.argv[3] || 60;
const SHUTDOWNDELAY = 600

function iconvDecode(str = '') {
    return iconv.decode(Buffer.from(str, binaryEncoding), encoding);
}

function cmdOps(cmdstring, config = {}) {
    let cmd = cmdstring;
    return new Promise((resolve, reject) => {
        //stdout is gbk coding
        let worker = exec(cmd, { encoding: 'binary' });
        let output = '';
        worker.stdout.on("data", data => {
            output += `${data}`;
        })
        worker.stderr.on("data", data => {
            output += `${data}`;
        })
        worker.on("close", code => {
            if (code === 0) {
                console.log(`❤️  ${cmd}`);
                let result = iconvDecode(output);
                resolve(result)
            } else {
                reject(new Error(`❌ ${code}`))
            }
        });
    });
}

async function shutdown(sec = 60) {
    try {
        await cmdOps(`shutdown /s /t ${sec}`);
        console.log("shutdown");
    } catch (err) {
        console.log(err);
    }
}


async function getFlow(sec) {
    if (process.platform === "win32") {
        let work = await cmdOps(`typeperf \"\\Network Adapter(*)\\Bytes Received/sec\" -sc ${sec}`)
        work = work.split('\r\n').map(item => item.split(','))
        work = work.flat().filter(item => item)
        work = work.reduce((prev, cur) => {
            let num = Number(cur.replace(/\"/g, ''));
            if (!isNaN(num)) {
                return prev + Number(cur.replace(/\"/g, ''));
            } else {
                return prev;
            }
        }, 0);
        return work;
    } else {
        return DOWNTHRESHOLD;
    }
}

async function getTaskList(pname = '') {
    let filteredlist = '';
    let targetlist = pname.toLocaleLowerCase().split(',').map(item => item.trim());
    if (process.platform === "win32") {
        filteredlist = await cmdOps(`tasklist /fo csv`);
    } else {
        return ['explorer.exe'];
    }
    filteredlist = filteredlist.split('\r\n').slice(1).filter(item => item).map(item => {
        return item.split(',').slice(0, 1)[0].replace(/\"/g, '')
    });
    return filteredlist.filter(item => targetlist.some(t => item.toLocaleLowerCase().includes(t)));
}





function checkTime(log) {
    let now = new Date();
    let time = now.getHours() + now.getMinutes() / 100;
    let flag = time > 0.30 && time < 9.00 ? true : false;
    log.push({ name: 'Time', log: time, flag: flag })
}

async function checkTask(log) {
    let taskList = await getTaskList(pName);
    let flag = taskList.length > 0 ? false : true;
    let taskText = JSON.stringify(taskList);
    log.push({ log: taskText, flag: flag, nname: "Task" })
}

async function checkFLow(log) {
    let flowPerSec = await getFlow(netFlowWindow) / netFlowWindow;
    let flag = flowPerSec > DOWNTHRESHOLD ? false : true;
    let flowText = (flowPerSec / 1024).toFixed(2) + ' kB / s';
    log.push({ log: flowText, flag: flag, name: "Flow" });
}

function checkFlag(log) {
    let sflag = log.reduce((prev, cur) => prev && cur.flag, true);
    if (sflag === true && log.length < 3) { return }
    if (sflag === true && log.length === 3) {
        printLog(log);
        shutdown(SHUTDOWNDELAY)
    }
    if (sflag === false) {
        printLog(log);
        process.exit(0)
    }
}

function printLog(log) {
    let logcontent = `>> ${new Date().toLocaleString()} \n\n`
    let flagarr = [];
    log.forEach(e => {
        logcontent += e.name + ': ' + e.log + '\n'
        flagarr.push(e.flag)
    });
    logcontent += 'Flag: ' + JSON.stringify(flagarr) + '\n\n'
    console.log(logcontent);
    fs.appendFileSync(path.resolve(__dirname, 'log.log'), logcontent, 'utf-8');
}


async function main() {

    let log = [];
    checkTime(log);
    checkFlag(log);
    await checkTask(log);
    checkFlag(log);
    await checkFLow(log);
    checkFlag(log);

}

main();