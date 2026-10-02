import { stopLightpanda } from "./lightpanda";

async function globalTeardown(): Promise<void> {
	await stopLightpanda();
}

export default globalTeardown;
