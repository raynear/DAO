import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import {
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Container,
  Grid,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@material-ui/core";
import {
  ChevronLeft,
  ListAltRounded,
  AddCircleRounded
} from "@material-ui/icons";
import MenuIcon from "@material-ui/icons/Menu";
import DashboardIcon from "@material-ui/icons/Dashboard";

import { Switch, Route } from "react-router-dom";

//import { useApolloClient } from "@apollo/react-hooks";
//import gql from "graphql-tag";

import Dashboard from "./Dashboard";
import Proposal from "./Proposal";
import Proposals from "./Proposals";
import ProposalForm from "./EditProposal";
import Copyright from "./Copyright";
import UserInfo from "./UserInfo";

import useStyles from "./Style";

function Layout() {
  const classes = useStyles();
  //  const client = useApolloClient();

  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleListItemClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    i: number
  ) => {
    setSelectedIndex(i);
  };
  /*  useEffect(() => {
    client
      .query({
        query: gql`
          {
            username @client
          }
        `
      })
      .then(result => {
        console.log(result);
      });
  });
*/
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, open && classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(
              classes.menuButton,
              open && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h6"
            variant="h6"
            color="inherit"
            noWrap
            style={{ flexGrow: 1 }}
          >
            Muljom-DAO
          </Typography>

          <UserInfo />
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose)
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeft />
          </IconButton>
        </div>
        <Divider />
        <List>
          <ListItem
            button
            component={Link}
            to="/"
            selected={selectedIndex === 0}
            onClick={(e: any) => handleListItemClick(e, 0)}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/Proposals"
            selected={selectedIndex === 1}
            onClick={(e: any) => handleListItemClick(e, 1)}
          >
            <ListItemIcon>
              <ListAltRounded />
            </ListItemIcon>
            <ListItemText primary="Proposal List" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/EditProposal"
            selected={selectedIndex === 2}
            onClick={(e: any) => handleListItemClick(e, 2)}
          >
            <ListItemIcon>
              <AddCircleRounded />
            </ListItemIcon>
            <ListItemText primary="New Proposal" />
          </ListItem>
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.rootcontainer}>
          <Grid container spacing={0}>
            <Switch>
              <Route exact path="/" component={Dashboard} />
              <Route
                exact
                path="/EditProposal/:proposal_id"
                component={ProposalForm}
              />
              <Route exact path="/EditProposal/" component={ProposalForm} />
              <Route exact path="/Proposals" component={Proposals} />
              <Route exact path="/Proposal/:id" component={Proposal} />
            </Switch>
          </Grid>
        </Container>
        <Copyright />
      </main>
    </div>
  );
}

export default Layout;
