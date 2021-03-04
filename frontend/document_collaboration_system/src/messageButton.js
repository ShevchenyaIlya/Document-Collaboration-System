import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { send_request } from "./send_request";
import SendMessageDialog from "./messageDialog";

export function MessageButton({ document }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpen] = useState(false);
  const [personalMode, setMessageMode] = useState(true);
  const [users, setUsers] = React.useState([]);

  const personalMessage = (value) => () => {
    send_request("GET", "users/" + document).then((response) => {
      if (response !== null) {
        setUsers(response);
      }
    });
    setMessageMode(value);
    setOpen(true);
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="commentsButtonContainer">
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
        id="menuButton"
      >
        Message
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={personalMessage(false)}>Group message</MenuItem>
        <MenuItem onClick={personalMessage(true)}>Personal message</MenuItem>
      </Menu>
      <SendMessageDialog
        openDialog={openDialog}
        setOpen={setOpen}
        messageMode={personalMode}
        users={users}
      />
    </div>
  );
}
