import React from "react";

const Header = () => {
  return (
    <div>
      <div className="h-[100px] grid grid-cols-3 content-center text-center">
        <div className="">Logo</div>
        <div className="">Public</div>
        <div className="">Profile Picture</div>
      </div>
      <div className="h-1 bg-black w-[100vw]"></div>
    </div>
  );
};

export default Header;
