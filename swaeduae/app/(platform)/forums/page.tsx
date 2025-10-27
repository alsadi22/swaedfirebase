'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Eye, 
  Pin, 
  Lock, 
  Plus,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import { getForumPosts } from '@/lib/services/forums';
import type { ForumPost, ForumCategory } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export default function ForumsPage() {
  const { locale } = useLanguage();
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'mostLiked'>('recent');

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, sortBy]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const filters: any = {
        status: 'ACTIVE',
        sortBy,
        limit: 50,
      };

      if (selectedCategory !== 'ALL') {
        filters.category = selectedCategory;
      }

      const fetchedPosts = await getForumPosts(filters);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const title = locale === 'ar' && post.titleAr ? post.titleAr : post.title;
    const content = locale === 'ar' && post.contentAr ? post.contentAr : post.content;
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const categories: { value: ForumCategory | 'ALL'; label: string }[] = [
    { value: 'ALL', label: t(locale, 'common.all') },
    { value: 'GENERAL', label: t(locale, 'forums.general') },
    { value: 'EVENTS', label: t(locale, 'forums.events') },
    { value: 'VOLUNTEERING_TIPS', label: t(locale, 'forums.volunteering') },
    { value: 'ORGANIZATIONS', label: t(locale, 'forums.organizations') },
    { value: 'ANNOUNCEMENTS', label: t(locale, 'forums.announcements') },
    { value: 'QUESTIONS', label: t(locale, 'forums.questions') },
    { value: 'SUCCESS_STORIES', label: t(locale, 'forums.success') },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t(locale, 'forums.title')}
            </h1>
            <p className="mt-2 text-gray-600">
              {t(locale, 'nav.community')}
            </p>
          </div>
          <Link href="/forums/new">
            <Button className="bg-[#D4AF37] hover:bg-[#B8941F]">
              <Plus className="mr-2 h-4 w-4" />
              {t(locale, 'forums.createPost')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t(locale, 'common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">
                <Clock className="mr-2 inline h-4 w-4" />
                {t(locale, 'common.recent')}
              </SelectItem>
              <SelectItem value="popular">
                <TrendingUp className="mr-2 inline h-4 w-4" />
                {t(locale, 'events.popular')}
              </SelectItem>
              <SelectItem value="mostLiked">
                <Heart className="mr-2 inline h-4 w-4" />
                {t(locale, 'common.mostLiked')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t(locale, 'common.loading')}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">{t(locale, 'forums.noPostsYet')}</p>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: ForumPost }) {
  const { locale } = useLanguage();
  const title = locale === 'ar' && post.titleAr ? post.titleAr : post.title;
  const content = locale === 'ar' && post.contentAr ? post.contentAr : post.content;

  const formatDate = (date: any) => {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: locale === 'ar' ? ar : enUS,
    });
  };

  return (
    <Link href={`/forums/${post.id}`}>
      <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[#D4AF37] font-semibold">
              {post.authorName.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Title and Badges */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {post.pinned && (
                    <Pin className="h-4 w-4 text-[#D4AF37]" />
                  )}
                  {post.locked && (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-[#D4AF37]">
                    {title}
                  </h3>
                </div>
                
                {/* Content Preview */}
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {content}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Meta Info */}
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{post.authorName}</span>
                  <span>•</span>
                  <span>{formatDate(post.createdAt)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {post.commentsCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {post.likes?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
