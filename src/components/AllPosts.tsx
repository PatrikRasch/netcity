import React from "react";
import Post from "./Post";

import { FirstNameProp } from "../interfaces";
import { LastNameProp } from "../interfaces";
import { PostsProp } from "../interfaces";

interface Props {
  openProfileId: string;
  firstName: FirstNameProp["firstName"];
  lastName: LastNameProp["lastName"];
  posts: PostsProp["posts"];
  loggedInUserId: string;
}

const AllPosts = ({ posts, openProfileId, loggedInUserId }: Props) => {
  //2 We need to use the userId on each post, to fetch the profile picture of the user with that ID.
  //2 If we add a profilePicture key-value pair to each post, profile pictures won't update across
  //2 the board when a user changes their profile picture.

  //1 Adds all the posts on Firebase onto the page.
  const populatePostsOnPage = () => {
    return posts.map((post) => (
      <div key={post.id}>
        <Post
          postFirstName={post.firstName}
          postLastName={post.lastName}
          postText={post.text}
          postDate={post.date}
          postLikes={post.likes}
          postDislikes={post.dislikes}
          postNumOfComments={post.comments}
          openProfileId={openProfileId}
          loggedInUserId={loggedInUserId}
          postId={post.id}
        />
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
