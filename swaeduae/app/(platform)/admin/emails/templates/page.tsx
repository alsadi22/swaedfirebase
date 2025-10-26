'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { translations } from '@/lib/i18n/translations';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { EmailTemplate } from '@/lib/services/emailAnalytics';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Plus, Edit, Trash2, Eye, Save, X } from 'lucide-react';

export default function EmailTemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language, dir } = useLanguage();
  const t = translations[language];

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectAr, setSubjectAr] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [htmlContentAr, setHtmlContentAr] = useState('');
  const [category, setCategory] = useState<'TRANSACTIONAL' | 'NOTIFICATION' | 'MARKETING' | 'SYSTEM'>('TRANSACTIONAL');
  const [active, setActive] = useState(true);
  const [variables, setVariables] = useState('');

  // Role check
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/unauthorized');
    }
  }, [user, router]);

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesRef = collection(db, 'emailTemplates');
      const snapshot = await getDocs(templatesRef);
      const templatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as EmailTemplate[];
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setNameAr('');
    setSlug('');
    setSubject('');
    setSubjectAr('');
    setHtmlContent('');
    setHtmlContentAr('');
    setCategory('TRANSACTIONAL');
    setActive(true);
    setVariables('');
    setEditingTemplate(null);
  };

  const handleNew = () => {
    resetForm();
    setShowEditor(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setName(template.name);
    setNameAr(template.nameAr || '');
    setSlug(template.slug);
    setSubject(template.subject);
    setSubjectAr(template.subjectAr || '');
    setHtmlContent(template.htmlContent);
    setHtmlContentAr(template.htmlContentAr || '');
    setCategory(template.category);
    setActive(template.active);
    setVariables(template.variables.join(', '));
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim() || !subject.trim() || !htmlContent.trim()) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    if (!user) return;

    try {
      const templateData = {
        name,
        nameAr: nameAr || null,
        slug,
        subject,
        subjectAr: subjectAr || null,
        htmlContent,
        htmlContentAr: htmlContentAr || null,
        category,
        active,
        variables: variables.split(',').map(v => v.trim()).filter(v => v),
        updatedAt: serverTimestamp(),
        ...(editingTemplate ? {} : { createdAt: serverTimestamp(), createdBy: user.id }),
      };

      if (editingTemplate) {
        const templateRef = doc(db, 'emailTemplates', editingTemplate.id);
        await updateDoc(templateRef, templateData);
      } else {
        const templateRef = doc(collection(db, 'emailTemplates'));
        await setDoc(templateRef, templateData);
      }

      await loadTemplates();
      setShowEditor(false);
      resetForm();
      alert(language === 'ar' ? 'تم حفظ القالب بنجاح' : 'Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء حفظ القالب' : 'Error saving template');
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا القالب؟' : 'Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const templateRef = doc(db, 'emailTemplates', templateId);
      await deleteDoc(templateRef);
      await loadTemplates();
      alert(language === 'ar' ? 'تم حذف القالب بنجاح' : 'Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء حذف القالب' : 'Error deleting template');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir={dir}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                {editingTemplate 
                  ? (language === 'ar' ? 'تعديل القالب' : 'Edit Template')
                  : (language === 'ar' ? 'قالب جديد' : 'New Template')}
              </h1>
              <Button variant="ghost" onClick={() => { setShowEditor(false); resetForm(); }}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{language === 'ar' ? 'الاسم (إنجليزي) *' : 'Name (English) *'}</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                  <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{language === 'ar' ? 'المعرّف *' : 'Slug *'}</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="welcome-email" required />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'الفئة *' : 'Category *'}</Label>
                  <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRANSACTIONAL">Transactional</SelectItem>
                      <SelectItem value="NOTIFICATION">Notification</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="SYSTEM">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject Lines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{language === 'ar' ? 'الموضوع (إنجليزي) *' : 'Subject (English) *'}</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'الموضوع (عربي)' : 'Subject (Arabic)'}</Label>
                  <Input value={subjectAr} onChange={(e) => setSubjectAr(e.target.value)} dir="rtl" />
                </div>
              </div>

              {/* HTML Content */}
              <div>
                <Label>{language === 'ar' ? 'محتوى HTML (إنجليزي) *' : 'HTML Content (English) *'}</Label>
                <Textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={10}
                  placeholder="<html>...</html>"
                  required
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>{language === 'ar' ? 'محتوى HTML (عربي)' : 'HTML Content (Arabic)'}</Label>
                <Textarea
                  value={htmlContentAr}
                  onChange={(e) => setHtmlContentAr(e.target.value)}
                  rows={10}
                  placeholder="<html dir='rtl'>...</html>"
                  className="font-mono text-sm"
                  dir="rtl"
                />
              </div>

              {/* Variables */}
              <div>
                <Label>{language === 'ar' ? 'المتغيرات (مفصولة بفواصل)' : 'Variables (comma-separated)'}</Label>
                <Input
                  value={variables}
                  onChange={(e) => setVariables(e.target.value)}
                  placeholder="{{name}}, {{eventTitle}}, {{date}}"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {language === 'ar' 
                    ? 'استخدم {{variableName}} في المحتوى' 
                    : 'Use {{variableName}} in content'}
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === 'ar' ? 'تنشيط القالب' : 'Template Active'}</Label>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? 'يمكن استخدام القوالب النشطة فقط' : 'Only active templates can be used'}
                  </p>
                </div>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => { setShowEditor(false); resetForm(); }}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'حفظ القالب' : 'Save Template'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-8 h-8 text-emerald-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  {language === 'ar' ? 'قوالب البريد الإلكتروني' : 'Email Templates'}
                </h1>
              </div>
              <p className="text-gray-600">
                {language === 'ar' ? 'إدارة قوالب البريد الإلكتروني' : 'Manage email templates'}
              </p>
            </div>
            <Button onClick={handleNew} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'قالب جديد' : 'New Template'}
            </Button>
          </div>
        </div>

        {/* Templates List */}
        <div className="grid grid-cols-1 gap-4">
          {templates.length === 0 ? (
            <Card className="p-12 text-center">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {language === 'ar' ? 'لا توجد قوالب' : 'No templates found'}
              </p>
              <Button onClick={handleNew} variant="outline" className="mt-4">
                {language === 'ar' ? 'إنشاء القالب الأول' : 'Create First Template'}
              </Button>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {language === 'ar' && template.nameAr ? template.nameAr : template.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        template.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template.active 
                          ? (language === 'ar' ? 'نشط' : 'Active') 
                          : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>{language === 'ar' ? 'الموضوع:' : 'Subject:'}</strong>{' '}
                      {language === 'ar' && template.subjectAr ? template.subjectAr : template.subject}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>{language === 'ar' ? 'المعرّف:' : 'Slug:'}</strong> {template.slug}
                    </p>
                    {template.variables.length > 0 && (
                      <p className="text-sm text-gray-600">
                        <strong>{language === 'ar' ? 'المتغيرات:' : 'Variables:'}</strong> {template.variables.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                      <Edit className="w-4 h-4 mr-1" />
                      {language === 'ar' ? 'تعديل' : 'Edit'}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(template.id)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      {language === 'ar' ? 'حذف' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
