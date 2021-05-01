import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import SendMessageDialog from "./messageDialog";
import api from "../services/APIService";
import EmailOutlinedIcon from "@material-ui/icons/EmailOutlined";

export function MessageButton({ document }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpen] = useState(false);
  const [personalMode, setMessageMode] = useState(true);
  const [users, setUsers] = useState([]);

  const personalMessage = (value) => async () => {
    await api.getUsers(document).then((response) => {
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
    <>
      <Button onClick={handleClick} variant="outlined">
        <EmailOutlinedIcon style={{ marginRight: "10px" }} /> Message
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
    </>
  );
}
