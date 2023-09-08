import React from "react";
import PublicPost from "./PublicPost";

interface PublicPostData {
  userId: string;
  firstName: string;
  lastName: string;
  text: string;
  image: string;
  imageId: string;
  date: string;
  likes: object;
  dislikes: object;
  comments: object;
  timestamp: object;
  id: string;
}

interface Props {
  globalPosts: PublicPostData[];
  friendsPosts: PublicPostData[];
  showGlobalPosts: boolean;
}

const PublicPosts = ({ globalPosts, friendsPosts, showGlobalPosts }: Props) => {
  //1 Adds all the posts on Firebase onto the page.
  const populatePostsOnPage = () => {
    // if (!globalPosts) return;
    if (showGlobalPosts) {
      return globalPosts.map((post, index) => (
        <div key={post.id}>
          <div>
            <PublicPost
              postFirstName={post.firstName}
              postLastName={post.lastName}
              postText={post.text}
              postImage={post?.image}
              postImageId={post?.imageId}
              postDate={post.date}
              postLikes={post.likes}
              postDislikes={post.dislikes}
              postComments={post.comments}
              postId={post.id}
              postIndex={index}
              postUserId={post.userId}
            />
          </div>
          <div className="w-full h-[15px] bg-gray-100"></div>
        </div>
      ));
    }
    if (!showGlobalPosts) {
      return friendsPosts.map((post, index) => (
        <div key={post.id}>
          <div>
            <PublicPost
              postFirstName={post.firstName}
              postLastName={post.lastName}
              postText={post.text}
              postImage={post?.image}
              postImageId={post?.imageId}
              postDate={post.date}
              postLikes={post.likes}
              postDislikes={post.dislikes}
              postComments={post.comments}
              postId={post.id}
              postIndex={index}
              postUserId={post.userId}
            />
          </div>
          <div className="w-full h-[15px] bg-gray-100"></div>
        </div>
      ));
    }
  };

  return <div>{populatePostsOnPage()}</div>;
};

export default PublicPosts;
