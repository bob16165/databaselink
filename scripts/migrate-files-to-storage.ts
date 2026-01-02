import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

// .env.local を読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateFiles() {
  console.log('🚀 ファイル移行開始...\n');

  try {
    // アイコンファイルの移行
    const iconsDir = path.join(process.cwd(), 'public', 'icons');
    if (fs.existsSync(iconsDir)) {
      const iconFiles = await readdir(iconsDir);
      console.log(`📁 ${iconFiles.length}個のアイコンファイルを移行中...`);
      
      for (const filename of iconFiles) {
        if (filename === '.gitkeep') continue;
        
        const filePath = path.join(iconsDir, filename);
        const fileBuffer = await readFile(filePath);
        
        const { error } = await supabase.storage
          .from('icons')
          .upload(filename, fileBuffer, {
            contentType: getContentType(filename),
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error(`  ❌ ${filename}: ${error.message}`);
        } else {
          console.log(`  ✅ ${filename}`);
        }
      }
    }

    // PDFファイルの移行
    const docsDir = path.join(process.cwd(), 'public', 'documents');
    if (fs.existsSync(docsDir)) {
      const pdfFiles = await readdir(docsDir);
      console.log(`\n📄 ${pdfFiles.length}個のPDFファイルを移行中...`);
      
      for (const filename of pdfFiles) {
        if (filename === '.gitkeep') continue;
        
        const filePath = path.join(docsDir, filename);
        const fileBuffer = await readFile(filePath);
        
        const { error } = await supabase.storage
          .from('documents')
          .upload(filename, fileBuffer, {
            contentType: 'application/pdf',
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error(`  ❌ ${filename}: ${error.message}`);
        } else {
          console.log(`  ✅ ${filename}`);
        }
      }
    }

    // データベースのURL更新
    console.log('\n🔄 データベースのURL更新中...');
    await updateDatabaseUrls();

    console.log('\n✅ ファイル移行完了!');
  } catch (error) {
    console.error('❌ エラー:', error);
    process.exit(1);
  }
}

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml'
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

async function updateDatabaseUrls() {
  // リンクのアイコンURLを更新
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .not('icon_url', 'is', null);

  if (links) {
    for (const link of links) {
      if (link.icon_url && link.icon_url.startsWith('/icons/')) {
        const filename = link.icon_url.replace('/icons/', '');
        const { data: urlData } = supabase.storage
          .from('icons')
          .getPublicUrl(filename);
        
        await supabase
          .from('links')
          .update({ icon_url: urlData.publicUrl })
          .eq('id', link.id);
        
        console.log(`  ✅ Link ${link.id}: アイコンURL更新`);
      }
    }
  }

  // リンクのドキュメントURLを更新
  const { data: linksWithDocs } = await supabase
    .from('links')
    .select('*')
    .not('documents', 'eq', '[]');

  if (linksWithDocs) {
    for (const link of linksWithDocs) {
      const documents = link.documents as any[];
      if (documents && documents.length > 0) {
        const updatedDocs = documents.map((doc: any) => {
          if (doc.url && doc.url.startsWith('/documents/')) {
            const filename = doc.url.replace('/documents/', '');
            const { data: urlData } = supabase.storage
              .from('documents')
              .getPublicUrl(filename);
            return { ...doc, url: urlData.publicUrl };
          }
          return doc;
        });

        await supabase
          .from('links')
          .update({ documents: updatedDocs })
          .eq('id', link.id);
        
        console.log(`  ✅ Link ${link.id}: PDF URL更新`);
      }
    }
  }

  // 記事のドキュメントURLを更新
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .not('documents', 'eq', '[]');

  if (articles) {
    for (const article of articles) {
      const documents = article.documents as any[];
      if (documents && documents.length > 0) {
        const updatedDocs = documents.map((doc: any) => {
          if (doc.url && doc.url.startsWith('/documents/')) {
            const filename = doc.url.replace('/documents/', '');
            const { data: urlData } = supabase.storage
              .from('documents')
              .getPublicUrl(filename);
            return { ...doc, url: urlData.publicUrl };
          }
          return doc;
        });

        await supabase
          .from('articles')
          .update({ documents: updatedDocs })
          .eq('id', article.id);
        
        console.log(`  ✅ Article ${article.id}: PDF URL更新`);
      }
    }
  }
}

migrateFiles();
