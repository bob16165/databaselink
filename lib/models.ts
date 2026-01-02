import { getDatabase, saveDatabase } from './db';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  password: string;
  full_name: string;
  created_at: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

export interface LoginHistory {
  id: number;
  user_id: number;
  username: string;
  login_time: string;
  ip_address: string | null;
  user_agent: string | null;
}

// ユーザー関連
export function createUser(username: string, password: string, fullName: string) {
  const db = getDatabase();
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  const user: User = {
    id: db.nextIds.users++,
    username,
    password: hashedPassword,
    full_name: fullName,
    created_at: new Date().toISOString(),
  };
  
  db.users.push(user);
  saveDatabase(db);
}

export function getUserByUsername(username: string): User | undefined {
  const db = getDatabase();
  return db.users.find(u => u.username === username);
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}

// 記事関連
export function createArticle(title: string, content: string, author: string) {
  const db = getDatabase();
  
  const article: Article = {
    id: db.nextIds.articles++,
    title,
    content,
    author,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  db.articles.push(article);
  saveDatabase(db);
}

export function getAllArticles(): Article[] {
  const db = getDatabase();
  return [...db.articles].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getRecentArticles(limit: number = 5): Article[] {
  return getAllArticles().slice(0, limit);
}

// ログイン履歴関連
export function recordLogin(userId: number, username: string, ipAddress: string | null, userAgent: string | null) {
  const db = getDatabase();
  
  const history: LoginHistory = {
    id: db.nextIds.login_history++,
    user_id: userId,
    username,
    login_time: new Date().toISOString(),
    ip_address: ipAddress,
    user_agent: userAgent,
  };
  
  db.login_history.push(history);
  saveDatabase(db);
}

export function getLoginHistory(userId: number, limit: number = 10): LoginHistory[] {
  const db = getDatabase();
  return db.login_history
    .filter(h => h.user_id === userId)
    .sort((a, b) => new Date(b.login_time).getTime() - new Date(a.login_time).getTime())
    .slice(0, limit);
}

export function getAllLoginHistory(limit: number = 50): LoginHistory[] {
  const db = getDatabase();
  return [...db.login_history]
    .sort((a, b) => new Date(b.login_time).getTime() - new Date(a.login_time).getTime())
    .slice(0, limit);
}
