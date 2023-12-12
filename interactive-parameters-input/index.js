const readline = require('readline');
const { clearScreenDown } = require('readline');

// 定义参数
const parameters = [
    { name: 'Param1', defaultValue: 'Default1', options: ['Option1', 'Option2', 'Option3'] },
    { name: 'Param2', defaultValue: 'Default2', options: ['OptionA', 'OptionB', 'OptionC'] },
    // ... 添加其余参数
];

// 初始化 readline 接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 显示参数
function displayParameters() {
    clearScreenDown(rl.output);
    console.log('参数列表：');
    parameters.forEach((param, index) => {
        console.log(`${index + 1}. ${param.name}: ${param.defaultValue}`);
    });
}

// 修改参数值
function modifyParameter(index, newValue) {
    parameters[index - 1].defaultValue = newValue;
}

// 逐步执行交互
function interactive() {
    displayParameters();

    rl.question('请选择要修改的参数编号 (1-10)，或输入 q 退出：', (choice) => {
        if (choice.toLowerCase() === 'q') {
            rl.close();
            return;
        }

        const index = parseInt(choice);
        if (isNaN(index) || index < 1 || index > parameters.length) {
            console.log('无效的选择，请重新输入。');
            interactive();
        } else {
            rl.question(`请输入新的值（可选值：${parameters[index - 1].options.join(', ')}）：`, (newValue) => {
                modifyParameter(index, newValue);
                interactive();
            });
        }
    });
}

// 开始交互
interactive();

// 当用户关闭 readline 接口时，关闭程序
rl.on('close', () => {
    console.log('谢谢使用，再见！');
    process.exit(0);
});
