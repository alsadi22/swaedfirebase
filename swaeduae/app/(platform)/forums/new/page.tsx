'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Tag, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import { createForumPost } from '@/lib/services/forums';
import type { ForumCategory } from '@/types';

export default function NewForumPostPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    content: '',
    contentAr: '',
    category: 'GENERAL' as ForumCategory,
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const categories: { value: ForumCategory; label: string }[] = [
    { value: 'GENERAL', label: t(locale, 'forums.general') },
    { value: 'EVENTS', label: t(locale, 'forums.events') },
    { value: 'VOLUNTEERING_TIPS', label: t(locale, 'forums.volunteering') },
    { value: 'ORGANIZATIONS', label: t(locale, 'forums.organizations') },
    { value: 'ANNOUNCEMENTS', label: t(locale, 'forums.announcements') },
    { value: 'QUESTIONS', label: t(locale, 'forums.questions') },
    { value: 'SUCCESS_STORIES', label: t(locale, 'forums.success') },
  ];

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setLoading(true);

      const postId = await createForumPost(
        user.uid,
        user.displayName || 'Anonymous',
        user.role || 'VOLUNTEER',
        {
          title: formData.title,
          titleAr: formData.titleAr || undefined,
          content: formData.content,
          contentAr: formData.contentAr || undefined,
          category: formData.category,
          tags: formData.tags,
          authorProfilePicture: user.photoURL || undefined,
        }
      );

      router.push(`/forums/${postId}`);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t(locale, 'common.back')}
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {t(locale, 'forums.createPost')}
        </h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t(locale, 'forums.newPost')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t(locale, 'forums.category')} *
              </label>
              <Select
                value={formData.category}
                onValueChange={(value: ForumCategory) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
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
            </div>

            {/* Title (English) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t(locale, 'forums.postTitle')} (English) *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="What's on your mind?"
                required
              />
            </div>

            {/* Title (Arabic) - Optional */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t(locale, 'forums.postTitle')} (العربية)
              </label>
              <Input
                value={formData.titleAr}
                onChange={(e) =>
                  setFormData({ ...formData, titleAr: e.target.value })
                }
                placeholder="ما الذي تفكر فيه؟"
                dir="rtl"
              />
            </div>

            {/* Content (English) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t(locale, 'forums.postContent')} (English) *
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Share your thoughts, questions, or experiences..."
                rows={8}
                required
              />
            </div>

            {/* Content (Arabic) - Optional */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t(locale, 'forums.postContent')} (العربية)
              </label>
              <Textarea
                value={formData.contentAr}
                onChange={(e) =>
                  setFormData({ ...formData, contentAr: e.target.value })
                }
                placeholder="شارك أفكارك أو أسئلتك أو تجاربك..."
                rows={8}
                dir="rtl"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t(locale, 'forums.tags')}
              </label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder={t(locale, 'forums.addTag')}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading || !formData.title || !formData.content}
                className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F]"
              >
                {loading ? t(locale, 'common.loading') : t(locale, 'common.submit')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                {t(locale, 'common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
