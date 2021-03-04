import React from "react";
import { EditorState, Modifier } from "draft-js";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";

export default function CustomOption({
  editorState,
  onChange,
  setSelectedText,
  setOpen,
}) {
  const addComment = () => {
    const selectionState = editorState.getSelection();
    const anchorKey = selectionState.getAnchorKey();
    const currentContent = editorState.getCurrentContent();
    const currentContentBlock = currentContent.getBlockForKey(anchorKey);
    const start = selectionState.getStartOffset();
    const end = selectionState.getEndOffset();
    const selectedText = currentContentBlock.getText().slice(start, end);

    if (selectedText !== "") {
      setSelectedText(selectedText);

      setOpen(true);
      const contentState = Modifier.applyInlineStyle(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        "COMMENT"
      );
      onChange(
        EditorState.push(editorState, contentState, "change-inline-style")
      );
    }
  };

  return (
    <div title="Comment" id="customEditorButton" onClick={addComment}>
      <ChatBubbleIcon />
    </div>
  );
}
