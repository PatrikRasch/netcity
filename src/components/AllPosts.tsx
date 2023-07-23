import React from "react";
import Post from "./Post";

import { userIdProp } from "../interfaces";
import { FirstNameProp } from "../interfaces";
import { LastNameProp } from "../interfaces";
import { PostsProp } from "../interfaces";

interface Props {
  userId: userIdProp["userId"];
  setUserId: userIdProp["setUserId"];
  firstName: FirstNameProp["firstName"];
  lastName: LastNameProp["lastName"];
  posts: PostsProp["posts"];
}

const AllPosts = (props: Props) => {
  const { posts } = props;
  const { userId } = props;

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
          userId={userId}
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
