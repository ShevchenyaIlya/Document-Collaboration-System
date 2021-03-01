import React from 'react';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

export default function InviteSnackbar({notification}) {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    notification.setOpen({open: false});
  };

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={notification.open}
        autoHideDuration={10000}
        onClose={handleClose}
        message={"You invited to '" + notification.documentName + "'!"}
        action={
          <React.Fragment>
            <Button color="secondary" size="small" onClick={handleClose}>
              Confirm
            </Button>
            <Button color="secondary" size="small" onClick={handleClose}>
              Undo
            </Button>
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  );
}