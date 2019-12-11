import React, { Fragment } from "react";
import { Link } from "react-router-dom";

import { Avatar, Typography, IconButton, Badge, Menu, MenuItem } from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";

import useStyles from "./Style";

function UserInfo(props: any) {
  const classes = useStyles();

  if (props.loading) return <p>Loading...</p>
  if (props.error) return <p>Error...{props.error.message}</p>

  if (props.data && props.data.username) {
    return (
      <Fragment>
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
              alt={props.data.username}
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
          <MenuItem onClick={props.nyamnyam}>
            <Typography component="h6">{props.data.username}</Typography>
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
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        <IconButton
          aria-controls="user_menu"
          color="inherit"
          onClick={props.handleMenu}
        >
          <Avatar className={classes.noMarginPadding}>
            <AccountCircle color="action" fontSize="large" />
          </Avatar>
        </IconButton>
        <Menu
          id="user_menu"
          anchorEl={props.anchorEl}
          keepMounted
          open={Boolean(props.anchorEl)}
          onClose={props.handleMenuClose}
        >
          <MenuItem onClick={props.handleMenuClose}>
            <Link to="/Signup" className={classes.link}>
              <Typography component="h6">Sign Up</Typography>
            </Link>
          </MenuItem>

          <MenuItem onClick={props.handleMenuClose}>
            <Link to="/Signin" className={classes.link}>
              <Typography component="h6">Sign In</Typography>
            </Link>
          </MenuItem>
        </Menu>
      </Fragment>
    );
  }
}

export default UserInfo;