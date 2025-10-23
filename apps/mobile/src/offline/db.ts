import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('tickets_snapshot.db');

export function init() {
  db.transaction(tx => {
    tx.executeSql(`CREATE TABLE IF NOT EXISTS tickets (ticketId TEXT PRIMARY KEY, serial TEXT, status TEXT, holderName TEXT, nonceTs TEXT)`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY, ticketId TEXT, action TEXT, scannedAt TEXT, deviceId TEXT)`);
  });
}

export function insertTickets(tickets: any[]) {
  db.transaction(tx => {
    for (const t of tickets) tx.executeSql(`INSERT OR REPLACE INTO tickets (ticketId, serial, status, holderName, nonceTs) VALUES (?,?,?,?,?)`, [t.id, t.serial, t.status, t.owner?.name || null, t.nonceTs || null]);
  });
}

export function markOutbox(id: string, ticketId: string, action: string, scannedAt: string, deviceId?: string) {
  db.transaction(tx => {
    tx.executeSql(`INSERT INTO outbox (id, ticketId, action, scannedAt, deviceId) VALUES (?,?,?,?,?)`, [id, ticketId, action, scannedAt, deviceId || 'local']);
  });
}

export function listOutbox(cb: (rows:any[])=>void) {
  db.transaction(tx => {
    tx.executeSql(`SELECT * FROM outbox`, [], (_, { rows }) => cb(rows._array));
  });
}
