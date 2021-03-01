import React, {useEffect, useState} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from "@material-ui/core/ListItemIcon";
import DialogContentText from '@material-ui/core/DialogContentText';
import CommentIcon from '@material-ui/icons/Comment';
import {send_request} from "./send_request";
import _ from "lodash";
import "./css/base.css";


export function CommentButton({document}) {
    const [openCommentsList, setOpenCommentsList] = useState(false);
    const [openCommentEditor, setOpenCommentEditor] = useState({open: false, comment: null});
    const [comments, setComments] = useState([]);

    const handleClickOpen = () => {
      send_request("GET", "comments/" + document).then((response_data) => {
        setComments(response_data);
      });

      setOpenCommentsList(true);
    };

    return (
        <div className="commentsButtonContainer">
            <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClickOpen}  id="menuButton">
              Comments
            </Button>
            <CommentsDialog open={openCommentsList} setOpen={setOpenCommentsList} comments={comments} setOpenCommentEditor={setOpenCommentEditor}/>
            <EditCommentDialog openedComment={openCommentEditor} setOpen={setOpenCommentEditor} comments={comments} setComments={setComments}/>
        </div>
    );
}


export function CommentsDialog({open, setOpen, comments, setOpenCommentEditor}) {
  const handleClose = () => {
    setOpen(false);
  };

  const listItemClick = (id) => () => {
      setOpenCommentEditor({open: true, comment: comments.find(element => element._id === id)});
  };

  return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth="md"
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
         <DialogTitle id="alert-dialog-title">{"Check comments for this document!"}</DialogTitle>
         <DialogContent>
           <List component="nav" aria-label="main mailbox folders">
             {
                 comments.map((single_comment) =>
                     <ListItem button key={single_comment._id} onClick={listItemClick(single_comment._id)}>
                         <ListItemIcon>
                             <CommentIcon/>
                         </ListItemIcon>
                         <ListItemText primary={single_comment.author} secondary={(new Date(single_comment.creation_date)).toDateString()}/>
                         <ListItemText primary="Selected:" secondary={single_comment.commented_text}/>
                         <ListItemText primary="Comment:" secondary={single_comment.comment}/>
                     </ListItem>
                 )
             }
           </List>
         </DialogContent>
         <DialogActions>
           <Button onClick={handleClose} color="primary">
             Close
           </Button>
         </DialogActions>
       </Dialog>
   );
 }


export function EditCommentDialog({openedComment, setOpen, comments, setComments}) {
  const [newCommentText, commentChange] = useState("");

  const updateComment = () => {
    send_request("PUT", "comment/" + openedComment.comment._id, JSON.stringify({comment: newCommentText})).then();
    const commentIndex = _.findIndex(comments, function(element) {
       return element._id === openedComment.comment._id;
    });
    comments[commentIndex].comment = newCommentText;
    setComments(comments);
    handleClose();
  };

  const deleteComment = () => {
    send_request("DELETE", "comment/" + openedComment.comment._id).then();
    _.remove(comments, function(element) {
        return element._id === openedComment.comment._id;
    });
    setComments(comments);
    handleClose();
  };

  const handleClose = () => {
    setOpen({open: false, comment: null});
  };

  useEffect(() => {
      if (openedComment.comment !== null) {
          commentChange(openedComment.comment.comment);
      }
  }, [openedComment.comment]);

  return (
      <Dialog
        open={openedComment.open}
        fullWidth={true}
        maxWidth="sm"
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
          <DialogTitle id="alert-dialog-title">{"Comment details!"}</DialogTitle>
          <DialogContent>
          {openedComment.comment !== null &&
              <>
                  <DialogContentText>
                    Author: {openedComment.comment.author}
                  </DialogContentText>
                  <DialogContentText>
                    Date: {openedComment.comment.creation_date}
                  </DialogContentText>
                  <DialogContentText>
                    Commented text: {openedComment.comment.commented_text}
                  </DialogContentText>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="comment"
                    label="Comment"
                    value={newCommentText}
                    onChange={(event) => {commentChange(event.target.value);}}
                    fullWidth
                    disabled={openedComment.comment.author !== sessionStorage.getItem("username")}
                  />
              </>
          }
         </DialogContent>

        <DialogActions>
          { openedComment.comment !== null && openedComment.comment.author === sessionStorage.getItem("username") &&
            <>
              <Button onClick={deleteComment} color="primary">
                Delete
              </Button>
              <Button onClick={updateComment} color="primary">
                Edit
              </Button>
            </>
          }
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
  );
}