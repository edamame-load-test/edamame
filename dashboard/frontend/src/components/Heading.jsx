import React from "react";
import logo from "../assets/logo.svg";

// We need to have multiple different states here.

function Heading() {
  return (
    <div className="bg-green-500 text-white antialiased py-10">
      <div className="max-w-4xl mx-auto text-center">
        <img
          src={logo}
          alt="Edamame Logo"
          className="w-24 align-center inline" //animate-spin-slow
        />
        <h1 className="font-bold align-center text-xl mt-4">
          Welcome to Edamame
        </h1>
        <p className="green-100 text-lg my-4">
          Edamame is an open source, distributed load-testing tool. You can
          upload a K6 test script, and then start a test to deploy a distributed
          load test to your AWS account.
        </p>
        <button className="border border-white rounded px-3 py-[8px] my-4">
          Learn to write tests using K6
        </button>
      </div>
    </div>
  );
}

export default Heading;
