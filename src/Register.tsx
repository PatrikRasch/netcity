import React from "react";

const Register = () => {
  return (
    <div className="min-h-[100svh]">
      <div className="min-h-[90svh] grid justify-center">
        <div className="flex flex-col pt-4 justify-center text-center">
          <div className="text-2xl">Become a citizen of</div>
          <div className="text-6xl font-Hertical">NetCity</div>
        </div>

        {/*//1 Name section */}
        <div className="grid text-xl gap-4 m-4">
          <div className="text-base text-center">You can use your real name or an alias</div>
          <input
            type="text"
            className="p-2 pl-4 border-2 min-h-[40px] min-w-[75svw] rounded-md border-black shadow-lg"
            placeholder="First name"
          />
          <input
            type="text"
            className="p-2 pl-4 border-2 min-h-[40px] min-w-[75svw] rounded-md border-black shadow-lg"
            placeholder="Surname"
          />
        </div>

        <div className="flex items-center justify-around">
          <div className="w-[20svw] h-[2px] bg-black"></div>
          <div className="text-xl">Login details</div>
          <div className="w-[20svw] h-[2px] bg-black"></div>
        </div>

        {/*//1 Email and password section */}
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
          <input
            type="password"
            className="p-2 pl-4 border-2 min-h-[40px] min-w-[75svw] rounded-md border-black shadow-lg"
            placeholder="Confirm Password"
          />
        </div>

        {/*//1 Log in button */}
        <div className="flex flex-col items-center text-xl">
          <button className="p-4 rounded-md border-2 border-black min-w-[60svw] shadow-lg min-h-[50px] m-2 text-white bg-[#00A7E1]">
            Log in
          </button>
        </div>
        {/*//1 "or" dividor */}
        <div className="flex items-center justify-around">
          <div className="w-[28svw] h-[2px] bg-black"></div>
          <div className="text-xl">or</div>
          <div className="w-[28svw] h-[2px] bg-black"></div>
        </div>
        {/*//1 Sign up with Google button */}
        <div className="flex flex-col items-center text-xl">
          <button className="p-4 min-h-[50px] border-2 border-black rounded-md min-w-[60svw] shadow-lg m-2 text-white bg-[#00AF54]">
            Sign up with Google
          </button>
        </div>
      </div>
      {/*//1 Footer */}
      <div className="flex justify-center items-end text-3xl min-h-[10svh] pb-8 font-Hertical">
        NetCity
      </div>
    </div>
  );
};

export default Register;
