import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionActions from "@material-ui/core/AccordionActions";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import React from "react";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import DescriptionTwoToneIcon from "@material-ui/icons/DescriptionTwoTone";
import Box from '@material-ui/core/Box';
import Tooltip from "@material-ui/core/Tooltip";

export const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    padding: "10px",
  },
  itemBody: {
    flexGrow: 1,
  },
  paper: {
    padding: "0 40px",
    textAlign: "left",
    color: theme.palette.text.primary,
    "& > h6, span": {
      display: "inline-block",
      marginLeft: "5px",
    },
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    marginLeft: "10px",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  grayBackground: {
    background: "gray",
    textAlign: "center",
  },
}));

export default function DocumentListItem({
  single_document,
  history,
  expanded,
  setExpanded,
}) {
  const classes = useStyles();
  const {
    _id,
    creator,
    document_name,
    creation_date,
    status,
  } = single_document;

  const handleClick = (event) => {
    history.push("document/" + single_document._id);
  };

  const handleChange = (event, isExpanded) => {
    setExpanded(isExpanded ? _id : false);
  };

  return (
    <>
      <Accordion expanded={expanded === _id} onChange={handleChange}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <DescriptionTwoToneIcon />
          <Typography className={classes.heading}>
            {`Document: '${document_name}'`}
          </Typography>
          <Typography className={classes.secondaryHeading}>{_id}</Typography>
        </AccordionSummary>
        <Divider />
        <AccordionDetails>
          <div className={classes.root}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <Typography variant="h6">Identifier: </Typography>
                  <Typography variant="h6">
                    <Box fontWeight="fontWeightRegular" m={1}>
                      {_id}
                    </Box>
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <Typography variant="h6">Creation date: </Typography>
                  <Typography variant="h6">
                    <Box fontWeight="fontWeightRegular" m={1}>
                      {creation_date}
                    </Box>
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <Typography variant="h6">Status: </Typography>
                  <Typography variant="h6">
                    <Box fontWeight="fontWeightRegular" m={1}>
                      {status}
                    </Box>
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <Typography variant="h6">Creator: </Typography>
                  <Typography variant="h6">
                    <Box fontWeight="fontWeightRegular" m={1}>
                      {creator}
                    </Box>
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </div>
        </AccordionDetails>
        <Divider />
        <AccordionActions>
          <Tooltip title="Open document editor">
            <Button variant="contained" size="small" onClick={handleClick}>
              Edit document
            </Button>
          </Tooltip>
        </AccordionActions>
      </Accordion>
    </>
  );
}
