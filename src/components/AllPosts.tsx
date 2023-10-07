import React, { useState } from 'react'
import Post from './Post'

import { useEmptyProfilePicture } from './context/EmptyProfilePictureContextProvider'
import ThickSeparatorLine from './ThickSeparatorLine'

interface posts {
  posts: PostData[]
}

interface PostData {
  userId: string
  firstName: string
  lastName: string
  text: string
  image: string
  imageId: string
  date: string
  likes: object
  dislikes: object
  comments: object
  timestamp: object
  id: string
}

interface Props {
  openProfileId?: string
  posts?: posts['posts']
  globalPosts?: PostData[]
  friendsPosts?: PostData[]
  showGlobalPosts?: boolean
  context: 'profile' | 'feed'
  openProfileFirstName?: string
  openProfileLastName?: string
  visitingUser?: boolean
}

const AllPosts = ({
  posts,
  openProfileId,
  globalPosts,
  friendsPosts,
  showGlobalPosts,
  context,
  openProfileFirstName,
  openProfileLastName,
  visitingUser,
}: Props) => {
  const emptyProfilePicture = useEmptyProfilePicture()
  const [loggedInUserProfilePicture, setLoggedInUserProfilePicture] = useState(emptyProfilePicture)

  // - Adds all the posts on Firebase onto the page.
  const populatePostsOnPage = () => {
    if (context === 'profile' && posts && openProfileId)
      return posts.map((post, index) => (
        <div key={post.id}>
          <div>
            <Post
              postFirstName={post.firstName}
              postLastName={post.lastName}
              postText={post.text}
              postImage={post?.image}
              postImageId={post?.imageId}
              postDate={post.date}
              postLikes={post.likes}
              postDislikes={post.dislikes}
              postComments={post.comments}
              openProfileId={openProfileId}
              loggedInUserProfilePicture={loggedInUserProfilePicture}
              setLoggedInUserProfilePicture={setLoggedInUserProfilePicture}
              postId={post.id}
              postIndex={index}
              postUserId={post.userId}
              context={context}
              openProfileFirstName={openProfileFirstName}
              openProfileLastName={openProfileLastName}
              visitingUser={visitingUser}
            />
          </div>
          <ThickSeparatorLine />
        </div>
      ))
    if (context === 'feed' && showGlobalPosts && globalPosts) {
      return globalPosts.map((post, index) => (
        <div key={post.id}>
          <div>
            <Post
              postFirstName={post.firstName}
              postLastName={post.lastName}
              postText={post.text}
              postImage={post?.image}
              postImageId={post?.imageId}
              postDate={post.date}
              postLikes={post.likes}
              postDislikes={post.dislikes}
              postComments={post.comments}
              loggedInUserProfilePicture={loggedInUserProfilePicture}
              setLoggedInUserProfilePicture={setLoggedInUserProfilePicture}
              postId={post.id}
              postIndex={index}
              postUserId={post.userId}
              context={context}
              friendsOnlyPost={false}
            />
          </div>
          <ThickSeparatorLine />
        </div>
      ))
    }
    if (context === 'feed' && !showGlobalPosts && friendsPosts) {
      return friendsPosts.map((post, index) => (
        <div key={post.id}>
          <div>
            <Post
              postFirstName={post.firstName}
              postLastName={post.lastName}
              postText={post.text}
              postImage={post?.image}
              postImageId={post?.imageId}
              postDate={post.date}
              postLikes={post.likes}
              postDislikes={post.dislikes}
              postComments={post.comments}
              loggedInUserProfilePicture={loggedInUserProfilePicture}
              setLoggedInUserProfilePicture={setLoggedInUserProfilePicture}
              postId={post.id}
              postIndex={index}
              postUserId={post.userId}
              context={context}
              friendsOnlyPost={true}
            />
          </div>
          <ThickSeparatorLine />
        </div>
      ))
    }
  }

  return <div>{populatePostsOnPage()}</div>
}

export default AllPosts
