import React from "react";
import { Link } from "react-router-dom";

import { Paper, Typography, Grid, Button, TextField, Chip } from "@material-ui/core";
import { Done as DoneIcon, HowToVote as VoteIcon, NotInterested as DisapproveIcon } from "@material-ui/icons";
import clsx from "clsx";

import useStyles from "./Style";

function Proposals(props: any) {
  // console.log("Proposals props", props);
  const classes = useStyles();

  if (props.loading) return <p>Loading...</p>;
  if (props.error) return <p>Error!</p>;
  // console.log(props.data);
  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <Grid container className={classes.container} spacing={0}>
          <Grid item className={classes.item} xs={12} lg={12}>
            <Grid container className={classes.container} spacing={0}>
              <Grid item className={classes.item} xs={3} lg={3}>
                <TextField
                  className={classes.textField}
                  label="search"
                  type="text"
                  value={props.filterValues.search}
                  onChange={props.handleChange("search")}
                />
              </Grid>
              <Grid item className={classes.item} xs={3} lg={3}>
                <TextField
                  className={classes.textField}
                  label="first"
                  type="number"
                  value={props.filterValues.first}
                  onChange={props.handleChange("first")}
                />
              </Grid>
              <Grid item className={classes.item} xs={3} lg={3}>
                <TextField
                  className={classes.textField}
                  label="skip"
                  type="number"
                  value={props.filterValues.skip}
                  onChange={props.handleChange("skip")}
                />
              </Grid>
              <Grid item className={clsx(classes.item, classes.center)} xs={3} lg={3}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => props.queryFilters()}
                >
                  fetch!
                </Button>
              </Grid>
            </Grid>
          </Grid>
          {props.data.proposals.map((item: any, idx: number) => {
            let icon;
            if (item.status === "Approved") {
              icon = <DoneIcon />;
            } else if (item.status === "Voting") {
              icon = <VoteIcon />;
            } else {
              icon = <DisapproveIcon />;
            }
            return (
              <Grid item className={classes.item} key={idx} xs={12} sm={6} md={4} lg={3}>
                <Paper className={classes.paper}>
                  <Chip
                    icon={icon}
                    size="small"
                    label={item.status}
                    clickable
                    color="primary"
                  />
                  <Typography className={classes.title} color="textSecondary" gutterBottom>
                    <b>{item.id}.</b> {item.prep.username} - {item.prepPid}
                  </Typography>
                  <Typography variant="h5" color="textPrimary" gutterBottom>
                    <Link className={classes.link} to={"/Proposal/" + props.PRep + "/" + item.id} color="textPrimary">
                      {item.subject}
                    </Link>
                  </Typography>
                  <ul>
                    {item.selectitemmodelSet.map((selectItem: any, idx: number) => (
                      <Typography variant="h6" key={idx} color="textSecondary">
                        <li>
                          {selectItem.contents}
                        </li>
                      </Typography>
                    ))}
                  </ul>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Grid >
  );
}

export default Proposals;
