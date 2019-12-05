import React from "react";
import { Link, Switch, Route } from "react-router-dom";
import { CssBaseline, AppBar, Toolbar, Typography, Container, Grid } from "@material-ui/core";

import LandingPage from "./LandingPage";
import HowTo from "./HowTo";
import Proposals from "./Proposals";
import GQLVerifyICON from "./GQLVerifyICON";
import GQLGetProposal from "./GQLProposal";
import GQLEditProposal from "./GQLEditProposal";
import GQLUserInfo from "./GQLUserInfo";
import GQLSignIn from "./GQLSignIn";
import GQLSignUp from "./GQLSignUp";
import Copyright from "./Copyright";

import useStyles from "./Style";

function Layout(props: any) {
  console.log("Layout props", props);
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="absolute"
        className={classes.appBar}
      >
        <Toolbar className={classes.toolbar}>
          <Typography component="h6" variant="h6" color="inherit" noWrap style={{ flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: 'none', color: "#FFFFFF" }}>
              <b>
                ICON-DAO
              </b>
            </Link>
          </Typography>
          <Typography component="h6" variant="h6" color="inherit" noWrap style={{ flexGrow: 1 }}>
            <Link to="/HowTo" style={{ textDecoration: 'none', color: "#FFFFFF" }}>
              How-To
            </Link>
          </Typography>
          <Typography component="h6" variant="h6" color="inherit" noWrap style={{ flexGrow: 1 }}>
            <Link to="/Proposals" style={{ textDecoration: 'none', color: "#FFFFFF" }}>
              Explorer
            </Link>
          </Typography>
          <Typography component="h6" variant="h6" color="inherit" noWrap style={{ flexGrow: 1 }}>
            <Link to="/EditProposal" style={{ textDecoration: 'none', color: "#FFFFFF" }}>
              Build
            </Link>
          </Typography>
          <GQLUserInfo />
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.rootcontainer}>
          <Grid container spacing={0}>
            <Switch>
              <Route exact path="/" component={LandingPage} />
              <Route exact path="/HowTo" component={HowTo} />
              <Route exact path="/EditProposal/:proposal_id" component={GQLEditProposal} />
              <Route exact path="/EditProposal" component={GQLEditProposal} />
              <Route exact path="/Profile" component={GQLVerifyICON} />
              <Route exact path="/Proposals" component={Proposals} />
              <Route exact path="/Proposal/:ID" component={GQLGetProposal} />
              <Route exact path="/SignIn" component={GQLSignIn} />
              <Route exact path="/SignUp" component={GQLSignUp} />
            </Switch>
          </Grid>
        </Container>
        <Copyright />
      </main>
    </div>
  );
}

export default Layout;
