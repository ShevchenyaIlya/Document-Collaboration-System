import React from "react";
import "../css/base.css";
import { Typography } from "@material-ui/core";
import DescriptionIcon from "@material-ui/icons/Description";

function Header() {
  return (
    <header>
      <Typography variant={"h2"}>
        {" "}
        <DescriptionIcon style={{ width: "40px", height: "40px" }} /> Document
        collaboration system
      </Typography>
    </header>
  );
}

export default Header;
