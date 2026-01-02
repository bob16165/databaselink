import { supabase } from './supabase';

export interface Document {
  name: string;
  url: string;
}

export interface Link {
  id: number;
  title: string;
  description: string;
  url: string;
  order: number;
  icon_url?: string;
  display_type: 'card' | 'icon';
  category: string;
  documents: Document[];
  created_at: string;
}

export async function createLink(
  title: string,
  description: string,
  url: string,
  displayType: 'card' | 'icon' = 'card',
  iconUrl?: string,
  category: string = '共通',
  documents: Document[] = []
) {
  // 現在の最大order値を取得
  const { data: maxOrderData } = await supabase
    .from('links')
    .select('order')
    .order('order', { ascending: false })
    .limit(1)
    .single();
  
  const nextOrder = maxOrderData ? maxOrderData.order + 1 : 0;
  
  const { data, error } = await supabase
    .from('links')
    .insert({
      title,
      description,
      url,
      order: nextOrder,
      display_type: displayType,
      icon_url: iconUrl,
      category,
      documents,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getAllLinks(): Promise<Link[]> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .order('order', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function updateLink(
  id: number,
  title: string,
  description: string,
  url: string,
  displayType?: 'card' | 'icon',
  iconUrl?: string,
  category?: string,
  documents?: Document[]
) {
  const updates: any = {
    title,
    description,
    url,
  };
  
  if (displayType !== undefined) updates.display_type = displayType;
  if (iconUrl !== undefined) updates.icon_url = iconUrl;
  if (category !== undefined) updates.category = category;
  if (documents !== undefined) updates.documents = documents;
  
  const { error } = await supabase
    .from('links')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
}

export async function deleteLink(id: number) {
  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function reorderLinks(linkIds: number[]) {
  // バッチ更新
  const updates = linkIds.map((id, index) => ({
    id,
    order: index,
  }));
  
  for (const update of updates) {
    await supabase
      .from('links')
      .update({ order: update.order })
      .eq('id', update.id);
  }
}
