import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { Paper, Typography, Button, Grid, Divider, Chip } from "@material-ui/core";
import { ArrowLeft, ArrowRight, Done as DoneIcon, HowToVote as VoteIcon, NotInterested as DisapproveIcon } from "@material-ui/icons";
import { BarChart, Bar, XAxis, YAxis, Tooltip as BarTooltip } from "recharts";
import clsx from "clsx";

import { TUIViewer } from "./TUIEditor";

import useStyles from "./Style";

function NoteProposal(props: any) {
  // console.log("NoteProposal props", props);
  // const forceUpdate = useForceUpdate;

  const classes = useStyles();

  function SelectItemList() {
    // console.log("SelectItemList", props.data.proposal.selectitemmodelSet);
    return (
      <table>
        <tbody>
          {props.data.proposal.selectitemmodelSet.map(
            (selectItem: any) => {
              return (
                <tr key={selectItem.index}>
                  <td><ArrowRight /></td>
                  <td style={{ minWidth: "100px" }}>
                    <Typography variant="h6">{selectItem.contents}</Typography>
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table >
    );
  }

  function PublishButton() {
    return (
      <Fragment>
        <Button variant="outlined" color="primary">
          <Link to={"/EditProposal/" + props.id} className={classes.link}>
            Edit
          </Link>
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={props.publish}
        >
          Publish
        </Button>
      </Fragment>
    );
  }

  if (props.loading) return <p>Loading...</p>;
  if (props.error) return <p>Error!:</p>;
  let icon;
  if (props.data.proposal.status === "Approved") {
    icon = <DoneIcon />;
  } else if (props.data.proposal.status === "Voting") {
    icon = <VoteIcon />;
  } else {
    icon = <DisapproveIcon />;
  }
  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <Button
          variant="outlined"
          color="primary"
          onClick={props.back}
          style={{ width: "200px", float: "right" }}
          startIcon={<ArrowLeft />}
        >
          Back
        </Button>
      </Paper>

      <Paper className={classes.paper}>
        <Grid container className={classes.container}>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Chip
              icon={icon}
              size="small"
              label={props.data.proposal.status}
              color="primary"
            />{"  "}
            <Typography className={classes.title} variant="body1" color="textSecondary" gutterBottom>
              <b>{props.data.proposal.ID}.</b>
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <div className={classes.right}>
              <div style={{ float: "left" }}>
                <Typography variant="h4" color="textPrimary" gutterBottom>
                  <b>
                    {props.data.proposal.subject}{" "}
                  </b>
                </Typography>
              </div>
            </div>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="body1" color="textPrimary">
              Proposer : {props.data.proposal.prep.username}
            </Typography>
            <Typography variant="body1" color="textPrimary">
              Ending time : {new Date(props.data.proposal.expireAt).toString()}
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <br />
            <Divider variant="fullWidth" />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="caption" color="textSecondary">
              Thresholds
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={8} lg={8}>
            <BarChart width={600} height={80} data={[{ name: "Thresholds", "Minimum approval rate": props.data.proposal.winningTh, "Quorum": props.data.proposal.electoralTh, "100": 100 }]} layout="vertical">
              <Bar dataKey="Minimum approval rate" fill="#82ca9d" />
              <Bar dataKey="Quorum" fill="#3888c8" />
              <BarTooltip cursor={false} />
              <XAxis type="number" />
              <YAxis hide dataKey="name" type="category" />
            </BarChart>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={4} lg={4}>
            <table>
              <tbody>
                <tr>
                  <td style={{ float: "left" }}>
                    <Typography variant="body1" color="textPrimary">
                      {" "}Total Delegates :
                    </Typography>
                  </td>
                  <td style={{ float: "right" }}>
                    <Typography variant="body1" color="textPrimary">
                      {props.value.totalVotingPower.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " ICX"}
                    </Typography>
                  </td>
                </tr>
                {/*
                <tr>
                  <td style={{ float: "left" }}>
                    <Typography variant="body1" color="textPrimary">
                      {" "}Your # of votes :
                    </Typography>
                  </td>
                  <td style={{ float: "right" }}>
                    <Typography variant="body1" color="textPrimary">
                      {props.value.pRepVotingPower.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " ICX"}
                    </Typography>
                  </td>
                </tr>
                */}
              </tbody>
            </table>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <br />
            <Divider variant="fullWidth" />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="caption" color="textSecondary">
              SELECT ITEMS
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <SelectItemList />
          </Grid>
          <Grid item className={clsx(classes.grid, classes.center)} xs={12} md={12} lg={12}>
            <br />
            <PublishButton />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <br />
            <Divider variant="fullWidth" />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="caption" color="textSecondary">
              DESCRIPTION
            </Typography>
          </Grid>
          <Grid item className={clsx(classes.paddingSide, classes.viewer)} xs={12} md={12} lg={12}>
            <TUIViewer
              initialValue={props.data.proposal.contents}
            />
          </Grid>
        </Grid>
      </Paper>
    </Grid >
  );
}

export default NoteProposal;
