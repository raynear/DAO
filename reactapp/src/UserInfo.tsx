import React, { Fragment } from "react";
import {
  Avatar,
  Typography,
  IconButton,
  Badge,
  Link,
  Menu,
  MenuItem
} from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";

import useStyles from "./Style";

function UserInfo(props: any) {
  const classes = useStyles();
  //const [badgeCnt, setBadgeCnt] = React.useState(0);
  const badgeCnt = 0;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuLogout = () => {
    props.Logout();
    setAnchorEl(null);
  };

  const data = props.data;

  if (
    data !== undefined &&
    data.hasOwnProperty("me") &&
    data.me !== null // &&
    // data.me.hasOwnProperty("socialAuth") &&
    // data.me.socialAuth.hasOwnProperty("edges") &&
    // data.me.socialAuth.edges.length > 0
    // data.me.socialAuth.edges[0].hasOwnProperty("node") &&
    // data.me.socialAuth.edges[0].node.hasOwnProperty("extraData")
  ) {
    console.log("userinfo1", data);
    return (
      <Fragment>
        <IconButton
          aria-controls="user_menu"
          color="inherit"
          onClick={handleMenu}
        >
          <Badge
            badgeContent={badgeCnt}
            invisible={badgeCnt === 0}
            color="secondary"
            className={classes.noMarginPadding}
          >
            <Avatar
              alt={data.me.username}
              src={""}
              className={classes.noMarginPadding}
            />
          </Badge>
        </IconButton>
        <Menu
          id="user_menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <Link href="/Profile" style={{ textDecoration: "none" }}>
              <Typography component="h6">Profile</Typography>
            </Link>
          </MenuItem>
          <MenuItem onClick={handleMenuLogout}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Typography component="h6">Logout</Typography>
            </Link>
          </MenuItem>
        </Menu>
      </Fragment>
    );
  } else {
    console.log("userinfo2", data);
    return (
      <Fragment>
        <IconButton
          aria-controls="user_menu"
          color="inherit"
          onClick={handleMenu}
        >
          <Avatar className={classes.noMarginPadding}>
            <AccountCircle fontSize="large" />
          </Avatar>
        </IconButton>
        <Menu
          id="user_menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <Link href="/Signup" style={{ textDecoration: "none" }}>
              <Typography component="h6">Sign Up</Typography>
            </Link>
          </MenuItem>

          <MenuItem onClick={handleMenuClose}>
            <Link href="/Signin" style={{ textDecoration: "none" }}>
              <Typography component="h6">Login</Typography>
            </Link>
          </MenuItem>
        </Menu>
      </Fragment>
    );
  }
}

export default UserInfo;
