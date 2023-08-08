import React, { useEffect } from "react";

interface Props {
  fetchingMorePosts: boolean;
  setFetchingMorePosts: (value: boolean) => void;
  postsLoaded: number;
  setPostsLoaded: (value: number) => void;
  getPublicPosts: () => Promise<void>;
}

function useInfinityScrollFunctions({
  fetchingMorePosts,
  setFetchingMorePosts,
  postsLoaded,
  setPostsLoaded,
  getPublicPosts,
}: Props) {
  //1 Adds a scroll eventListener to the page
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  //1 Activates the useEffect below which initiates the fetching of 10 more posts
  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 100 &&
      !fetchingMorePosts
    ) {
      setFetchingMorePosts(true);
    }
  };

  //1 Adds 10 more posts for the useEffect below to load
  useEffect(() => {
    if (fetchingMorePosts) {
      setPostsLoaded(postsLoaded + 10);
      setFetchingMorePosts(false);
    }
  }, [fetchingMorePosts]);

  //1 Loads 10 posts from the feed. Loads whatever value postsLoaded holds
  useEffect(() => {
    getPublicPosts();
  }, [postsLoaded]);

  return;
}

export default useInfinityScrollFunctions;
