import React, { useState } from "react";

import { CommentData } from "../../interfaces";

export function useCommentsOnPost() {
  const [comments, setComments] = useState<CommentData[]>([]);
  return { comments, setComments };
}

export default useCommentsOnPost;
