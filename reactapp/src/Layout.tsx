import React from "react";
import { Link, Switch, Route } from "react-router-dom";
import { CssBaseline, AppBar, Toolbar, Typography, Container, Grid, Snackbar } from "@material-ui/core";

import LandingPage from "./LandingPage";
import HowTo from "./HowTo";
import ProposalsContainer from "./ProposalsContainer";
import VerifyIconContainer from "./VerifyIconContainer";
import ProposalContainer from "./ProposalContainer";
import EditProposalContainer from "./EditProposalContainer";
import UserInfoContainer from "./UserInfoContainer";
import SignInContainer from "./SignInContainer";
import SignUpContainer from "./SignUpContainer";
import Copyright from "./Copyright";

import useStyles from "./Style";

function Layout(props: any) {
  console.log("Layout props", props);
  const classes = useStyles();

  if (props.loading) return <p>Loading...</p>
  //  if (props.error) return <p>Error...</p>
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
          {!props.error && props.data.viewer.isPrep &&
            <Typography component="h6" variant="h6" color="inherit" noWrap style={{ flexGrow: 1 }}>
              <Link to="/EditProposal" style={{ textDecoration: 'none', color: "#FFFFFF" }}>
                Build
            </Link>
            </Typography>
          }
          <UserInfoContainer refetch={props.refetch} />
        </Toolbar>
      </AppBar>
      <div className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.rootcontainer}>
          <Grid container spacing={0}>
            <Switch>
              <Route exact path="/" component={LandingPage} />
              <Route exact path="/HowTo" component={HowTo} />
              <Route exact path="/EditProposal/:proposal_id" component={EditProposalContainer} />
              <Route exact path="/EditProposal" component={EditProposalContainer} />
              <Route exact path="/Profile" component={VerifyIconContainer} />
              <Route exact path="/Proposals" component={ProposalsContainer} />
              <Route exact path="/Proposal/:ID" component={ProposalContainer} />
              <Route exact path="/SignIn" component={SignInContainer} />
              <Route exact path="/SignUp" component={SignUpContainer} />
            </Switch>
          </Grid>
        </Container>
        <Copyright />
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          autoHideDuration={5000}
          open={props.open}
          onClose={props.handleClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{props.message}</span>}
        />

      </div>
    </div>
  );
}

export default Layout;
