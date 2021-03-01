import React from "react";
import {send_request} from "./send_request";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import {TextField} from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";


export default function InviteUserDialog({openDialog, setOpen, document}) {
    const [username, setUsername] = React.useState("");

    const handleClose = () => {
        setOpen(false);
        setUsername("");
    };

    const inviteUser = () => {
      const body = JSON.stringify({document: document, username: username});
      send_request("POST", "invite", body)
          .then(response => console.log(response));
      handleClose();
    };

    return (
        <Dialog
        open={openDialog}
        fullWidth={true}
        maxWidth="sm"
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        >
         <DialogContent>
             <TextField
                 id="outlined-basic"
                 label="Username"
                 variant="outlined"
                 fullWidth={true}
                 value={username}
                 onChange={(event) => setUsername(event.target.value)}
             />
         </DialogContent>
         <DialogActions>
           <Button onClick={inviteUser} color="primary">
             Invite
           </Button>
         </DialogActions>
       </Dialog>
    );
}