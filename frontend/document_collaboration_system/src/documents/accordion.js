import React, { useContext, useState, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Button, TextField } from "@material-ui/core";
import api from "../services/APIService";
import { useHistory } from "react-router-dom";
import { AppContext } from "../";
import "../css/base.css";
import Tooltip from "@material-ui/core/Tooltip";
import {fieldValidation, ValidationService} from "../services/ValidationService";
import ValidationError from "../errors/ValidationError";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
}));

export default function ControlledAccordions({ setDocument }) {
  const classes = useStyles();
  const history = useHistory();
  const { alertContent } = useContext(AppContext);
  const [expanded, setExpanded] = useState(false);
  const [documentIdentifier, setDocumentName] = useState("");

  const onChangeDocumentName = useCallback(
    (event) => setDocumentName(event.target.value),
    []
  );

  const inputFieldValidation = () => {
    try {
          ValidationService.validateDocumentId(documentIdentifier);
    } catch (e) {
        if (e instanceof ValidationError) {
            alertContent.handler({
                alertOpen: true,
                alertMessage: e.message,
                type: "error",
            });
            return false;
        }
    }

    return true;
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const submitDocumentCreating = (event) => {
    event.preventDefault();
    if (sessionStorage.getItem("username") === null) {
      alertContent.handler({
        alertOpen: true,
        alertMessage: "Please login!",
        type: "warning",
      });
      history.push("/login");
    } else {
      if (inputFieldValidation()) {
        api
            .postDocument(JSON.stringify({document_name: documentIdentifier}))
            .then((data) => {
              if (data !== null) {
                const {message} = data;

                if (typeof message === "undefined") {
                  setDocument(data);
                  history.push("/api/document/" + data);
                } else {
                  alertContent.handler({
                    alertOpen: true,
                    alertMessage: message,
                    type: "error",
                  });
                }
              } else {
                alertContent.handler({
                  alertOpen: true,
                  alertMessage: "Please use another document name!",
                  type: "warning",
                });
              }
            });
      }
    }
  };

  const submitDocumentOpening = (event) => {
    event.preventDefault();
    if (sessionStorage.getItem("username") === null) {
      alertContent.handler({
        alertOpen: true,
        alertMessage: "Please login!",
        type: "warning",
      });
      history.push("login");
    } else {
      if (inputFieldValidation()) {
        api.getDocument(documentIdentifier).then((data) => {
          if (data !== null) {
            history.push("/api/document/" + data.id);
          } else {
            alertContent.handler({
              alertOpen: true,
              alertMessage: "Please use another document name!",
              type: "warning",
            });
          }
        });
      }
    }
  };

  return (
    <div className="createDocument">
      <Accordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.heading}>Create document</Typography>
          <Typography className={classes.secondaryHeading}>
            New document for collaborative work
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <form
            className={classes.root}
            noValidate
            autoComplete="off"
            onSubmit={submitDocumentCreating}
          >
            <div>
              <TextField
                id="outlined-basic"
                label="Document identifier"
                variant="outlined"
                className="documentInput"
                value={documentIdentifier}
                error={fieldValidation(documentIdentifier, ValidationService.validateDocumentId)}
                onChange={onChangeDocumentName}
              />
            </div>
            <Tooltip title="Create new document">
              <Button variant="outlined" type="submit">
                Create
              </Button>
            </Tooltip>
          </form>
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === "panel2"}
        onChange={handleChange("panel2")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography className={classes.heading}>Open document</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <form
            className={classes.root}
            noValidate
            autoComplete="off"
            onSubmit={submitDocumentOpening}
          >
            <div>
              <TextField
                id="outlined-basic"
                label="Document identifier"
                variant="outlined"
                className="documentInput"
                value={documentIdentifier}
                error={fieldValidation(documentIdentifier, ValidationService.validateDocumentId)}
                onChange={onChangeDocumentName}
              />
            </div>
            <Tooltip title="Open existing document">
              <Button variant="outlined" type="submit">
                Open
              </Button>
            </Tooltip>
          </form>
        </AccordionDetails>
      </Accordion>
      <Accordion disabled>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3a-content"
          id="panel3a-header"
        >
          <Typography className={classes.heading}>New feature</Typography>
        </AccordionSummary>
      </Accordion>
    </div>
  );
}
