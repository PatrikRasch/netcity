import firebase from 'firebase/compat/app'
import { Timestamp } from 'firebase/firestore'

export interface LoggedInUserIdProp {
  loggedInUserId: string
  setLoggedInUserId: (value: string) => void
}

export interface UserData {
  id: string
  firstName: string
  lastName: string
  profilePicture: string
}

export interface TargetData {
  comments: object
  date: string
  firstName: string
  lastName: string
  likes: object
  dislikes: object
  text: string
  timestamp: firebase.firestore.Timestamp
  userId: string
}

export interface TargetCommentData {
  date: string
  firstName: string
  lastName: string
  likes: object
  dislikes: object
  text: string
  timestamp: firebase.firestore.Timestamp
}

export interface CommentData {
  posterId: string
  firstName: string
  lastName: string
  text: string
  date: string
  likes: object
  dislikes: object
  comments: object
  id: string
  userId: string
  postId: string
}

export interface AllPostsProps {
  userPicture: string
  userPosterId: string
}

export interface PostData {
  posterId: string
  firstName: string
  lastName: string
  text: string
  image: string
  imageId: string
  date: string
  likes: object
  dislikes: object
  comments: object
  id: string
  timestamp: Timestamp
  userId: string
}

export interface FirstNameProp {
  firstName: string
}

export interface LastNameProp {
  lastName: string
}

export interface GetAllPosts {
  getAllPosts: () => Promise<void>
}

export interface ProfilePicture {
  profilePicture: string
}

export interface VisitingUser {
  visitingUser: boolean
}
