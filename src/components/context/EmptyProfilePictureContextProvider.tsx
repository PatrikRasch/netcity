import React, { useState, createContext, useContext, ReactNode } from "react";
import emptyProfilePictureImage from "./../../assets/icons/emptyProfilePicture.jpg";

//- Create the context
const EmptyProfilePictureContext = createContext<string>(emptyProfilePictureImage);

//- Custom hook that hides away the need for "useContext" in our components directly
export function useEmptyProfilePicture() {
  return useContext(EmptyProfilePictureContext); // CONSUME CONTEXT AND RETURN CURRENT VALUE
}

//- Interface for provider. ReactNode is a union which represents any valid React child that can be rendered.
interface EmptyProfilePictureProviderProps {
  children: ReactNode;
}

//- The provider, the "main" part of our context.
function EmptyProfilePictureProvider({ children }: EmptyProfilePictureProviderProps) {
  const [emptyProfilePicture, setEmptyProfilePicture] = useState(emptyProfilePictureImage);

  return (
    <EmptyProfilePictureContext.Provider value={emptyProfilePicture}>
      {children}
    </EmptyProfilePictureContext.Provider>
  );
}
export default EmptyProfilePictureProvider;
