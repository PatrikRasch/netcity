import React from "react";

const Login = () => {
  return (
    <div className="min-h-[100svh]">
      <div className="min-h-[80svh] grid justify-center">
        {/*//1 Header */}
        <div className="flex flex-col pt-4 justify-center text-center">
          <div className="text-2xl">Welcome to</div>
          <div className="text-6xl font-Hertical">NetCity</div>
        </div>

        {/*//1 Input section */}
        <div className="grid text-xl gap-4 m-4">
          <input
            type="email"
            className="p-2 pl-4 border-2 min-h-[40px] min-w-[75svw] rounded-md border-black shadow-lg"
            placeholder="Email"
          />
          <input
            type="password"
            className="p-2 pl-4 border-2 min-h-[40px] min-w-[75svw] rounded-md border-black shadow-lg"
            placeholder="Password"
          />
        </div>

        {/*//1 Login and Sign up with Google section */}
        <div className="flex flex-col items-center text-xl">
          <button className="p-4 rounded-md border-2 border-black min-w-[60svw] shadow-lg min-h-[50px] m-2 text-white bg-[#00A7E1]">
            Log in
          </button>
          <button className="p-4 min-h-[50px] border-2 border-black rounded-md min-w-[60svw] shadow-lg m-2 text-white bg-[#00AF54]">
            Sign in with Google
          </button>
        </div>

        {/*//1 "or" divider */}
        <div className="flex items-center justify-around">
          <div className="w-[28svw] h-[2px] bg-black"></div>
          <div className="text-xl">or</div>
          <div className="w-[28svw] h-[2px] bg-black"></div>
        </div>

        {/*//1 Create new account button */}
        <div className="justify-self-center self-center">
          <button className="p-4 text-xl border-2 min-h-[50px] shadow-lg border-black min-w-[60svw] rounded-md m-2 bg-gray-300">
            Create new account
          </button>
        </div>
      </div>

      {/*//1 Footer */}
      <div className="flex justify-center items-end text-3xl min-h-[20svh] pb-12 font-Hertical">
        NetCity
      </div>
    </div>
  );
};

export default Login;
