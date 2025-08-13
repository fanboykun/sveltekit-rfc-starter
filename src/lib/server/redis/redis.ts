import { Redis } from 'ioredis';
import { env } from '$env/dynamic/private';

export type RedisInstance = RedisClient;

class RedisClient {
	private static instance: RedisClient;
	private client: Redis | null = null;
	private isConnected: boolean = false;

	constructor() {}

	public static getInstance(): RedisClient {
		if (!RedisClient.instance) {
			RedisClient.instance = new RedisClient();
		}
		return RedisClient.instance;
	}

	public async getClient(): Promise<Redis> {
		if (!this.client || !this.isConnected) {
			await this.connect();
		}
		return this.client!;
	}

	async connect(): Promise<void> {
		try {
			const redisUrl = env.REDIS_URL;
			if (!redisUrl) throw new Error('Redis URL Has not been set');
			this.client = new Redis(redisUrl);

			// Listen to connection events
			this.client.on('connect', () => {
				this.isConnected = true;
				console.log('Successfully connected to Redis');
			});

			this.client.on('error', (err) => {
				this.isConnected = false;
				console.error('Redis connection error:', err);
			});

			this.client.on('close', () => {
				this.isConnected = false;
				console.log('Redis connection closed');
			});

			// Wait for connection
			await new Promise<void>((resolve) => {
				if (this.client!.status === 'ready') {
					this.isConnected = true;
					resolve();
				} else {
					this.client!.once('ready', () => {
						this.isConnected = true;
						resolve();
					});
				}
			});
		} catch (error) {
			this.isConnected = false;
			console.error('Failed to connect to Redis:', error);
			throw error;
		}
	}

	public async disconnect(): Promise<void> {
		if (this.client && this.isConnected) {
			await this.client.quit();
			this.isConnected = false;
			this.client = null;
		}
	}

	public isClientConnected(): boolean {
		return this.isConnected;
	}
}

// Export a singleton instance
const redis = new RedisClient();
export default redis;
