import React from "react";
import "./css/App.css";
import DocumentEditor from "./editor";
import { useHistory } from "react-router-dom";

function App({ document, setDocument }) {
  const history = useHistory();

  const url_components = history.location.pathname.split("/");
  const document_identifier = url_components[url_components.length - 1];

  return (
    <div className="App">
      <DocumentEditor
        document={document !== "" ? document : document_identifier}
        setDocument={setDocument}
      />
    </div>
  );
}

export default App;
