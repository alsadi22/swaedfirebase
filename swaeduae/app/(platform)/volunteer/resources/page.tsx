'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getAllResources, searchResources, incrementResourceViews, markResourceHelpful } from '@/lib/services/resources';
import type { Resource } from '@/types';
import { Book, Video, FileText, Search, ThumbsUp, Eye, Tag } from 'lucide-react';

export default function ResourcesPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<Resource['type'] | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchTerm, selectedType, selectedCategory, resources]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await getAllResources();
      setResources(data);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data.map(r => r.category)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    // Filter by search term
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(r => {
        const title = language === 'ar' ? r.titleAr : r.title;
        const description = language === 'ar' ? r.descriptionAr : r.description;
        return (
          title?.toLowerCase().includes(lower) ||
          description?.toLowerCase().includes(lower) ||
          r.tags.some(tag => tag.toLowerCase().includes(lower))
        );
      });
    }

    // Filter by type
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(r => r.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    setFilteredResources(filtered);
  };

  const handleViewResource = async (resource: Resource) => {
    try {
      await incrementResourceViews(resource.id);
      // Update local state
      setResources(prev =>
        prev.map(r => (r.id === resource.id ? { ...r, views: r.views + 1 } : r))
      );
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  const handleMarkHelpful = async (resourceId: string) => {
    try {
      await markResourceHelpful(resourceId);
      // Update local state
      setResources(prev =>
        prev.map(r => (r.id === resourceId ? { ...r, helpful: r.helpful + 1 } : r))
      );
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const getTypeIcon = (type: Resource['type']) => {
    const icons = {
      GUIDE: Book,
      FAQ: FileText,
      TUTORIAL: Video,
      DOCUMENT: FileText,
      VIDEO: Video,
    };
    return icons[type] || FileText;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'ar' ? 'مركز الموارد' : 'Resource Center'}
          </h1>
          <p className="mt-2 text-gray-600">
            {language === 'ar'
              ? 'أدلة ودروس وموارد لمساعدتك على النجاح'
              : 'Guides, tutorials, and resources to help you succeed'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
              <option value="GUIDE">{language === 'ar' ? 'أدلة' : 'Guides'}</option>
              <option value="TUTORIAL">{language === 'ar' ? 'دروس' : 'Tutorials'}</option>
              <option value="DOCUMENT">{language === 'ar' ? 'مستندات' : 'Documents'}</option>
              <option value="FAQ">{language === 'ar' ? 'الأسئلة الشائعة' : 'FAQs'}</option>
              <option value="VIDEO">{language === 'ar' ? 'فيديوهات' : 'Videos'}</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Featured Resources */}
        {filteredResources.filter(r => r.featured).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'ar' ? 'موارد مميزة' : 'Featured Resources'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources
                .filter(r => r.featured)
                .map(resource => {
                  const Icon = getTypeIcon(resource.type);
                  return (
                    <div
                      key={resource.id}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border-2 border-blue-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <Icon className="h-8 w-8 text-blue-600" />
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                          {language === 'ar' ? 'مميز' : 'Featured'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {language === 'ar' ? resource.titleAr : resource.title}
                      </h3>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {language === 'ar' ? resource.descriptionAr : resource.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {resource.views}
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {resource.helpful}
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewResource(resource)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {language === 'ar' ? 'عرض' : 'View'}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* All Resources */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'ar' ? 'جميع الموارد' : 'All Resources'}
          </h2>
          <div className="space-y-4">
            {filteredResources
              .filter(r => !r.featured)
              .map(resource => {
                const Icon = getTypeIcon(resource.type);
                return (
                  <div
                    key={resource.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {language === 'ar' ? resource.titleAr : resource.title}
                            </h3>
                            <p className="text-gray-600 mb-3">
                              {language === 'ar' ? resource.descriptionAr : resource.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {resource.category}
                              </span>
                              {resource.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                  <Tag className="h-3 w-3 inline mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {resource.views} {language === 'ar' ? 'مشاهدة' : 'views'}
                            </div>
                            <div className="flex items-center">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {resource.helpful} {language === 'ar' ? 'مفيد' : 'helpful'}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleMarkHelpful(resource.id)}
                              className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                            >
                              <ThumbsUp className="h-4 w-4 inline mr-1" />
                              {language === 'ar' ? 'مفيد' : 'Helpful'}
                            </button>
                            <button
                              onClick={() => handleViewResource(resource)}
                              className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              {language === 'ar' ? 'عرض' : 'View'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* No Results */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <Book className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {language === 'ar' ? 'لم يتم العثور على موارد' : 'No resources found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {language === 'ar'
                ? 'جرب تعديل معايير البحث الخاصة بك'
                : 'Try adjusting your search criteria'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
