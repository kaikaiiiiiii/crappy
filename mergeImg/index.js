const sharp = require('sharp');
const fs = require('fs');

// 读取图片文件
const image1 = `./cut/截屏2023-08-18 11.03.25.png`; // 替换为你的图片路径
const image2 = `./cut/截屏2023-08-18 11.03.33.png`; // 替换为你的图片路径

function readImg(path) {
    return new Promise((resolve, reject) => {
        sharp(path).raw().toBuffer((err, data, info) => {
            if (err) {
                reject(err);
            } else {
                resolve({ data, info });
            }
        });
    });
}


(async () => {
    let i1 = await readImg(image1);
    let i2 = await readImg(image2);

    console.log(i1.info);

    function findoverlap(image1, image2) {

        function pix(i, j, image) {
            let index = (i * image.info.width + j) * image.info.channels;
            return image.data.slice(index, index + 4);
        }

        function same(s1, s2) {
            // return s1.every((v, i) => v === s2[i]);
            return Buffer.compare(s1, s2) === 0;
        }

        function cut(image, [wstart, wend, hstart, hend]) {
            let cutBuffers = Buffer.alloc(0);
            let { width, height, channels } = image.info;
            // check legal
            let ws = wstart < 0 ? 0 : wstart;
            let we = wend > width - 1 ? width - 1 : wend;
            let hs = hstart < 0 ? 0 : hstart;
            let he = hend > height - 1 ? height - 1 : hend;

            for (let h = hs; h <= he; h++) {
                let lineBuffer = image.data.slice(h * width * channels + ws * channels, h * width * channels + we * channels);
                cutBuffers = Buffer.concat([cutBuffers, lineBuffer]);
            }

            return cutBuffers;
        }


        let { width: w1, height: h1 } = image1.info;
        let { width: w2, height: h2 } = image2.info;

        let p2lt = pix(0, 0, image2); // 左上匹配，image1 右下切， image2 左上切
        let p2rt = pix(0, w2 - 1, image2); // 右上匹配，image1 左下切， image2 右上切
        let p2lb = pix(h2 - 1, 0, image2); // 左下匹配，image1 右上切， image2 左下切
        let p2rb = pix(h2 - 1, w2 - 1, image2); // 右下匹配，image1 左上切， image2 右下切


        for (let i = 0; i < h1; i++) {
            for (let j = 0; j < w1; j++) {
                let p1 = pix(i, j, image1);
                if (same(p1, p2lt)) { console.log('左上匹配', i, j); }
                if (same(p1, p2rt)) { console.log('右上匹配', i, j); }
                if (same(p1, p2lb)) { console.log('左下匹配', i, j); }
                if (same(p1, p2rb)) { console.log('右下匹配', i, j); }
            }
        }

    }
    findoverlap(i1, i2)
})();