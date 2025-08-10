function randomStringGenerator(chars, length) {

    let charSet = '';
    let regex = null

    try { regex = new RegExp(chars) } catch (e) {
        try { regex = new RegExp(`/${chars}/`) } catch (e) { }
    }

    if (regex) {
        for (let i = 0; i < 65536; i++) {
            const char = String.fromCharCode(i);
            if (char.match(regex)) { charSet += char; }
        }
    } else {
        charSet = chars
    }


    if (length) {
        let o = { length: length }
        return function () {
            return Array.from(o, () => charSet.charAt(Math.floor(Math.random() * charSet.length))).join('');
        }
    } else {
        return function (l) {
            return Array.from({ length: l }, () => charSet.charAt(Math.floor(Math.random() * charSet.length))).join('');
        }
    }
}

let randomName = randomStringGenerator('[a-z0-9\.]');
let randomMD5 = randomStringGenerator('[a-f0-9]', 32);


let testCase = Array.from({ length: 1000000 }, () => {
    return {
        name: randomName(10),
        size: Math.ceil(Math.random() * 1000000),
        md5: randomMD5()
    }
});


/* Test Zone Below */


let startTime, endTime;
startTime = new Date();
testCase.forEach(t => t.size < 1024 ? t.size *= 5 : t.size)
endTime = new Date();
console.log('foreach test 1', endTime - startTime)

///////

startTime = new Date();
testCase.map(t => {
    return {
        size: t.size < 1024 ? 0 : t.size,
        name: t.name + '.mp4',
        md5: t.md5
    }
})
endTime = new Date();
console.log('foreach test 2', endTime - startTime)

///////

startTime = new Date();
let a = testCase.filter(t => t.size = 4955)
endTime = new Date();
console.log('foreach test 3', endTime - startTime)