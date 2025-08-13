export type NewsItem = {
  id: string;
  title: string;
  publicationDate: string;
  // Field returned as JSON from the API. Structure can vary per source.
  content: unknown;
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


