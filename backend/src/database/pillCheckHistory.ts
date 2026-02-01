import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(__dirname, '../../data/pill_check_history.json');

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

interface Database {
  records: PillCheckRecord[];
  lastCheck: PillCheckRecord | null;
}

// Initialize database file
function initDatabase(): Database {
  const dataDir = path.join(__dirname, '../../data');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Create database file if it doesn't exist
  if (!fs.existsSync(DB_FILE)) {
    const emptyDb: Database = { records: [], lastCheck: null };
    fs.writeFileSync(DB_FILE, JSON.stringify(emptyDb, null, 2));
    return emptyDb;
  }
  
  // Read existing database
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

// Read database
function readDatabase(): Database {
  if (!fs.existsSync(DB_FILE)) {
    return initDatabase();
  }
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

// Write database
function writeDatabase(db: Database): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

/**
 * Save a pill check result to history
 */
export function savePillCheck(
  status: 'present' | 'taken' | 'unclear',
  confidence: 'high' | 'medium' | 'low',
  observations: string,
  method: 'vision' | 'yolo' = 'vision'
): PillCheckRecord {
  const db = readDatabase();
  
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
  
  db.records.unshift(record); // Add to beginning
  db.lastCheck = record;
  
  // Keep only last 100 records
  if (db.records.length > 100) {
    db.records = db.records.slice(0, 100);
  }
  
  writeDatabase(db);
  console.log('💾 Saved pill check to database:', record.id);
  
  return record;
}

/**
 * Get pill check history
 */
export function getPillCheckHistory(limit: number = 20): PillCheckRecord[] {
  const db = readDatabase();
  return db.records.slice(0, limit);
}

/**
 * Get last pill check
 */
export function getLastPillCheck(): PillCheckRecord | null {
  const db = readDatabase();
  return db.lastCheck;
}

/**
 * Get pill checks for today
 */
export function getTodaysPillChecks(): PillCheckRecord[] {
  const db = readDatabase();
  const today = new Date().toLocaleDateString('en-US');
  return db.records.filter(r => r.date === today);
}

/**
 * Clear old records (older than 30 days)
 */
export function clearOldRecords(): number {
  const db = readDatabase();
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  const before = db.records.length;
  db.records = db.records.filter(r => r.timestamp > thirtyDaysAgo);
  const after = db.records.length;
  
  writeDatabase(db);
  console.log(`🗑️  Cleared ${before - after} old pill check records`);
  
  return before - after;
}
