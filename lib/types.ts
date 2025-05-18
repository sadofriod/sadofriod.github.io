
export type Metadata = {
  title: string;
  date: string;
  summary: string;
  image?: string;
  category?: string;
  categories?: string[];
};

export type BlogPost = {
  metadata: Metadata;
  slug: string;
  content: string;
};
