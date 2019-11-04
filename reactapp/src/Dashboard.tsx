import React, { Fragment /*, useEffect */ } from "react";
import clsx from "clsx";
import { Grid, Paper } from "@material-ui/core";

import Proposals from "./Proposals";
//import EditProposal from "./EditProposal";
import GQLEditProposal from "./GQLEditProposal";

import useStyles from "./Style";

function Dashboard() {
  const classes = useStyles();

  return (
    <Fragment>
      <Grid item xs={12} md={12} lg={12}>
        <Paper className={clsx(classes.papercontainer, classes.fixedHeight)}>
          <Proposals />
        </Paper>
      </Grid>
      <GQLEditProposal />
    </Fragment>
  );
}

export default Dashboard;
