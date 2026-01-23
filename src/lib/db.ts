/**
 * PostgreSQL database client
 */

import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

/**
 * Get or create the connection pool (lazy initialization)
 */
function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      // Explicitly set SSL to false for local development
      ssl: false,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      // Database pool error - handled silently
    });
  }

  return pool;
}

/**
 * Execute a query
 */
export async function query(text: string, params?: any[]) {
  try {
    const res = await getPool().query(text, params);
    return res;
  } catch (error) {
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const client = await getPool().connect();
  return client;
}

/**
 * Close the pool (for graceful shutdown)
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export default { query, getClient, closePool };
