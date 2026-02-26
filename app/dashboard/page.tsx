'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  documents?: { name: string; url: string }[];
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({
    '共通': true,
    '1年': false,
    '2年': false,
    '3年': false,
  });
  const [openSubCategories, setOpenSubCategories] = useState<{ [key: string]: boolean }>({});
  const [expandedArticles, setExpandedArticles] = useState<{ [key: number]: boolean }>({});
  
  // メール登録フォーム用
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({
    studentName: '',
    email: '',
    grade: ''
  });

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleSubCategory = (subCategory: string) => {
    setOpenSubCategories(prev => ({
      ...prev,
      [subCategory]: !prev[subCategory]
    }));
  };

  const toggleArticle = (articleId: number) => {
    setExpandedArticles(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  const isNewArticle = (createdAt: string) => {
    const articleDate = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - articleDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7; // 7日以内なら新着
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();

      if (data.authenticated) {
        setUser(data.user);
        fetchArticles();
        fetchLinks();
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
      const response = await fetch('/api/articles?limit=5');
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Articles fetch error:', error);
    }
  };

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links');
      const data = await response.json();
      setLinks(data.links || []);
    } catch (error) {
      console.error('Links fetch error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailForm.studentName || !emailForm.email || !emailForm.grade) {
      alert('全ての項目を入力してください');
      return;
    }

    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: emailForm.studentName,
          email: emailForm.email,
          grade: emailForm.grade
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('メールアドレスを登録しました！\n更新情報をお送りします。');
        setEmailForm({ studentName: '', email: '', grade: '' });
        setShowEmailForm(false);
      } else {
        alert(data.error || '登録に失敗しました');
      }
    } catch (error) {
      console.error('Email registration error:', error);
      alert('登録に失敗しました');
    }
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
            <h1 className="text-2xl font-bold text-gray-900">保護者ポータル</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                ようこそ、<span className="font-semibold">{user?.fullName}</span> 様
              </span>
              {user?.username === 'admin' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  管理者画面
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* お知らせ・更新情報 */}
        <div className="mb-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">お知らせ・更新情報</h2>
              <button
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                更新通知を受け取る
              </button>
            </div>

            {/* メール登録フォーム */}
            {showEmailForm && (
              <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      お子様のお名前
                    </label>
                    <input
                      type="text"
                      value={emailForm.studentName}
                      onChange={(e) => setEmailForm({ ...emailForm, studentName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="山田 太郎"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="example@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      学年
                    </label>
                    <select
                      value={emailForm.grade}
                      onChange={(e) => setEmailForm({ ...emailForm, grade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">選択してください</option>
                      <option value="1年">1年</option>
                      <option value="2年">2年</option>
                      <option value="3年">3年</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                    >
                      登録する
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="divide-y divide-gray-200">
              {articles.length > 0 ? (
                articles.map((article) => {
                  const isExpanded = expandedArticles[article.id];
                  const isNew = isNewArticle(article.created_at);
                  
                  return (
                    <div key={article.id} className="hover:bg-gray-50 transition-colors">
                      {/* タイトル部分（常に表示・クリック可能） */}
                      <button
                        onClick={() => toggleArticle(article.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-900 truncate">{article.title}</h3>
                          {isNew && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-sm animate-pulse">
                              ✨ New
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs text-gray-500">
                            {new Date(article.created_at).toLocaleDateString('ja-JP')}
                          </span>
                          <span className="text-gray-400">
                            {isExpanded ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </span>
                        </div>
                      </button>

                      {/* 展開時のコンテンツ */}
                      {isExpanded && (
                        <div className="px-6 pb-4 space-y-2">
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{article.content}</p>
                          <p className="text-xs text-gray-500">投稿者: {article.author}</p>
                          
                          {/* 添付PDF表示 */}
                          {article.documents && article.documents.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {article.documents.map((doc: any, index: number) => (
                                <a
                                  key={index}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {doc.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  現在、お知らせはありません
                </div>
              )}
            </div>
          </div>
        </div>

        {/* アクセスリンク */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">アクセスリンク</h2>
            </div>
            <div className="p-6 space-y-8">
              {links.length > 0 ? (
                <>
                  {/* カテゴリー別に表示 */}
                  {['共通', '1年', '2年', '3年'].map((mainCategory) => {
                    // メインカテゴリーのリンク（「共通」または「1年」「2年」「3年」のみ）
                    const directLinks = links.filter((link) => (link.category || '共通') === mainCategory);
                    
                    // サブカテゴリーのリンク（「1年-A」など）
                    const subCategoryLinks = links.filter((link) => 
                      (link.category || '').startsWith(mainCategory + '-')
                    );
                    
                    // サブカテゴリー一覧を取得
                    const subCategories = [...new Set(
                      subCategoryLinks.map(link => link.category)
                    )].sort();
                    
                    if (directLinks.length === 0 && subCategories.length === 0) return null;

                    // カテゴリーごとの色設定
                    const categoryColor = 
                      mainCategory === '共通' ? 'bg-green-600' :
                      mainCategory === '1年' ? 'bg-red-600' :
                      mainCategory === '2年' ? 'bg-blue-600' :
                      'bg-yellow-500'; // 3年

                    const isOpen = openCategories[mainCategory];

                    const renderLinks = (categoryLinks: any[]) => {
                      const cardLinks = categoryLinks.filter((link) => link.displayType !== 'icon');
                      const iconLinks = categoryLinks.filter((link) => link.displayType === 'icon');

                      return (
                        <div className="space-y-4">
                          {cardLinks.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {cardLinks.map((link) => {
                                const hasDocuments = link.documents && link.documents.length > 0;
                                
                                if (hasDocuments) {
                                  // 複数PDFがある場合
                                  return (
                                    <div
                                      key={link.id}
                                      className="block p-4 border border-gray-200 rounded-lg"
                                    >
                                      <h4 className="font-medium text-gray-900">{link.title}</h4>
                                      <p className="text-sm text-gray-600 mt-1 mb-3 whitespace-pre-wrap">{link.description}</p>
                                      <div className="space-y-2">
                                        {link.documents.map((doc: any, index: number) => (
                                          <a
                                            key={index}
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block px-3 py-2 text-sm text-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                          >
                                            {doc.name}
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                } else {
                                  // 通常のURLリンク
                                  return (
                                    <a
                                      key={link.id}
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                                    >
                                      <h4 className="font-medium text-gray-900">{link.title}</h4>
                                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{link.description}</p>
                                    </a>
                                  );
                                }
                              })}
                            </div>
                          )}
                          
                          {iconLinks.length > 0 && (
                            <div>
                              {cardLinks.length > 0 && (
                                <h4 className="text-sm font-medium text-gray-700 mb-3">SNS・外部リンク</h4>
                              )}
                              <div className="flex flex-wrap gap-3">
                                {iconLinks.map((link) => (
                                  <a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-col items-center gap-2"
                                    title={link.description}
                                  >
                                    {link.iconUrl ? (
                                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-500 transition-all">
                                        <img
                                          src={link.iconUrl}
                                          alt={link.title}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 group-hover:border-blue-500 transition-all">
                                        <span className="text-xs font-medium text-gray-600">
                                          {link.title.charAt(0)}
                                        </span>
                                      </div>
                                    )}
                                    <span className="text-xs text-gray-600 group-hover:text-blue-600 text-center max-w-[80px] truncate">
                                      {link.title}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    };

                    return (
                      <div key={mainCategory} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                        {/* メインカテゴリータイトル（クリック可能） */}
                        <button
                          onClick={() => toggleCategory(mainCategory)}
                          className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
                        >
                          <div className={`h-8 w-1 ${categoryColor} rounded`}></div>
                          <h3 className="text-lg font-semibold text-gray-900">{mainCategory}</h3>
                          <span className="ml-auto text-gray-500">
                            {isOpen ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </span>
                        </button>

                        {/* コンテンツ（開閉可能） */}
                        {isOpen && (
                          <div className="space-y-4 ml-4">
                            {/* 直接このカテゴリーに属するリンク */}
                            {directLinks.length > 0 && renderLinks(directLinks)}
                            
                            {/* サブカテゴリー（クラス）*/}
                            {subCategories.map((subCategory) => {
                              const subLinks = links.filter(link => link.category === subCategory);
                              const isSubOpen = openSubCategories[subCategory];
                              const className = subCategory.split('-')[1]; // 例: "1年-A" → "A"
                              
                              return (
                                <div key={subCategory} className="border-l-2 border-gray-200 pl-4">
                                  <button
                                    onClick={() => toggleSubCategory(subCategory)}
                                    className="flex items-center gap-2 mb-3 w-full hover:opacity-80 transition-opacity"
                                  >
                                    <h4 className="text-base font-medium text-gray-800">{className}クラス</h4>
                                    <span className="text-gray-400">
                                      {isSubOpen ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                      ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      )}
                                    </span>
                                  </button>
                                  
                                  {isSubOpen && renderLinks(subLinks)}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  アクセスリンクはまだ設定されていません
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
