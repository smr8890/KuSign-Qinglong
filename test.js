import { startApiService, stopApiService } from './utils/api.js';

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTest() {
	// const tokenEnv = process.env.KUSIGN_TOKEN || '';
	// if (tokenEnv.length > 0) {
	// 	QLAPI.updateEnv({
	// 		envs: [
	// 			{
	// 				name: 'KUSIGN_TOKEN',
	// 				value: "2222",
	// 				remarks: '酷狗签到token'
	// 			}
	// 		]
	// 	}).then((res) => {
	// 		console.log('updateEnv', res);
	// 	});
	// } else {
	// 	QLAPI.createEnv({
	// 		envs: [
	// 			{
	// 				name: 'KUSIGN_TOKEN',
	// 				value: "2222",
	// 				remarks: '酷狗签到token'
	// 			}
	// 		]
	// 	}).then((res) => {
	// 		console.log('createEnv', res);
	// 	});
	// }

	// 获取环境列表
	const token = '新的token';

	const res = await QLAPI.getEnvs({
		searchValue: 'KUSIGN_TOKEN'
	});
	console.log('getEnvs', res);

	if (res.data.length > 0) {
		const res1 = await QLAPI.updateEnv({
			env: {
				...res.data[0],
				value: token
			}
		});
		console.log('updateEnv', res1);
	} else {
		const res1 = await QLAPI.createEnv({
			envs: [
				{
					name: 'KUSIGN_TOKEN',
					value: token,
					remarks: '酷狗签到token'
				}
			]
		});
		console.log('createEnv', res1);
	}
}

runTest();
