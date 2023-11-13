import React from 'react'

export function imageSizeExceeded(uploadedPicture: File) {
  // - Returns true if the uploaded image is above 2MB
  if (!uploadedPicture || uploadedPicture.size < 2097152) return false
  else return true
}
