import React, { Fragment } from "react";
import {
  Grid,
  Paper,
  Avatar,
  Typography,
  IconButton,
  Link
} from "@material-ui/core";
import { AccountCircle, Facebook } from "@material-ui/icons";

import useStyles from "./Style";

function UserInfo(props: any) {
  const classes = useStyles();

  let photo = "";
  const data = props.data;

  const detail = {
    detail: {
      type: "REQUEST_SIGNING",
      payload: {
        from: "hxd1a3147ac75edc40d1094b8ec4f6a2bbd77ffbd4",
        hash: "0xabcdef"
      }
    }
  };

  function aa() {
    const customEvent = new CustomEvent("ICONEX_RELAY_REQUEST", detail);
    window.dispatchEvent(customEvent);
  }

  const eventHandler = (event: any) => {
    const { type, payload } = detail.detail;
    if (type === "RESPONSE_SIGNING") {
      console.log(payload); // e.g., 'q/dVc3qj4En0GN+...'
    }
  };
  window.addEventListener("ICONEX_RELAY_RESPONSE", eventHandler);

  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <Grid container className={classes.container} spacing={0}>
          <Grid className={classes.grid} item xs={4} md={4} lg={4}>
            <img src={photo} />
          </Grid>
          <Grid className={classes.grid} item xs={8} md={8} lg={8}>
            <Typography>My Name</Typography>
          </Grid>
          <Grid>
            <IconButton href="https://localhost:8080/oauth/login/facebook">
              <Facebook />
            </IconButton>
            <IconButton href="https://localhost:8080/oauth/login/google">
              <Facebook />
            </IconButton>
            <IconButton href="https://localhost:8080/oauth/login/kakao">
              <Facebook />
            </IconButton>
            <IconButton onClick={aa}>
              <Facebook />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

export default UserInfo;
