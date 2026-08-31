import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Only initialize PostgreSQL client if a DATABASE_URL / POSTGRES_URL is explicitly configured
export const sql = connectionString
  ? postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 2,
      onnotice: () => {},
    })
  : null;

export const db = sql ? drizzle(sql, { schema }) : (null as any);

export interface DBStatus {
  connected: boolean;
  message: string;
  lastChecked: Date;
}

export let dbStatus: DBStatus = {
  connected: false,
  message: connectionString ? 'Checking PostgreSQL connection...' : 'PostgreSQL not configured (Using Local File Store Mode)',
  lastChecked: new Date(),
};

export async function checkDatabaseConnection(): Promise<DBStatus> {
  if (!sql) {
    dbStatus = {
      connected: false,
      message: 'DATABASE_URL not set in environment. Running in Standalone Store mode.',
      lastChecked: new Date(),
    };
    return dbStatus;
  }

  try {
    await sql`SELECT 1`;
    dbStatus = {
      connected: true,
      message: 'Connected to PostgreSQL database successfully',
      lastChecked: new Date(),
    };
    return dbStatus;
  } catch (error: any) {
    dbStatus = {
      connected: false,
      message: error?.message || 'Failed to connect to PostgreSQL',
      lastChecked: new Date(),
    };
    return dbStatus;
  }
}
