import { startLightpanda } from "./lightpanda";

async function globalSetup(): Promise<void> {
	await startLightpanda();
}

export default globalSetup;
