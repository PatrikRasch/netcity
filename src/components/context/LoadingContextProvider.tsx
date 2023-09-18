import React, { createContext, useContext, useState, ReactNode, Dispatch } from "react";
import LoadingScreen from "../LoadingScreen";

//1 Create new context, declare initial values
const LoadingContext = createContext<{
  isLoading: boolean;
  setIsLoading: Dispatch<boolean>;
}>({ isLoading: false, setIsLoading: () => {} });

//1 Custom hook, simplifies context consumption
export const useLoadingScreen = () => {
  return useContext(LoadingContext);
};

//1 Create the context provider
export const LoadingContextProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading ? <LoadingScreen /> : null}
      {children}
    </LoadingContext.Provider>
  );
};
