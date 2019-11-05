import React, { Fragment } from "react";
import {
  Avatar,
  Typography,
  IconButton,
  Badge,
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

  const data = props.data;

  if (
    !(
      data !== undefined &&
      data.hasOwnProperty("me") &&
      data.me !== null &&
      data.me.hasOwnProperty("socialAuth") &&
      data.me.socialAuth.hasOwnProperty("edges") &&
      data.me.socialAuth.edges.length > 0
    )
    //    data.me.socialAuth.edges[0].hasOwnProperty("node") &&
    //    data.me.socialAuth.edges[0].node.hasOwnProperty("extraData")
  ) {
    return (
      <Fragment>
        <IconButton
          aria-controls="user_menu"
          color="inherit"
          onClick={handleMenu}
        >
          <Avatar className={classes.noMarginPadding}>
            <AccountCircle />
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
            <a href="/Sign/up">Sign Up</a>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <a href="http://localhost:8080/oauth/login/kakao">
              <Typography component="h6">Login</Typography>
            </a>
          </MenuItem>
        </Menu>
      </Fragment>
    );
  } else {
    //  console.log(data.me.socialAuth.edges[0].node.extraData);
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
              src={
                data.me.socialAuth.edges[0].node.extraData.properties
                  .thumbnailImage
              }
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
          <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
          <MenuItem onClick={handleMenuClose}>MyMy</MenuItem>
          <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
        </Menu>
      </Fragment>
    );
  }
}

export default UserInfo;
