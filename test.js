import { startApiService, stopApiService } from './utils/api.js';

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTest() {
	try {
		console.log('Starting API service...');
		await startApiService();
		console.log('API service started. Waiting 5 seconds...');

		await delay(5000);

		console.log('Stopping API service...');
		await stopApiService();
		console.log('API service stopped.');
	} catch (error) {
		console.error('Test failed:', error);
		try {
			await stopApiService();
		} catch {
			// Ignore stop errors during cleanup.
		}
		process.exitCode = 1;
	}
}

runTest();
