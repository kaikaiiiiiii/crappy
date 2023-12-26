const fs = require('fs')
const spawn = require('child_process').spawn

let input = 'input.mp4'
let output = 'output.mkv'

let ffmpegArgs = [
    '-i', '-', // or 'pipe:0'
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '21',
    '-tune', 'animation', // film, animation, grain, stillimage, fastdecode, zerolatency
    '-c:a', 'copy',
    '-f', 'matroska',
    // ffmpeg stdout method doesn't support mp4, 'cause mp4 need to seek backward to continue encoding, I waste 2 days to learn this
    '-' // or 'pipe:1'
]

let ffmpeg = spawn('ffmpeg', ffmpegArgs)

let readStream = fs.createReadStream(input)
let writeStream = fs.createWriteStream(output)

readStream.pipe(ffmpeg.stdin)
ffmpeg.stdout.pipe(writeStream)

ffmpeg.on('exit', function (code, signal) {
    console.log('exit', code, signal)
})

ffmpeg.on('error', function (err) {
    console.log('error', err)
})
