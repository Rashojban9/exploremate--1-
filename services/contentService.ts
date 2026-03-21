import { get, put } from './http';

export interface PageContent {
  slug: string;
  title: string;
  contentBlocks: Record<string, string>;
  status: 'Published' | 'Draft';
  updatedAt: string;
}

export const contentService = {
  // Public endpoint
  getPageBySlug: async (slug: string): Promise<PageContent | null> => {
    try {
      return await get<PageContent>(`/api/content/pages/${slug}`, false);
    } catch (error) {
      console.warn(`Failed to fetch content for page ${slug}`, error);
      return null;
    }
  },

  // Admin endpoints
  getAllPages: async (): Promise<PageContent[]> => {
    return await get<PageContent[]>('/api/content/admin/pages', true);
  },

  updatePageContent: async (slug: string, data: Partial<PageContent>): Promise<PageContent> => {
    return await put<PageContent>(`/api/content/admin/pages/${slug}`, data, true);
  }
};
