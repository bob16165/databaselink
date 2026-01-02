import fs from 'fs';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || './database.json';

export interface Database {
  users: any[];
  articles: any[];
  login_history: any[];
  links: any[];
  nextIds: {
    users: number;
    articles: number;
    login_history: number;
    links: number;
  };
}

// データベースの読み込み
export function getDatabase(): Database {
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  }
  
  return {
    users: [],
    articles: [],
    login_history: [],
    links: [],
    nextIds: {
      users: 1,
      articles: 1,
      login_history: 1,
      links: 1,
    },
  };
}

// データベースを保存
export function saveDatabase(db: Database) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// データベーススキーマの初期化
export function initDatabase() {
  const db = getDatabase();
  saveDatabase(db);
  console.log('Database initialized successfully');
}

export default getDatabase;
