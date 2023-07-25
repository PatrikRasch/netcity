import firebase from "firebase/compat/app";

export interface userIdProp {
  userId: string;
  setUserId: (value: string) => void;
}

export interface PostData {
  id: string;
  firstName: string;
  lastName: string;
  text: string;
  date: string;
  likes: object;
  dislikes: object;
  comments: number;
}
export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
}

export interface PostProp {
  firstName: string;
  lastName: string;
  postText: string;
  postDate: string;
  postLikes: object;
  postDislikes: object;
  postNumOfComments: number;
  userId: string;
  postId: string;
}

export interface TargetData {
  comments: number;
  date: string;
  firstName: string;
  lastName: string;
  likes: object;
  dislikes: object;
  text: string;
  timestamp: firebase.firestore.Timestamp;
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

export interface ProfilePicture {
  profilePicture: string;
}
