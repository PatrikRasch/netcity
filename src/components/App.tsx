import React from "react";
import { BrowserRouter } from "react-router-dom";
import RouteSwitch from "./RouteSwitch";
import AppContextProvider from "./context/AppContextProvider";

function App() {
  return (
    <div>
      <AppContextProvider>
        <BrowserRouter>
          <RouteSwitch />
        </BrowserRouter>
      </AppContextProvider>
    </div>
  );
}

export default App;

//1 Variables naming
//2 Profile being visited: openProfileId
//2 Logged in user: loggedInUserId

//1 Features to build:
//3 An editable about page on Profile
//3 emptyProfilePicture shared using context
//3 Ability to delete posts you've made
//3 Ability to delete comments you've made
//3 Liking and disliking from (in Current Known Problems)
//3 The Public page in general must be implemented
//2 The ability to add friends
//2 Option to have closed or open profile
//2 Implement react-image for better load times (it might use caching for us?)

//2 Profile pictures being stored in cache (or a way to not load the same images every time they're displayed)

//1 Maybe to build:
//2 ? The next time the user loads the page where the comment is, it can either stay visible or disappear 🤔
//2 ? Should your comments always show up on top for you? YouTube does that

//1 Current Known Problems
//4 Loading:
//2 User can currently see the components loading as they are loading. Implementing a form of "Loading" cover while this is happening might be ideal.

//1 Completed:
//3 Header must not reload every time a navigation is made where header still stays on-screen. (Lazyloading React ✓)
//3 Comments

//4 Comments:
//3 - Ability to like and dislike comments
//3 Most recent post should display comment input field by default.
//3 The rest should open when the comment button is clicked
//3 Display one comment per post by default
//3 When comment button is pressed, show 5 comments, and show "See more comments" button at the bottom.
//3 If clicked, load 5 more comments each time.

//3 Posts and comments have an issue with the like-count and dislike-count. The images load correctly, but the count does not. This is most noticeable when the user chooses to see comments, likes/dislikes the comments, then closes the comment section, followed by opening it again.
//3 Comment deletion doesn't instantly reflect in the UI such as post deletion does.

//3 Regarding comments being visible:
//3 The comment input field could be visible by default, but to read comments, the comment button must be clicked
//3 Once a user has posted a comment, it'll instantly be visible.
//3 Comments should be sorted in order of when they were posted.
//3 Comments need a timestamp / datestamp
