export type NewsItemContent = {
  body: string;
  author?: string | null;
  summary?: string | null;
  category?: string | null;
  keywords?: string[] | null;
};

export type NewsItem = {
  id: string;
  title: string;
  publicationDate: string;
  content: NewsItemContent;
};

export type GetStiriResponse = {
  getStiri: {
    stiri: NewsItem[];
    pagination: {
      totalCount: number;
      currentPage: number;
      totalPages: number;
    };
  };
};


