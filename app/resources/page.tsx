'use client'

import React from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Download, ExternalLink, FileText, Video, Users } from 'lucide-react'

export default function ResourcesPage() {
  const resources = [
    {
      id: 1,
      title: 'Volunteer Handbook',
      description: 'Complete guide for volunteers including best practices, safety guidelines, and event procedures.',
      type: 'PDF',
      icon: BookOpen,
      downloadUrl: '/downloads/volunteer-handbook.pdf',
      category: 'Guides'
    },
    {
      id: 2,
      title: 'Event Planning Toolkit',
      description: 'Resources for organizations to plan and execute successful volunteer events.',
      type: 'PDF',
      icon: FileText,
      downloadUrl: '/downloads/event-planning-toolkit.pdf',
      category: 'Planning'
    },
    {
      id: 3,
      title: 'Safety Training Videos',
      description: 'Essential safety training materials for all volunteer activities.',
      type: 'Video',
      icon: Video,
      downloadUrl: '/resources/safety-training',
      category: 'Training'
    },
    {
      id: 4,
      title: 'Community Impact Report 2024',
      description: 'Annual report showcasing the collective impact of our volunteer community.',
      type: 'PDF',
      icon: Users,
      downloadUrl: '/downloads/impact-report-2024.pdf',
      category: 'Reports'
    }
  ]

  const categories = ['All', 'Guides', 'Planning', 'Training', 'Reports']
  const [selectedCategory, setSelectedCategory] = React.useState('All')

  const filteredResources = selectedCategory === 'All' 
    ? resources 
    : resources.filter(resource => resource.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Resources & Downloads
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access helpful guides, training materials, and tools to enhance your volunteering experience
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'primary' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="mb-2"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredResources.map((resource) => {
              const IconComponent = resource.icon
              return (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {resource.type}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{resource.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 font-medium">
                        {resource.category}
                      </span>
                      <Button size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Additional Resources Section */}
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ExternalLink className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">UAE Government Resources</h3>
                  <p className="text-gray-600 mb-3">
                    Official government resources and guidelines for volunteering in the UAE.
                  </p>
                  <Button variant="outline" size="sm">
                    Visit Portal
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Community Forum</h3>
                  <p className="text-gray-600 mb-3">
                    Connect with other volunteers, share experiences, and get support.
                  </p>
                  <Button variant="outline" size="sm">
                    Join Forum
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="text-center mt-12 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Button>
              Contact Support
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}