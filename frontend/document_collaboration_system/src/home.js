import React, { useEffect } from "react";
import ControlledAccordions from "./documents/accordion";
import { useHistory } from "react-router-dom";

function Home({ setDocument }) {
  const history = useHistory();

  useEffect(() => {
    if (sessionStorage.getItem("token") === null) {
      history.push("/login");
    }
  }, [history]);

  return (
    <div className="Home">
      <ControlledAccordions setDocument={setDocument} />
    </div>
  );
}

export default Home;
