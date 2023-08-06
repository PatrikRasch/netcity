import React, { ReactNode, createContext, useContext } from "react";
import EmptyProfilePictureProvider from "./EmptyProfilePictureContextProvider";
import { LoadingContextProvider } from "./LoadingContextProvider";
import LoggedInUserProfileDataProvider from "./LoggedInUserProfileDataContextProvider";

const AppContext = createContext("insert default");

export const useAppContextHook = () => {
  return useContext(AppContext);
};

interface AppContextProviderProps {
  children: ReactNode;
}

function AppContextProvider({ children }: AppContextProviderProps) {
  return (
    <LoggedInUserProfileDataProvider>
      <LoadingContextProvider>
        <EmptyProfilePictureProvider>{children}</EmptyProfilePictureProvider>
      </LoadingContextProvider>
    </LoggedInUserProfileDataProvider>
  );
}

export default AppContextProvider;
