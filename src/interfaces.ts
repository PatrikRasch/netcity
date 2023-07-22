export interface userIdProp {
  userId: string;
  setUserId: (value: string) => void;
}

export interface PostData {
  id?: string;
  firstName: string;
  lastName: string;
  text: string;
  date: string;
  likes: number;
  dislikes: number;
  comments: number;
}

export interface postProp {
  firstName: string;
  lastName: string;
  postText: string;
  postDate: string;
  postNumOfLikes: number;
  postNumOfDislikes: number;
  postNumOfComments: number;
}

export interface FirstNameProp {
  firstName: string;
}

export interface LastNameProp {
  lastName: string;
}

export interface PostsProp {
  posts: PostData[];
}

export interface GetAllDocs {
  getAllDocs: () => Promise<void>;
}
