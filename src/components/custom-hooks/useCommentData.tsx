import React, { useState } from "react";

import { TargetCommentData } from "../../interfaces";

export function useCommentData() {
  const [commentData, setCommentData] = useState<TargetCommentData | null>(null);

  return { commentData, setCommentData };
}

export default useCommentData;
