import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  fullName: string;
}

export interface DBUser {
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
  documents: { name: string; url: string }[];
  created_at: string;
  updated_at: string;
}

// ユーザー作成
export async function createUser(username: string, password: string, fullName: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      username,
      password: hashedPassword,
      full_name: fullName,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ユーザー名でユーザーを取得
export async function getUserByUsername(username: string): Promise<DBUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data;
}

// 全ユーザー取得（パスワード除く）
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, created_at')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// ユーザー削除
export async function deleteUser(id: number) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// 記事作成（documentsカラムなしバージョン）
export async function createArticle(
  title: string,
  content: string,
  author: string,
  documents: { name: string; url: string }[] = []
) {
  const { data, error } = await supabase
    .from('articles')
    .insert({
      title,
      content,
      author,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// 記事一覧取得
export async function getAllArticles(limit?: number): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

// 記事削除
export async function deleteArticle(id: number) {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// 記事更新
export async function updateArticle(
  id: number,
  title: string,
  content: string,
  author: string,
  documents?: { name: string; url: string }[]
) {
  const updates: any = {
    title,
    content,
    author,
  };
  
  if (documents !== undefined) updates.documents = documents;
  
  const { error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
}

// ログイン履歴記録
export async function recordLoginHistory(
  userId: number,
  username: string,
  ipAddress: string | null,
  userAgent: string | null
) {
  const { error } = await supabase
    .from('login_history')
    .insert({
      user_id: userId,
      username,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  
  if (error) throw error;
}

// ログイン履歴取得
export async function getLoginHistory(userId: number, limit: number = 10) {
  const { data, error } = await supabase
    .from('login_history')
    .select('*')
    .eq('user_id', userId)
    .order('login_time', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

// 全ログイン履歴取得（管理者用）
export async function getAllLoginHistory(limit: number = 100) {
  const { data, error } = await supabase
    .from('login_history')
    .select(`
      *,
      users!inner (
        full_name
      )
    `)
    .order('login_time', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}
