import React from "react";
import { Link } from "react-router-dom";

import { Paper, Typography, Grid, Button, TextField, Chip } from "@material-ui/core";
import { Done as DoneIcon, HowToVote as VoteIcon, NotInterested as DisapproveIcon } from "@material-ui/icons";
import clsx from "clsx";

import useStyles from "./Style";

function Proposals(props: any) {
  console.log("Proposals props", props);
  const classes = useStyles();

  // if (props.loading) return <p>Loading...</p>;
  // if (props.error) { console.log(props.error); return <p>Error!</p>; }
  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <Grid container className={classes.container} spacing={0}>
          <Grid item className={classes.item} xs={12} md={8} lg={8}>
            <img src={props.PRepInfo.logo} width="100" />
            <a href={props.PRepInfo.website} style={{ textDecoration: "none", color: "#000000" }}>
              <Typography variant="h4">{props.PRepInfo.name}</Typography>
            </a>
          </Grid>
          <Grid item className={classes.item} xs={12} md={4} lg={4}>
            <Typography variant="h6">Total Delegate :{props.PRepInfo.totalDelegation.toLocaleString()}</Typography>
            <Typography variant="h6">My Voting Power :{props.PRepInfo.myVotingPower}</Typography>
          </Grid>
        </Grid>
      </Paper>
      <Paper className={classes.paper}>
        <Grid container className={classes.container} spacing={0}>
          <Grid item className={classes.item} xs={12} lg={12}>
            <Grid container className={classes.container} spacing={0}>
              <Grid item className={classes.item} xs={4} lg={4}>
                <TextField
                  className={classes.textField}
                  label="first"
                  type="number"
                  value={props.filterValues.first}
                  onChange={props.handleChange("first")}
                />
              </Grid>
              <Grid item className={classes.item} xs={4} lg={4}>
                <TextField
                  className={classes.textField}
                  label="end"
                  type="number"
                  value={props.filterValues.end}
                  onChange={props.handleChange("end")}
                />
              </Grid>
              <Grid item className={clsx(classes.item, classes.center)} xs={4} lg={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => props.queryFilters()}
                >
                  read!
                </Button>
              </Grid>
            </Grid>
          </Grid>
          {props.proposals.map((item: any, idx: number) => {
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
                  <Grid container className={classes.container}>
                    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
                      <Chip
                        icon={icon}
                        size="small"
                        label={item.status}
                        color="primary"
                      />
                    </Grid>
                    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
                      <Typography variant="h5" color="textPrimary" gutterBottom>
                        <Link className={classes.link} to={"/Proposal/" + props.PRep + "/" + item.id} color="textPrimary">
                          <b>{item.id}.</b>{" "}{item.subject}
                        </Link>
                      </Typography>
                    </Grid>
                    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
                      <ul>
                        {item.select_item.map((selectItem: any, idx: number) => (
                          <Typography variant="h6" key={idx} color="textSecondary">
                            <li>
                              {selectItem}
                            </li>
                          </Typography>
                        ))}
                      </ul>
                    </Grid>
                  </Grid>
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
