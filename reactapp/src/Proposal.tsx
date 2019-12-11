import React, { Fragment } from "react";
import { Link } from "react-router-dom";

import { Paper, Typography, FormControlLabel, FormControl, RadioGroup, Radio, Button, Grid, Divider, Tooltip } from "@material-ui/core";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip as ChartTooltip, Bar } from "recharts";

import ReactMarkdown from "react-markdown";

import useStyles from "./Style";


function Proposal(props: any) {
  console.log("Proposal props", props);
  // const forceUpdate = useForceUpdate;

  const classes = useStyles();

  function SelectItemList() {
    console.log("SelectItemList", props.data.proposal.selectitemmodelSet);
    return (
      <ul>
        {props.data.proposal.selectitemmodelSet.map(
          (selectItem: any) => {
            if (props.votedIdx === selectItem.index) {
              return (
                <li key={selectItem.index}>
                  <Tooltip title="You Vote!">
                    <Typography variant="body1" color="primary">
                      {selectItem.contents} {"(" + props.votedPower[selectItem.index].toString() + ")"}
                    </Typography>
                  </Tooltip>
                </li>
              );
            } else {
              return (
                <li key={selectItem.index}>
                  <Typography variant="body1" color="textPrimary">
                    {selectItem.contents} {"(" + props.votedPower[selectItem.index].toString() + ")"}
                  </Typography>
                </li>
              );
            }
          }
        )}
      </ul>
    );
  }

  function RadioButtons() {
    return (
      <FormControl>
        <RadioGroup value={props.voteSelect} onChange={props.handleChange}>
          {props.data.proposal.selectitemmodelSet.map(
            (selectItem: any) => (
              <FormControlLabel
                key={selectItem.index}
                control={<Radio />}
                value={selectItem.index}
                label={selectItem.contents}
              />
            )
          )}
        </RadioGroup>
      </FormControl>
    );
  }

  function SelectList() {
    console.log("Environment for SelectList", props.data.proposal.published, props.votedIdx, props.myPRep)
    if (props.data.proposal.published === false || props.votedIdx > 0 || !props.myPRep) {
      console.log("just list");
      return (<SelectItemList />);
    } else {
      console.log("votable list");
      return (<RadioButtons />);
    }
  }

  function VoteButton() {
    return (
      <Button
        variant="contained"
        color="primary"
        disabled={props.voteSelect === -1}
        onClick={props.Vote}
      >
        Vote
      </Button>
    );
  }

  function PublishButton() {
    return (
      <Fragment>
        <Button variant="outlined" color="primary">
          <Link to={"/EditProposal/" + props.id}>
            Edit
          </Link>
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={props.Publish}
        >
          Publish
        </Button>
      </Fragment>
    );
  }

  function ActionButton() {
    if (props.data.proposal.published && props.myPRep && props.votedIdx === -1) {
      return <VoteButton />;
    }
    if (!props.data.proposal.published && props.owner) {
      return <PublishButton />;
    }

    return <div>{" "}</div>
  }

  if (props.loading) return <p>Loading...</p>;
  if (props.error) return <p>Error!:</p>;
  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <Grid container className={classes.container}>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              <b>{props.data.proposal.id}.</b> P-Rep {props.data.proposal.prep.username}
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="h5" color="textPrimary" gutterBottom>
              {props.data.proposal.subject}
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="caption" color="textPrimary">
              Published : {(props.data.proposal.published).toString()}
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="caption" color="textPrimary">
              expire at : {props.data.proposal.expireAt}
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <br />
            <Divider variant="fullWidth" />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <ReactMarkdown
              source={props.data.proposal.contents.split("<br>").join("\n")}
              skipHtml={true}
              escapeHtml={false}
            />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <br />
            <Divider variant="fullWidth" />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <SelectList />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <BarChart
              width={200}
              height={200}
              data={props.voteData}
              margin={{
                top: 20, right: 20, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip />
              <Bar dataKey="th" fill="#8884d8" background={{ fill: '#EEEEEE' }} />
              <Bar dataKey="voted" fill="#3377ff" background={{ fill: '#EEEEEE' }} />
            </BarChart>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <br />
            <ActionButton />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

export default Proposal;
