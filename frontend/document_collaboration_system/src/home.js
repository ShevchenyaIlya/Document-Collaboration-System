import React from "react";
import ControlledAccordions from "./accordion";

function Home({ setDocument }) {
  return (
    <div className="Home">
      <ControlledAccordions setDocument={setDocument} />
    </div>
  );
}

export default Home;
