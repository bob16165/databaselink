'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface User {
  id: number;
  username: string;
  fullName: string;
}

interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

interface DBUser {
  id: number;
  username: string;
  full_name: string;
  created_at: string;
}

// 新規PDF追加コンポーネント
const NewPdfUploader = ({ 
  onUpload, 
  uploading 
}: { 
  onUpload: (docName: string, file: File) => void;
  uploading: boolean;
}) => {
  const [docName, setDocName] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (file && docName) {
      onUpload(docName, file);
      setFile(null);
      setDocName('');
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={docName}
        onChange={(e) => setDocName(e.target.value)}
        placeholder="PDF名（例: 昼間用、夜間用）"
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
      />
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        disabled={uploading}
        className="w-full text-sm"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || !docName || uploading}
        className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
      >
        {uploading ? 'アップロード中...' : 'PDFを追加'}
      </button>
    </div>
  );
};

// ドラッグ可能なリンクアイテムコンポーネント（外部で定義）
const SortableItem = ({ 
  link, 
  editingLink, 
  setEditingLink,
  handleUpdateLink,
  handleDeleteLink,
  handleIconUpload,
  handlePdfUpload,
  uploadingIcon,
  uploadingPdf,
  categories
}: { 
  link: any; 
  editingLink: any;
  setEditingLink: (link: any) => void;
  handleUpdateLink: (e: React.FormEvent) => void;
  handleDeleteLink: (id: number) => void;
  handleIconUpload: (file: File, type: 'new' | 'edit') => void;
  handlePdfUpload: (file: File, type: 'new' | 'edit', docName: string) => void;
  uploadingIcon: boolean;
  uploadingPdf: boolean;
  categories: string[];
}) => {
  const [newDocName, setNewDocName] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 編集モード中はドラッグを無効化
  const isEditing = editingLink?.id === link.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-white border border-gray-200 rounded-lg ${
        !isEditing ? 'cursor-move hover:border-blue-300' : ''
      }`}
    >
      {isEditing ? (
        <form onSubmit={handleUpdateLink} className="space-y-3">
          <input
            type="text"
            value={editingLink.title}
            onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            placeholder="タイトル"
          />
          <textarea
            value={editingLink.description}
            onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            placeholder="説明（改行可能）"
            rows={3}
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">PDF または URL</label>
            <input
              type="text"
              value={editingLink.url}
              onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
              placeholder="URL（例: tel:0123456789）"
            />
            
            {/* 複数PDF管理 */}
            <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-2">添付PDF（複数可能）</label>
              
              {/* 既存PDFリスト */}
              {editingLink.documents && editingLink.documents.length > 0 && (
                <div className="mb-3 space-y-2">
                  {editingLink.documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-300">
                      <div className="flex-1">
                        <span className="text-xs font-medium">{doc.name}</span>
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-xs text-blue-600 hover:underline"
                        >
                          表示
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newDocs = editingLink.documents.filter((_: any, i: number) => i !== index);
                          setEditingLink({ ...editingLink, documents: newDocs });
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 新規PDF追加 */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="PDF名（例: 昼間用、夜間用）"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setNewDocFile(e.target.files?.[0] || null)}
                  disabled={uploadingPdf}
                  className="w-full text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newDocFile && newDocName) {
                      handlePdfUpload(newDocFile, 'edit', newDocName);
                      setNewDocFile(null);
                      setNewDocName('');
                    }
                  }}
                  disabled={!newDocFile || !newDocName || uploadingPdf}
                  className="w-full px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
                >
                  {uploadingPdf ? 'アップロード中...' : 'PDFを追加'}
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">カテゴリー</label>
            <select
              value={editingLink.category || '共通'}
              onChange={(e) => setEditingLink({ ...editingLink, category: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">表示タイプ</label>
            <select
              value={editingLink.displayType || 'card'}
              onChange={(e) => setEditingLink({ ...editingLink, displayType: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="card">通常カード</option>
              <option value="icon">アイコンのみ</option>
            </select>
          </div>
          {editingLink.displayType === 'icon' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">アイコン画像</label>
              {editingLink.iconUrl && (
                <div className="mb-2">
                  <img src={editingLink.iconUrl} alt="Icon" className="w-12 h-12 object-cover rounded" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleIconUpload(file, 'edit');
                }}
                disabled={uploadingIcon}
                className="w-full text-xs"
              />
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => setEditingLink(null)}
              className="flex-1 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              キャンセル
            </button>
          </div>
        </form>
      ) : (
        <>
          <div 
            {...attributes}
            {...listeners}
            className="flex items-start gap-3 mb-2"
          >
            <div className="flex-shrink-0 pt-1">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{link.title}</h3>
              {link.displayType === 'icon' && link.iconUrl && (
                <img src={link.iconUrl} alt={link.title} className="w-8 h-8 object-cover rounded mt-1" />
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">{link.description}</p>
          <p className="text-xs text-gray-500 mb-2 break-all">{link.url}</p>
          <div className="flex gap-2 mb-3">
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
              {link.category || '共通'}
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {link.displayType === 'icon' ? 'アイコン表示' : 'カード表示'}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingLink(link);
              }}
              className="flex-1 px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
            >
              編集
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteLink(link.id);
              }}
              className="flex-1 px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
            >
              削除
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'articles' | 'users' | 'links' | 'login-history'>('articles');
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  // 記事追加フォーム
  const [newArticle, setNewArticle] = useState({ 
    title: '', 
    content: '', 
    author: '',
    documents: [] as { name: string; url: string }[]
  });
  const [showArticleForm, setShowArticleForm] = useState(false);

  // ユーザー追加フォーム
  const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '' });
  const [showUserForm, setShowUserForm] = useState(false);
  const [bulkImportResult, setBulkImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // リンク管理
  const [links, setLinks] = useState<any[]>([]);
  const [newLink, setNewLink] = useState({
    title: '',
    description: '',
    url: '',
    displayType: 'card' as 'card' | 'icon',
    iconUrl: '',
    category: '共通',
    documents: [] as { name: string; url: string }[],
  });
  const [editingLink, setEditingLink] = useState<any>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // カテゴリー一覧（学年のみ＋学年-クラス形式）
  const categories = [
    '共通',
    '1年', '1年-A', '1年-B', '1年-C',
    '2年', '2年-A', '2年-B', '2年-C',
    '3年', '3年-A', '3年-B', '3年-C'
  ];

  // ドラッグ&ドロップセンサー
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();

      if (data.authenticated && data.user.username === 'admin') {
        setUser(data.user);
        fetchArticles();
        fetchUsers();
        fetchLinks();
        fetchLoginHistory();
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/admin/articles');
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Articles fetch error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Users fetch error:', error);
    }
  };

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/admin/links');
      const data = await response.json();
      setLinks(data.links || []);
    } catch (error) {
      console.error('Links fetch error:', error);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      const response = await fetch('/api/login-history?all=true&limit=500');
      const data = await response.json();
      setLoginHistory(data.history || []);
    } catch (error) {
      console.error('Login history fetch error:', error);
    }
  };

  const downloadLoginHistoryCSV = () => {
    // CSVヘッダー
    const headers = ['ログイン日時', '学生名（保護者名）', 'ユーザー名'];
    
    // CSVデータ行
    const rows = loginHistory.map((history) => {
      const loginTime = new Date(history.login_time).toLocaleString('ja-JP');
      const fullName = history.users?.full_name || history.username;
      return [loginTime, fullName, history.username];
    });
    
    // CSVコンテンツ作成
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // BOM付きでダウンロード（Excel対応）
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 10);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `login_history_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArticle),
      });

      if (response.ok) {
        setNewArticle({ title: '', content: '', author: '', documents: [] });
        setShowArticleForm(false);
        fetchArticles();
        alert('記事を追加しました');
      } else {
        const data = await response.json();
        console.error('記事追加エラー:', data);
        alert(`記事の追加に失敗しました: ${data.error || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('記事追加エラー:', error);
      alert(`エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm('この記事を削除しますか？')) return;

    try {
      const response = await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchArticles();
        alert('記事を削除しました');
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setNewUser({ username: '', password: '', fullName: '' });
        setShowUserForm(false);
        fetchUsers();
        alert('ユーザーを追加しました');
      } else {
        const data = await response.json();
        alert(data.error || '追加に失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('このユーザーを削除しますか？')) return;

    try {
      const response = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (response.ok) {
        fetchUsers();
        alert('ユーザーを削除しました');
      } else {
        alert(data.error || '削除に失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました');
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(`CSVファイル「${file.name}」からユーザーを一括登録しますか？`)) {
      e.target.value = '';
      return;
    }

    setBulkImportResult(null); // 前回の結果をクリア

    try {
      const formData = new FormData();
      formData.append('csv', file);

      const response = await fetch('/api/admin/users/bulk-import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('CSV Upload Response:', data);

      if (response.ok) {
        console.log('Setting bulk import result:', data.results);
        setBulkImportResult(data.results);
        // 結果表示の後にユーザーリストを更新
        await fetchUsers();
      } else {
        alert(data.error || '一括登録に失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました');
    } finally {
      e.target.value = '';
    }
  };

  const handleResetUsers = async () => {
    if (!confirm('【年度更新】\n\n全ユーザーを削除します（管理者は除く）。\nこの操作は取り消せません。\n\n本当に実行しますか？')) {
      return;
    }

    if (!confirm('最終確認です。本当に全ユーザーを削除しますか？')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users/reset', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        fetchUsers();
        alert(data.message);
      } else {
        alert(data.error || '削除に失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました');
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink),
      });

      if (response.ok) {
        setNewLink({
          title: '',
          description: '',
          url: '',
          displayType: 'card',
          iconUrl: '',
          category: '共通',
          documents: [],
        });
        setShowLinkForm(false);
        fetchLinks();
        alert('リンクを追加しました');
      } else {
        const data = await response.json();
        alert(data.error || '追加に失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました');
    }
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLink),
      });

      if (response.ok) {
        setEditingLink(null);
        fetchLinks();
        alert('リンクを更新しました');
      } else {
        alert('更新に失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました');
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm('このリンクを削除しますか？')) return;

    try {
      const response = await fetch(`/api/admin/links?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchLinks();
        alert('リンクを削除しました');
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex);
      setLinks(newLinks);

      // サーバーに並び順を保存
      try {
        const linkIds = newLinks.map((link) => link.id);
        const response = await fetch('/api/admin/links/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkIds }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          console.error('Failed to save link order:', data.error);
          fetchLinks(); // エラー時は元に戻す
        }
      } catch (error) {
        console.error('Failed to save link order:', error);
        fetchLinks(); // エラー時は元に戻す
      }
    }
  };

  const handleIconUpload = async (
    file: File,
    type: 'new' | 'edit'
  ) => {
    setUploadingIcon(true);
    try {
      const formData = new FormData();
      formData.append('icon', file);

      const response = await fetch('/api/admin/upload-icon', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (type === 'new') {
          setNewLink({ ...newLink, iconUrl: data.iconUrl });
        } else {
          setEditingLink({ ...editingLink, iconUrl: data.iconUrl });
        }
        alert('アイコンをアップロードしました');
      } else {
        const data = await response.json();
        alert(data.error || 'アップロードに失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました');
    } finally {
      setUploadingIcon(false);
    }
  };

  const handlePdfUpload = async (
    file: File,
    type: 'new' | 'edit' | 'article-new',
    docName: string
  ) => {
    if (!docName.trim()) {
      alert('PDF名を入力してください');
      return;
    }

    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/admin/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newDocument = { name: docName.trim(), url: data.pdfUrl };
        
        if (type === 'new') {
          setNewLink({ 
            ...newLink, 
            documents: [...newLink.documents, newDocument]
          });
        } else if (type === 'article-new') {
          setNewArticle({
            ...newArticle,
            documents: [...newArticle.documents, newDocument]
          });
        } else {
          setEditingLink({ 
            ...editingLink, 
            documents: [...(editingLink.documents || []), newDocument]
          });
        }
        alert(`PDFをアップロードしました: ${docName}`);
      } else {
        const data = await response.json();
        console.error('Upload failed:', { status: response.status, data });
        alert(data.error || 'アップロードに失敗しました');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">管理者画面</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                ダッシュボード
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タブ */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('articles')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'articles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              記事管理
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ユーザー管理
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'links'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              アクセスリンク管理
            </button>
            <button
              onClick={() => setActiveTab('login-history')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'login-history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ログイン履歴
            </button>
          </nav>
        </div>

        {/* 記事管理 */}
        {activeTab === 'articles' && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">記事一覧</h2>
              <button
                onClick={() => setShowArticleForm(!showArticleForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {showArticleForm ? 'キャンセル' : '新規記事追加'}
              </button>
            </div>

            {showArticleForm && (
              <form onSubmit={handleAddArticle} className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                    <input
                      type="text"
                      required
                      value={newArticle.title}
                      onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                    <textarea
                      required
                      rows={6}
                      value={newArticle.content}
                      onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">投稿者</label>
                    <input
                      type="text"
                      required
                      value={newArticle.author}
                      onChange={(e) => setNewArticle({ ...newArticle, author: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  {/* 複数PDF管理 */}
                  <div className="p-4 bg-white border border-gray-300 rounded-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">添付PDF（複数可能）</label>
                    
                    {/* 既存PDFリスト */}
                    {newArticle.documents && newArticle.documents.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {newArticle.documents.map((doc: any, index: number) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                            <div className="flex-1">
                              <span className="text-sm font-medium">{doc.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newDocs = newArticle.documents.filter((_: any, i: number) => i !== index);
                                setNewArticle({ ...newArticle, documents: newDocs });
                              }}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              削除
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* 新規PDF追加 */}
                    <NewPdfUploader
                      onUpload={(docName, file) => handlePdfUpload(file, 'article-new', docName)}
                      uploading={uploadingPdf}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    追加
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{article.title}</h3>
                    <button
                      onClick={() => handleDeleteArticle(article.id)}
                      className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                    >
                      削除
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap mb-2">{article.content}</p>
                  <div className="text-xs text-gray-500">
                    投稿者: {article.author} | 作成日: {new Date(article.created_at).toLocaleString('ja-JP')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ユーザー管理 */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-xl font-semibold text-gray-900">ユーザー一覧</h2>
              <div className="flex gap-2 flex-wrap">
                <label className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer">
                  CSV一括登録
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleResetUsers}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  年度更新
                </button>
                <button
                  onClick={() => setShowUserForm(!showUserForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {showUserForm ? 'キャンセル' : '新規ユーザー追加'}
                </button>
              </div>
            </div>

            {/* CSV一括登録の結果表示 */}
            {bulkImportResult && (
              <div className="mb-6 p-6 bg-white rounded-lg border-2 border-blue-500 shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">一括登録結果</h3>
                  <button
                    onClick={() => setBulkImportResult(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm text-green-600 font-medium">成功</div>
                    <div className="text-3xl font-bold text-green-700">{bulkImportResult.success}件</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-sm text-red-600 font-medium">失敗</div>
                    <div className="text-3xl font-bold text-red-700">{bulkImportResult.failed}件</div>
                  </div>
                </div>

                {bulkImportResult.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">エラー詳細:</h4>
                    <div className="max-h-60 overflow-y-auto bg-gray-50 rounded p-3 border border-gray-200">
                      {bulkImportResult.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 py-1 border-b border-gray-200 last:border-0">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showUserForm && (
              <form onSubmit={handleAddUser} className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ログインID</label>
                    <input
                      type="text"
                      required
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                    <input
                      type="password"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
                    <input
                      type="text"
                      required
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    追加
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ログインID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">氏名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">作成日</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.username !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            削除
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* アクセスリンク管理 */}
        {activeTab === 'links' && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">アクセスリンク一覧</h2>
              <button
                onClick={() => setShowLinkForm(!showLinkForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {showLinkForm ? 'キャンセル' : '新規リンク追加'}
              </button>
            </div>

            {showLinkForm && (
              <form onSubmit={handleAddLink} className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                    <input
                      type="text"
                      required
                      value={newLink.title}
                      onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="例: Instagram"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                    <textarea
                      required
                      value={newLink.description}
                      onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="例: 学校公式Instagram&#10;担任: 山田太郎"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PDF または URL</label>
                    <input
                      type="text"
                      required
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                      placeholder="例: tel:0123456789 または https://..."
                    />
                    
                    {/* 複数PDF管理 */}
                    <div className="mt-3 p-3 bg-white border border-gray-300 rounded-md">
                      <label className="block text-sm font-medium text-gray-700 mb-2">添付PDF（複数可能）</label>
                      
                      {/* 既存PDFリスト */}
                      {newLink.documents && newLink.documents.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {newLink.documents.map((doc: any, index: number) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                              <div className="flex-1">
                                <span className="text-sm font-medium">{doc.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newDocs = newLink.documents.filter((_: any, i: number) => i !== index);
                                  setNewLink({ ...newLink, documents: newDocs });
                                }}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                削除
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* 新規PDF追加 */}
                      <NewPdfUploader
                        onUpload={(docName, file) => handlePdfUpload(file, 'new', docName)}
                        uploading={uploadingPdf}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリー</label>
                    <select
                      value={newLink.category}
                      onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">表示タイプ</label>
                    <select
                      value={newLink.displayType}
                      onChange={(e) => setNewLink({ ...newLink, displayType: e.target.value as 'card' | 'icon' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="card">通常カード</option>
                      <option value="icon">アイコンのみ</option>
                    </select>
                  </div>
                  {newLink.displayType === 'icon' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        アイコン画像 (PNG, JPG, GIF, SVG - 5MB以下)
                      </label>
                      {newLink.iconUrl && (
                        <div className="mb-2">
                          <img src={newLink.iconUrl} alt="Icon Preview" className="w-16 h-16 object-cover rounded" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleIconUpload(file, 'new');
                        }}
                        disabled={uploadingIcon}
                        className="w-full text-sm"
                      />
                      {uploadingIcon && <p className="text-xs text-blue-600 mt-1">アップロード中...</p>}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={uploadingIcon}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    追加
                  </button>
                </div>
              </form>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={links.map((link) => link.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {links.map((link) => (
                    <SortableItem 
                      key={link.id} 
                      link={link}
                      editingLink={editingLink}
                      setEditingLink={setEditingLink}
                      handleUpdateLink={handleUpdateLink}
                      handleDeleteLink={handleDeleteLink}
                      handleIconUpload={handleIconUpload}
                      handlePdfUpload={handlePdfUpload}
                      uploadingIcon={uploadingIcon}
                      uploadingPdf={uploadingPdf}
                      categories={categories}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {links.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                アクセスリンクがありません。新規追加してください。
              </div>
            )}
          </div>
        )}

        {/* ログイン履歴 */}
        {activeTab === 'login-history' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">ログイン履歴</h2>
                <button
                  onClick={downloadLoginHistoryCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  CSVダウンロード
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ログイン日時
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        学生名（保護者名）
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ユーザー名
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loginHistory.length > 0 ? (
                      loginHistory.map((history, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(history.login_time).toLocaleString('ja-JP', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {history.users?.full_name || history.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {history.username}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          ログイン履歴がありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {loginHistory.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-600">
                    合計 <span className="font-semibold">{loginHistory.length}</span> 件のログイン履歴
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
