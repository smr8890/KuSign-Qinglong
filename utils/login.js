import { startApiService, stopApiService, sendRequest } from './api.js';

//启动API服务
try {
    console.log('Starting API service...');
    await startApiService();
    console.log('API service started.');
} catch (error) {
    console.error('Failed to start API service:', error);
    process.exitCode = 1;
}

//1. 调用二维码key接口获取key，/login/qr/key,返回qrcode，qrcode_img
const keyResponse = await sendRequest("/login/qr/key?timestrap=" + Date.now(), "GET", { "Content-Type": "application/json" });

const key = keyResponse.data.qrcode;
const qrcode_img = keyResponse.data.qrcode_img;
const base64 = qrcode_img.includes(",") ? qrcode_img.split(",")[1] : qrcode_img;
const qrImage = `base64://${base64}`;

//2.在控制台输出二维码图片
console.log("请复制下面的链接在浏览器中打开，扫码完成登录：");
// QRCode.generate(qrImage, { small: true });
const dataUrl = "data:image/png;base64," + base64;
console.log(dataUrl);

//3. 轮询登录状态接口，/login/qr/check，必选参数：key: ,由第一个接口生成，
// 轮询此接口可获取二维码扫码状态,0 为二维码过期，1 为等待扫码，2 为待确认，4 为授权登录成功（4 状态码下会返回 token）
let scannedNotified = false; // 避免重复提示扫码成功，等待确认
let loginSuccess = false;
const intervalMs = 2000; // 轮询间隔 2s
const timeoutMs = 2 * 60 * 1000; // 2 分钟超时
const maxAttempts = Math.ceil(timeoutMs / intervalMs);
for (let attempt = 0; attempt < maxAttempts && !loginSuccess; attempt++) {
    try {
        const timestrap = Date.now();
        const checkResponse = await sendRequest("/login/qr/check?key=" + key + "&timestrap=" + timestrap, "GET", { "Content-Type": "application/json" });
        const status = checkResponse.data.status;
        if (status === 1) {
            // 等待扫码
        } else if (status === 0) {
            // 二维码已过期
            console.log("二维码已过期，请重新登录");
            loginSuccess = true;
        } else if (status === 2) {
            if (!scannedNotified) {
                console.log("扫码成功，请确认登录");
                scannedNotified = true;
            }
        } else if (status === 4) {
            // 登录成功，保存信息
            const token = checkResponse.data.token;
            // 保存 token 到环境变量
            //先确认环境变量是否存在，如果存在则更新，如果不存在则创建
            const envs = await QLAPI.getEnvs({
                searchValue: 'KUSIGN_TOKEN'
            });
            if (envs.data.length > 0) {
                const res = await QLAPI.updateEnv({
                    env: {
                        ...envs.data[0],
                        value: token
                    }
                });
                // console.log('updateEnv', res);
            } else {
                const res = await QLAPI.createEnv({
                    envs: [
                        {
                            name: 'KUSIGN_TOKEN',
                            value: token,
                            remarks: '酷狗签到token'
                        }
                    ]
                });
                // console.log('createEnv', res);
            }
            console.log("登录成功！");
            loginSuccess = true;
        } else {
            console.log("登录出错，请稍后再试！");
            loginSuccess = true;
        }
    } catch (error) {
        console.error("检查登录状态失败:", error);
        loginSuccess = true;
    }

    if (!loginSuccess && attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
}

if (!loginSuccess) {
    console.log("登录超时，请重试。");
}

//停止API服务
try {
    console.log('Stopping API service...');
    await stopApiService();
    console.log('API service stopped.');
} catch (error) {
    console.error('Failed to stop API service:', error);
    process.exitCode = 1;
}
