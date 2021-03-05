import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import EditCommentDialog from "./editCommentsDialog";
import CommentsDialog from "./commentsDialog";
import "./css/base.css";
import api from "./service";

export function CommentButton({ document }) {
  const [openCommentsList, setOpenCommentsList] = useState(false);
  const [openCommentEditor, setOpenCommentEditor] = useState({
    open: false,
    comment: null,
  });
  const [comments, setComments] = useState([]);

  const handleClickOpen = () => {
    api.getComments(document).then((response_data) => {
      setComments(response_data);
    });

    setOpenCommentsList(true);
  };

  return (
    <div className="commentsButtonContainer">
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClickOpen}
        id="menuButton"
      >
        Comments
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
      />
    </div>
  );
}
