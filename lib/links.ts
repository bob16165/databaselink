import { getDatabase, saveDatabase } from './db';

export interface Link {
  id: number;
  title: string;
  description: string;
  url: string;
  order: number;
  iconUrl?: string;
  displayType: 'card' | 'icon';
  category: string; // '共通', '1年', '2年', '3年' など
  created_at: string;
}

export function createLink(
  title: string,
  description: string,
  url: string,
  displayType: 'card' | 'icon' = 'card',
  iconUrl?: string,
  category: string = '共通'
) {
  const db = getDatabase();
  
  const link: Link = {
    id: db.nextIds.links++,
    title,
    description,
    url,
    order: db.links.length,
    displayType,
    iconUrl,
    category,
    created_at: new Date().toISOString(),
  };
  
  db.links.push(link);
  saveDatabase(db);
}

export function getAllLinks(): Link[] {
  const db = getDatabase();
  return [...db.links].sort((a, b) => a.order - b.order);
}

export function updateLink(
  id: number,
  title: string,
  description: string,
  url: string,
  displayType?: 'card' | 'icon',
  iconUrl?: string,
  category?: string
) {
  const db = getDatabase();
  const index = db.links.findIndex((l: Link) => l.id === id);
  
  if (index !== -1) {
    db.links[index] = {
      ...db.links[index],
      title,
      description,
      url,
      ...(displayType !== undefined && { displayType }),
      ...(iconUrl !== undefined && { iconUrl }),
      ...(category !== undefined && { category }),
    };
    saveDatabase(db);
  }
}

export function deleteLink(id: number) {
  const db = getDatabase();
  db.links = db.links.filter((l: Link) => l.id !== id);
  saveDatabase(db);
}

export function reorderLinks(linkIds: number[]) {
  const db = getDatabase();
  
  linkIds.forEach((id, index) => {
    const link = db.links.find((l: Link) => l.id === id);
    if (link) {
      link.order = index;
    }
  });
  
  saveDatabase(db);
}
