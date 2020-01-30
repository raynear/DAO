import React from "react";
import { Link, Switch, Route } from "react-router-dom";
import { CssBaseline, AppBar, Toolbar, Typography, Container, Grid, Snackbar } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import clsx from "clsx";

import LandingPage from "./LandingPage";
import HowTo from "./HowTo";
import VerifyIconContainer from "./VerifyIconContainer";
import SelectPRepContainer from "./SelectPRepContainer";
import NoteProposalsContainer from "./NoteProposalsContainer";
import NoteProposalContainer from "./NoteProposalContainer";
import ProposalsContainer from "./ProposalsContainer";
import ProposalContainer from "./ProposalContainer";
import EditProposalContainer from "./EditProposalContainer";
import UserInfoContainer from "./UserInfoContainer";
import SignInContainer from "./SignInContainer";
import SignUpContainer from "./SignUpContainer";
import Copyright from "./Copyright";

import useStyles from "./Style";

import iconLogo from "./img/Logo_horizon.png"

const IconTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#50A8B8",
    },
  },
})

function Layout(props: any) {
  // console.log("Layout props", props);
  const classes = useStyles();

  if (props.loading) return <p>Loading...</p>
  //  if (props.error) return <p>Error...</p>
  return (
    <ThemeProvider theme={IconTheme}>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="absolute"
          className={classes.appBar}
        >
          <Toolbar className={classes.toolbar}>
            <Grid container className={classes.container}>
              <Grid item className={clsx(classes.grid, classes.center, classes.overflowHidden)} xs={3} md={3} lg={3}>
                <Link to="/" style={{ flexGrow: 1 }}>
                  <img src={iconLogo} alt="ICON Vote" style={{ maxWidth: "200px" }} />
                </Link>
              </Grid>
              <Grid item className={clsx(classes.grid, classes.center, classes.overflowHidden)} xs>
                <Typography component="h6" variant="h6" color="inherit" noWrap style={{ flexGrow: 1 }}>
                  <Link to="/HowTo" style={{ textDecoration: 'none', color: "#FFFFFF" }}>
                    How-To
                  </Link>
                </Typography>
              </Grid>
              <Grid item className={clsx(classes.grid, classes.center, classes.overflowHidden)} xs>
                <Typography component="h6" variant="h6" color="inherit" noWrap style={{ flexGrow: 1 }}>
                  <Link to="/SelectPRep" style={{ textDecoration: 'none', color: "#FFFFFF" }}>
                    Vote Explorer
                  </Link>
                </Typography>
              </Grid>
              {!props.error && props.data.viewer.isPrep &&
                <Grid item className={clsx(classes.grid, classes.center, classes.overflowHidden)} xs>
                  <Typography component="h6" variant="h6" color="inherit" noWrap style={{ flexGrow: 1 }}>
                    <Link to={"/NoteProposals/" + props.data.viewer.username} style={{ textDecoration: 'none', color: "#FFFFFF" }}>
                      Launch new votes
                    </Link>
                  </Typography>
                </Grid>
              }
              <Grid item className={clsx(classes.grid, classes.center, classes.overflowHidden)} xs>
                <UserInfoContainer refetch={props.refetch} />
              </Grid>
            </Grid>
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
                <Route exact path="/SelectPRep" component={SelectPRepContainer} />
                <Route exact path="/NoteProposals/:PRep" component={NoteProposalsContainer} />
                <Route exact path="/NoteProposal/:PRep/:ID" component={NoteProposalContainer} />
                <Route exact path="/Proposals/:PRep" component={ProposalsContainer} />
                <Route exact path="/Proposal/:PRep/:ID" component={ProposalContainer} />
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
    </ThemeProvider >
  );
}

export default Layout;
