import React, { useState } from "react";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Paper } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import CustomMenu from "./menu";
import FormDialog from "../comments/placeCommentDialog";
import { CommentButton } from "../comments/commentWidgets";
import { MessageButton } from "../messages/messageButton";
import ControlledEditor from "./controlledEditor";

function DocumentEditor({ document }) {
  let [readOnlyDocument, setMode] = useState(false);
  const [openModalWindow, setOpen] = useState(false);
  const [selectedText, setSelectedText] = useState(false);
  const history = useHistory();

  return (
    <>
      <FormDialog
        openModalWindow={openModalWindow}
        setOpen={setOpen}
        document={document}
        selectedText={selectedText}
      />
      <CustomMenu
        document={document}
        readOnly={readOnlyDocument}
        setMode={setMode}
      />

      <CommentButton document={document} />
      <MessageButton document={document} />
      <Paper elevation={3} className="editorContainer">
        <ControlledEditor
          document={document}
          history={history}
          readOnly={readOnlyDocument}
          setSelectedText={setSelectedText}
          setMode={setMode}
          setOpen={setOpen}
        />
      </Paper>
    </>
  );
}

export default DocumentEditor;
