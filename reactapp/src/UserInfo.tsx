import React from "react";
import { Link } from "react-router-dom";

import {
  Grid,
  Avatar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";

import useStyles from "./Style";

function UserInfo(props: any) {
  // console.log("UserInfo props", props);
  const classes = useStyles();

  if (props.loading) return <CircularProgress />;
  //  if (props.error) return <p>Error...{props.error.message}</p>;

  if (props.data && props.data.viewer && props.data.viewer.username) {
    return (
      <Grid container className={classes.container}>
        <Grid item className={classes.grid} xs style={{ textAlign: "right" }}>
          <IconButton
            aria-controls="user_menu"
            color="inherit"
            onClick={props.handleMenu}
          >
            <Badge
              badgeContent={props.badgeCnt}
              invisible={props.badgeCnt === 0}
              color="secondary"
              className={classes.noMarginPadding}
            >
              <Avatar
                alt={props.data.viewer.username}
                src={""}
                className={classes.noMarginPadding}
              >
                <AccountCircle fontSize="large" />
              </Avatar>
            </Badge>
          </IconButton>
          <Menu
            id="user_menu"
            anchorEl={props.anchorEl}
            keepMounted
            open={Boolean(props.anchorEl)}
            onClose={props.handleMenuClose}
          >
            <MenuItem onClick={props.showUserInfo}>
              <Typography component="h6">
                {props.data.viewer.username}
              </Typography>
            </MenuItem>
            <MenuItem onClick={props.handleMenuClose}>
              <Link to="/Profile" className={classes.link}>
                <Typography component="h6">Profile</Typography>
              </Link>
            </MenuItem>
            <MenuItem onClick={props.handleMenuLogout}>
              <Link to="/" className={classes.link}>
                <Typography component="h6">Logout</Typography>
              </Link>
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>
    );
  } else {
    return (
      <Grid container className={classes.container}>
        <Grid
          item
          className={classes.grid}
          xs
          style={{ textAlign: "right", overflow: "hidden" }}
        >
          <Button component={Link} to="/Signup" style={{ overflow: "hidden" }}>
            <Typography component="h6" style={{ color: "#FFFFFF" }}>
              Join now
            </Typography>
          </Button>
        </Grid>
        <Grid
          item
          className={classes.grid}
          xs
          style={{ textAlign: "left", overflow: "hidden" }}
        >
          <Button
            component={Link}
            to="/Signin"
            variant="contained"
            style={{ color: "#FFF", overflow: "hidden" }}
          >
            <Typography component="h6" color="primary">
              Sign In
            </Typography>
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default UserInfo;
