export interface Post {
  _id: string;
  _createdAt: string;
  title: string;
  author: {
    name: string;
    image: string;
  };
  comments: Comment[];
  description: string;
  mainImage: {
    asset: {
      url: string;
    };
  };
  slug: {
    current: string;
  };
  body: any;
}

export interface Comment {
  _id: string;
  _createdAt: string;
  name: string;
  email: string;
  comment: string;
  post: {
    _id: string;
  };
}
