import { Pool, type PoolClient } from "pg";
import { attachDatabasePool } from "@neon/functions";
export type DB = Pick<Pool, "query">;
export let pool = new Pool({
  connectionString: process.env.APP_DATABASE_URL || process.env.DATABASE_URL,
  max: 4,
  idleTimeoutMillis: 15000,
  connectionTimeoutMillis: 15000,
  statement_timeout: 20000,
});
attachDatabasePool(pool);
export async function transaction<T>(fn: (c: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function setTestPool(testPool: Pool) {
  if (process.env.NODE_ENV !== "test")
    throw new Error("Test-only dependency injection");
  pool = testPool;
}
