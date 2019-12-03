import React, { Fragment } from "react";
import { Link } from "react-router-dom";

import { Avatar, Typography, IconButton, Badge, Menu, MenuItem } from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";

import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import { LOG_OUT, GET_LOCAL_ME } from "./GQL";

import useStyles from "./Style";

function GQLUserInfo(props: any) {
  const client = useApolloClient();

  const [mutateLogout] = useMutation(LOG_OUT);

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
    mutateLogout();
    setAnchorEl(null);
  };

  const { loading, error, data } = useQuery(GET_LOCAL_ME);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  console.log("GQLUserInfo", data);
  if (data !== undefined &&
    data.hasOwnProperty("username") &&
    data.username !== null) {
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
              alt={data.username}
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
            <Link to="/Profile">
              <Typography component="h6">Profile</Typography>
            </Link>
          </MenuItem>
          <MenuItem onClick={handleMenuLogout}>
            <Link to="/">
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
            <Link to="/Signup">
              <Typography component="h6">Sign Up</Typography>
            </Link>
          </MenuItem>

          <MenuItem onClick={handleMenuClose}>
            <Link to="/Signin">
              <Typography component="h6">Sign In</Typography>
            </Link>
          </MenuItem>
        </Menu>
      </Fragment>
    );
  }
}

export default GQLUserInfo;
