'use client';

import { useState } from 'react';
import { TOOLS, CATEGORIES, Tool } from '@/lib/constants/tools';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ToolsGalleryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTools = TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tools Gallery</h1>
            <p className="text-muted-foreground">
              Browse and access specialized tools for your data science workflow.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/setup/tools">
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Manage Environment
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <Card key={tool.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-primary/10 ${tool.iconColor || 'text-primary'}`}>
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                      {tool.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{tool.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {tool.version && (
                      <Badge variant="outline" className="text-[10px]">
                        v{tool.version}
                      </Badge>
                    )}
                    {tool.environmentType && (
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {tool.environmentType}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href={`/dashboard/tools/${tool.id}`} className="w-full">
                    <Button className="w-full group">
                      Open Tool
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl">
              <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-medium">No tools found</h3>
              <p className="text-muted-foreground max-w-xs">
                Try adjusting your search or category filter to find what you're looking for.
              </p>
              <Button 
                variant="link" 
                onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
                className="mt-2"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
