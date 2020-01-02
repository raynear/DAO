import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { Paper, Typography, FormControlLabel, FormControl, RadioGroup, Radio, Button, Grid, Divider, Tooltip, Chip } from "@material-ui/core";
import { ArrowRight, Done as DoneIcon, HowToVote as VoteIcon, NotInterested as DisapproveIcon } from "@material-ui/icons";
import { BarChart, Bar, XAxis, YAxis, Tooltip as BarTooltip } from "recharts";
import clsx from "clsx";

import { TUIViewer } from "./TUIEditor";

import useStyles from "./Style";

import facebookImg from "./img/facebook.png";
import twitterImg from "./img/twitter.png";

function Proposal(props: any) {
  console.log("Proposal props", props);
  // const forceUpdate = useForceUpdate;

  const classes = useStyles();

  function SelectItemList() {
    // console.log("SelectItemList", props.data.proposal.selectitemmodelSet);
    return (
      <table>
        <tbody>
          {props.data.proposal.selectitemmodelSet.map(
            (selectItem: any) => {
              let voteRate = 0;
              try {
                voteRate = props.votedPowerRate[selectItem.index].voted;
              } catch {
                voteRate = 0;
              } finally {
              }
              return (
                <tr key={selectItem.index}>
                  <td><ArrowRight /></td>
                  <td style={{ minWidth: "100px" }}>
                    {props.votedIdx === selectItem.index &&
                      <Tooltip key={selectItem.index} title="Voted" placement="left">
                        <Typography variant="h6">{selectItem.contents}</Typography>
                      </Tooltip>
                    }
                    {props.votedIdx !== selectItem.index &&
                      <Typography variant="h6">{selectItem.contents}</Typography>
                    }
                  </td>
                  <td align="right" style={{ minWidth: "50px" }}><Typography variant="h6">{" " + voteRate + " %"}</Typography></td>
                  <td align="right" style={{ minWidth: "200px" }}><Typography variant="h6">{props.votedPower && " " + props.votedPower[selectItem.index].toLocaleString() + " ICX"}</Typography></td>
                </tr>
              );
            }
          )}
        </tbody>
      </table >
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
    if (props.data.proposal.published && (props.myPRep || props.owner) && props.votedIdx === -1) {
      return (<RadioButtons />);
    }
    return (<SelectItemList />);
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

  function FinalizeVoteButton() {
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={props.FinalizeVote}
      >
        Finalize Vote
      </Button>
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
          onClick={props.Publish}
        >
          Publish
        </Button>
      </Fragment>
    );
  }

  function ActionButton() {
    const expireAt = new Date(props.data.proposal.expireAt);
    if (expireAt.getTime() < Date.now() && props.owner && props.data.proposal.published) {
      return <FinalizeVoteButton />;
    }
    if (props.data.proposal.published && (props.myPRep || props.owner) && props.votedIdx === -1) {
      return (<><VoteButton /><FinalizeVoteButton /></>);
    }
    if (!props.data.proposal.published && props.owner) {
      return (<><PublishButton /><FinalizeVoteButton /></>);
    }
    return <FinalizeVoteButton />;
  }

  function FacebookShare() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(document.URL) + '&t=' + encodeURIComponent(document.title), 'facebooksharedialog', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
  }

  function TwitterShare() {
    window.open('https://twitter.com/intent/tweet?text=[%EA%B3%B5%EC%9C%A0]%20' + encodeURIComponent(document.URL) + '%20-%20' + encodeURIComponent(document.title), 'twittersharedialog', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
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
        <Grid container className={classes.container}>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography className={classes.title} variant="body1" color="textSecondary" gutterBottom>
              <Chip
                icon={icon}
                size="small"
                label={props.data.proposal.status}
                clickable
                color="primary"
              />{"  "}
              <b>{props.data.proposal.id}.</b> {props.data.proposal.prepPid}
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
              <div onClick={TwitterShare} style={{ float: "right" }}><img src={twitterImg} width="40" alt="트위터 공유하기" /></div>
              <div onClick={FacebookShare} style={{ float: "right" }}><img src={facebookImg} width="40" alt="페이스북 공유하기" /></div>
            </div>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="body1" color="textPrimary">
              Proposer : {props.data.proposal.prep.username}
            </Typography>
            <Typography variant="body1" color="textPrimary">
              expire at : {props.data.proposal.expireAt}
            </Typography>
            <Typography variant="body1" color="textPrimary">
              Published : {(props.data.proposal.published).toString()}
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <br />
            <Divider variant="fullWidth" />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="caption" color="textSecondary">
              VOTING WEIGH
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={8} lg={8}>
            <BarChart width={600} height={40} data={[{ name: "Electoral Threshold", voted: props.voteData.voted, left: props.voteData.th, "100": 100 - props.voteData.voted - props.voteData.th }]} layout="vertical">
              <Bar dataKey="voted" stackId="a" fill="#82ca9d" />
              <Bar dataKey="left" stackId="a" fill="#888888" />
              <Bar dataKey="100" stackId="a" fill="#FFFFFF" />
              <BarTooltip cursor={false} />
              <XAxis hide type="number" />
              <YAxis hide dataKey="name" type="category" />
            </BarChart>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={4} lg={4}>
            <div>
              <Typography variant="body1" color="textPrimary">
                {" "}Total # of votes : {props.voteData.totalVoted.toLocaleString() + " ICX"}
              </Typography>
              <Typography variant="body1" color="textPrimary">
                {" "}Total # of delegates : {props.voteData.totalDelegate.toLocaleString() + " ICX"}
              </Typography>
              <Typography variant="body1" color="textPrimary">
                {" "}Your # of votes : {props.voteData.myVotingPower.toLocaleString() + " ICX"}
              </Typography>
            </div>
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
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="caption" color="textSecondary">
              SELECT ITEMS
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <SelectList />
          </Grid>
          <Grid item className={clsx(classes.grid, classes.center)} xs={12} md={12} lg={12}>
            <br />
            <ActionButton />
          </Grid>
        </Grid>
      </Paper>
    </Grid >
  );
}

export default Proposal;
