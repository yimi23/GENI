/**
 * Pill check history — SQLite-backed.
 * Same public API as the old JSON implementation; storage is now durable,
 * indexed, and no longer capped at 100 records.
 */

import { db } from '../lib/db';
import { moduleLogger } from '../lib/logger';

const log = moduleLogger('pill-history');

export interface PillCheckRecord {
  id: string;
  timestamp: number;
  date: string;
  time: string;
  status: 'present' | 'taken' | 'unclear';
  confidence: 'high' | 'medium' | 'low';
  observations: string;
  method: 'vision' | 'yolo';
}

const insertStmt = db.prepare(`
  INSERT INTO pill_checks (id, timestamp, date, time, status, confidence, observations, method)
  VALUES (@id, @timestamp, @date, @time, @status, @confidence, @observations, @method)
`);

const recentStmt = db.prepare(`
  SELECT * FROM pill_checks ORDER BY timestamp DESC LIMIT ?
`);

const lastStmt = db.prepare(`
  SELECT * FROM pill_checks ORDER BY timestamp DESC LIMIT 1
`);

const todayStmt = db.prepare(`
  SELECT * FROM pill_checks WHERE date = ? ORDER BY timestamp DESC
`);

const clearOldStmt = db.prepare(`
  DELETE FROM pill_checks WHERE timestamp <= ?
`);

export function savePillCheck(
  status: 'present' | 'taken' | 'unclear',
  confidence: 'high' | 'medium' | 'low',
  observations: string,
  method: 'vision' | 'yolo' = 'vision'
): PillCheckRecord {
  const now = new Date();
  const record: PillCheckRecord = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    date: now.toLocaleDateString('en-US'),
    time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    status,
    confidence,
    observations,
    method,
  };

  insertStmt.run(record);
  log.debug({ id: record.id, status }, 'pill check saved');
  return record;
}

export function getPillCheckHistory(limit: number = 20): PillCheckRecord[] {
  return recentStmt.all(limit) as PillCheckRecord[];
}

export function getLastPillCheck(): PillCheckRecord | null {
  return (lastStmt.get() as PillCheckRecord | undefined) || null;
}

export function getTodaysPillChecks(): PillCheckRecord[] {
  const today = new Date().toLocaleDateString('en-US');
  return todayStmt.all(today) as PillCheckRecord[];
}

/** Clear records older than 30 days. */
export function clearOldRecords(): number {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const result = clearOldStmt.run(thirtyDaysAgo);
  log.info({ cleared: result.changes }, 'cleared old pill check records');
  return result.changes;
}
