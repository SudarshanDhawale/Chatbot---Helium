/**
 * News page - displays trending global news
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { StorageService } from '@/lib/storage-client';
import { ChatService } from '@/lib/chat-service';
import { StreamService } from '@/lib/stream-service';
import type { ThreadSummary } from '@/types/thread';
import type { StreamEvent } from '@/types/stream';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  url?: string;
}

export default function NewsPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);

  // Load user and threads
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const defaultEmail = 'smdhawale77@gmail.com';
        const user = await StorageService.getOrCreateUser(defaultEmail);
        setCurrentUser(user);

        const storageThreads = await StorageService.getUserThreads(user.id);
        const threadSummaries: ThreadSummary[] = storageThreads.map(thread => ({
          threadId: thread.thread_id,
          projectId: thread.project_id,
          title: thread.title,
          lastMessage: '',
          lastUpdated: new Date(thread.last_message_at),
          messageCount: thread.message_count,
        }));
        setThreads(threadSummaries);
      } catch (error) {
        console.error('Error initializing user:', error);
        setCurrentUser({ id: 'temp', email: 'user@example.com' });
      }
    };

    initializeUser();
  }, []);

  // Fetch news using AI agent
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        // Hardcoded prompt for fetching news
        const newsPrompt = `Please provide the top 10 most recent trending news stories from around the globe. For each news story, include:
1. A clear, concise title
2. A brief description (2-3 sentences)
3. The source/publication name
4. The publication date
5. If available, mention if there's an associated image

Format the response as a JSON array with objects containing: title, description, source, publishedAt, and hasImage (boolean).`;

        // Create a task to fetch news
        const taskResponse = await ChatService.createTask(newsPrompt);
        const { threadId, projectId } = taskResponse;

        let accumulatedContent = '';

        // Stream the response
        await new Promise<void>((resolve, reject) => {
          StreamService.streamTaskResults(
            threadId,
            projectId,
            {
              timeout: 300,
              includeFileContent: false,
              onEvent: (event: StreamEvent) => {
                if (event.type === 'assistant' && event.content) {
                  try {
                    const parsed = JSON.parse(event.content);
                    if (parsed?.content) {
                      accumulatedContent += parsed.content;
                    }
                  } catch {
                    const trimmed = event.content.trim();
                    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
                      accumulatedContent += event.content;
                    }
                  }
                } else if (event.type === 'complete') {
                  resolve();
                } else if (event.type === 'error') {
                  reject(new Error(event.error || 'Stream error'));
                }
              },
              onError: (error: Error) => reject(error),
              onComplete: () => resolve(),
            }
          );
        });

        // Parse the news from the response
        const parsedNews = parseNewsFromResponse(accumulatedContent);
        setNews(parsedNews);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Parse news articles from AI response
  const parseNewsFromResponse = (content: string): NewsArticle[] => {
    try {
      // Try to extract JSON array from the content
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const newsArray = JSON.parse(jsonMatch[0]);
        return newsArray.map((item: any, index: number) => ({
          id: `news-${index}`,
          title: item.title || 'Untitled',
          description: item.description || '',
          imageUrl: item.hasImage ? `/api/placeholder-news-${index % 5}.jpg` : undefined,
          source: item.source || 'Unknown Source',
          publishedAt: item.publishedAt || new Date().toISOString(),
          url: item.url,
        }));
      }

      // Fallback: parse manually if JSON extraction fails
      const articles: NewsArticle[] = [];
      const lines = content.split('\n');
      let currentArticle: Partial<NewsArticle> = {};
      let articleIndex = 0;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^\d+\./)) {
          if (currentArticle.title) {
            articles.push({
              id: `news-${articleIndex++}`,
              title: currentArticle.title || 'Untitled',
              description: currentArticle.description || '',
              source: currentArticle.source || 'Unknown Source',
              publishedAt: currentArticle.publishedAt || new Date().toISOString(),
              imageUrl: currentArticle.imageUrl,
            });
          }
          currentArticle = { title: trimmed.replace(/^\d+\.\s*/, '') };
        } else if (trimmed.toLowerCase().startsWith('source:')) {
          currentArticle.source = trimmed.replace(/^source:\s*/i, '');
        } else if (trimmed.toLowerCase().startsWith('published:')) {
          currentArticle.publishedAt = trimmed.replace(/^published:\s*/i, '');
        } else if (trimmed && currentArticle.title && !currentArticle.description) {
          currentArticle.description = trimmed;
        }
      }

      if (currentArticle.title) {
        articles.push({
          id: `news-${articleIndex}`,
          title: currentArticle.title || 'Untitled',
          description: currentArticle.description || '',
          source: currentArticle.source || 'Unknown Source',
          publishedAt: currentArticle.publishedAt || new Date().toISOString(),
          imageUrl: currentArticle.imageUrl,
        });
      }

      return articles;
    } catch (err) {
      console.error('Error parsing news:', err);
      return [];
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar threads={threads} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Trending News</h1>
            <p className="text-gray-600">Latest stories from around the globe</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading latest news...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <svg
                className="w-12 h-12 text-red-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* News Grid */}
          {!loading && !error && news.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Image */}
                  {article.imageUrl && (
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-white opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="font-medium">{article.source}</span>
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && news.length === 0 && (
            <div className="text-center py-20">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <p className="text-gray-600">No news articles available at the moment.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
