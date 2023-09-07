import React, { useState } from "react";
import Post from "./Post";
import MakeComment from "./MakeComment";

import { useEmptyProfilePicture } from "./context/EmptyProfilePictureContextProvider";

import { PostsProp } from "../interfaces";

interface Props {
  openProfileId: string;
  posts: PostsProp["posts"];
}

const AllPosts = ({ posts, openProfileId }: Props) => {
  //2 We need to use the userId on each post, to fetch the profile picture of the user with that ID.
  //2 If we add a profilePicture key-value pair to each post, profile pictures won't update across
  //2 the board when a user changes their profile picture.
  const emptyProfilePicture = useEmptyProfilePicture();
  const [loggedInUserProfilePicture, setLoggedInUserProfilePicture] = useState(emptyProfilePicture);

  //1 Adds all the posts on Firebase onto the page.
  const populatePostsOnPage = () => {
    if (!posts) return;
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
          />
        </div>
        <div className="w-full h-[15px] bg-gray-100"></div>
      </div>
    ));
  };

  return <div>{populatePostsOnPage()}</div>;
};

export default AllPosts;

//3 AllPosts should get the posts it is displaying from Firestore
//3 For each post som er hentet, pass data.likes/dislikes osv til each post. Render.

//3 Hver gang det skjer en endring i MakePost (som i at en post lages), så kjører
//3 vi en state update eller en callback som gjør at AllPosts her re-renderes og oppdateres
//3 Så stabler vi alt i rekkefølge
