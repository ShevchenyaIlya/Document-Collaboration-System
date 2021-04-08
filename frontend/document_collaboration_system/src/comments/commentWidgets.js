import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import EditCommentDialog from "./editCommentsDialog";
import CommentsDialog from "./commentsDialog";
import "../css/base.css";
import api from "../services/APIService";
import CommentOutlinedIcon from "@material-ui/icons/CommentOutlined";

export function CommentButton({ document }) {
  const [openCommentsList, setOpenCommentsList] = useState(false);
  const [openCommentEditor, setOpenCommentEditor] = useState({
    open: false,
    comment: null,
  });
  const [comments, setComments] = useState([]);

  const handleClickOpen = async () => {
    await api.getComments(document).then((response_data) => {
      if (response_data !== null) {
        setComments(response_data);
      }
    });

    setOpenCommentsList(true);
  };

  return (
    <>
      <Button onClick={handleClickOpen} variant="outlined">
        <CommentOutlinedIcon style={{ marginRight: "10px" }} /> Comments
      </Button>
      <CommentsDialog
        open={openCommentsList}
        setOpen={setOpenCommentsList}
        comments={comments}
        setOpenCommentEditor={setOpenCommentEditor}
      />
      <EditCommentDialog
        openedComment={openCommentEditor}
        setOpen={setOpenCommentEditor}
        comments={comments}
        setComments={setComments}
        document={document}
      />
    </>
  );
}
