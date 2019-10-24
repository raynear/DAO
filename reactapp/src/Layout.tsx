import React, { Fragment /*, useEffect */ } from "react";

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
  Badge,
  Container,
  Grid,
  Paper,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from "@material-ui/core";
import {
  ChevronLeft,
  Dashboard,
  ListAltRounded,
  AddCircleRounded
} from "@material-ui/icons";
import MenuIcon from "@material-ui/icons/Menu";

//import { useApolloClient } from "@apollo/react-hooks";
//import gql from "graphql-tag";

import Proposals from "./Proposals";
import ProposalForm from "./NewProposal";
import Copyright from "./Copyright";
import Login from "./Login";

import useStyles from "./Style";

interface propType {
  type?: string;
}

function MainContents(props: propType) {
  const classes = useStyles();

  if (props.type === "ProposalList") {
    return <Proposals />;
  } else if (props.type === "NewProposal") {
    return <ProposalForm />;
  } else {
    return (
      <Fragment>
        <Grid item xs={12} md={8} lg={9}>
          <Paper className={clsx(classes.paper, classes.fixedHeight)}>
            <Proposals />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <Paper className={clsx(classes.paper, classes.fixedHeight)}>
            ORDERS
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <ProposalForm />
          </Paper>
        </Grid>
      </Fragment>
    );
  }
}

function Layout() {
  const classes = useStyles();
  //  const client = useApolloClient();

  const [page, setPage] = React.useState("Dashboard");
  const [open, setOpen] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Muljom-DAO
          </Typography>
          <IconButton
            aria-controls="user_menu"
            color="inherit"
            onClick={handleMenu}
          >
            <Badge
              badgeContent={4}
              color="secondary"
              className={classes.noMarginPadding}
            >
              <Login />
            </Badge>
          </IconButton>
          <Menu
            id="user_menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>MyMy</MenuItem>
            <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
          </Menu>
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
          <ListItem button onClick={() => setPage("Dashboard")}>
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => setPage("ProposalList")}>
            <ListItemIcon>
              <ListAltRounded />
            </ListItemIcon>
            <ListItemText primary="Proposal List" />
          </ListItem>
          <ListItem button onClick={() => setPage("NewProposal")}>
            <ListItemIcon>
              <AddCircleRounded />
            </ListItemIcon>
            <ListItemText primary="New Proposal" />
          </ListItem>
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={0}>
            <MainContents type={page} />
          </Grid>
        </Container>
        <Copyright />
      </main>
    </div>
  );
}

export default Layout;