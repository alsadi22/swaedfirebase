'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Heart, 
  MessageSquare, 
  Eye, 
  Flag,
  MoreVertical,
  Pin,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  getForumPostById,
  getForumComments,
  addForumComment,
  likeForumPost,
  unlikeForumPost,
  likeForumComment,
  unlikeForumComment,
  incrementPostViews,
} from '@/lib/services/forums';
import type { ForumPost, ForumComment } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export default function ForumPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { locale } = useLanguage();
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments();
    // Increment views
    if (params.id) {
      incrementPostViews(params.id);
    }
  }, [params.id]);

  const loadPost = async () => {
    try {
      const fetchedPost = await getForumPostById(params.id);
      setPost(fetchedPost);
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const fetchedComments = await getForumComments(params.id);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleLikePost = async () => {
    if (!user || !post) return;

    try {
      const isLiked = post.likes?.includes(user.uid);
      if (isLiked) {
        await unlikeForumPost(post.id, user.uid);
      } else {
        await likeForumPost(post.id, user.uid);
      }
      await loadPost();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;

    try {
      const comment = comments.find(c => c.id === commentId);
      const isLiked = comment?.likes?.includes(user.uid);
      
      if (isLiked) {
        await unlikeForumComment(commentId, user.uid);
      } else {
        await likeForumComment(commentId, user.uid);
      }
      await loadComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    try {
      setSubmitting(true);
      await addForumComment(
        params.id,
        user.uid,
        user.displayName || 'Anonymous',
        user.role || 'VOLUNTEER',
        commentText,
        user.photoURL || undefined
      );
      setCommentText('');
      await loadComments();
      await loadPost(); // Refresh to update comment count
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: any) => {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: locale === 'ar' ? ar : enUS,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <p className="text-center text-gray-600">{t(locale, 'common.loading')}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <p className="text-center text-gray-600">Post not found</p>
      </div>
    );
  }

  const title = locale === 'ar' && post.titleAr ? post.titleAr : post.title;
  const content = locale === 'ar' && post.contentAr ? post.contentAr : post.content;
  const isLiked = post.likes?.includes(user?.uid || '');

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t(locale, 'common.back')}
      </Button>

      {/* Post Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Post Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <span className="text-[#D4AF37] font-semibold text-lg">
                  {post.authorName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{post.authorName}</p>
                <p className="text-sm text-gray-600">{formatDate(post.createdAt)}</p>
              </div>
            </div>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Flag className="mr-2 h-4 w-4" />
                    {t(locale, 'forums.report')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Title and Badges */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              {post.pinned && (
                <Pin className="h-4 w-4 text-[#D4AF37]" />
              )}
              {post.locked && (
                <Lock className="h-4 w-4 text-gray-400" />
              )}
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
          </div>

          {/* Post Actions */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              variant={isLiked ? 'default' : 'outline'}
              size="sm"
              onClick={handleLikePost}
              className={isLiked ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {post.likes?.length || 0}
            </Button>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentsCount} {t(locale, 'forums.replies')}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Eye className="h-4 w-4" />
              <span>{post.views} {t(locale, 'forums.views')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          {t(locale, 'forums.replies')} ({comments.length})
        </h2>

        {/* Comment Form */}
        {user && !post.locked && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <form onSubmit={handleSubmitComment}>
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t(locale, 'forums.comment')}
                  rows={3}
                  className="mb-3"
                />
                <Button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="bg-[#D4AF37] hover:bg-[#B8941F]"
                >
                  {submitting ? t(locale, 'common.loading') : t(locale, 'forums.reply')}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => {
            const commentContent = locale === 'ar' && comment.contentAr ? comment.contentAr : comment.content;
            const commentLiked = comment.likes?.includes(user?.uid || '');

            return (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 font-semibold">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{comment.authorName}</p>
                          <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                        </div>
                        
                        {user && (
                          <Button variant="ghost" size="icon">
                            <Flag className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <p className="mt-2 text-gray-700 whitespace-pre-wrap">{commentContent}</p>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikeComment(comment.id)}
                        className="mt-2"
                      >
                        <Heart className={`mr-1 h-3 w-3 ${commentLiked ? 'fill-current text-red-500' : ''}`} />
                        {comment.likes?.length || 0}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
