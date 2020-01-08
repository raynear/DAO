import React from "react";
import { Paper, Typography, FormControlLabel, FormControl, RadioGroup, Radio, Button, Grid, Divider, Tooltip, Chip } from "@material-ui/core";
import { ArrowLeft, ArrowRight, Done as DoneIcon, HowToVote as VoteIcon, NotInterested as DisapproveIcon } from "@material-ui/icons";
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, Tooltip as BarTooltip } from "recharts";
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
    // console.log("SelectItemList", props.proposal.select_item);
    return (
      <table>
        <tbody>
          {props.proposal.select_item.map(
            (selectItem: any, idx: number) => {
              let voteRate = 0;
              try {
                voteRate = props.votedPowerRate[idx].voted;
              } catch {
                voteRate = 0;
              } finally {
              }
              return (
                <tr key={idx}>
                  <td><ArrowRight /></td>
                  <td style={{ minWidth: "100px" }}>
                    {props.votedIdx === idx &&
                      <Tooltip key={idx} title="Voted" placement="left">
                        <Typography variant="h6">{selectItem}</Typography>
                      </Tooltip>
                    }
                    {props.votedIdx !== idx &&
                      <Typography variant="h6">{selectItem}</Typography>
                    }
                  </td>
                  <td align="right" style={{ minWidth: "50px" }}><Typography variant="h6">{" " + voteRate + " %"}</Typography></td>
                  <td align="right" style={{ minWidth: "200px" }}><Typography variant="h6">{props.votedPowerRate && " " + props.votedPowerRate[idx].icx.toLocaleString() + " ICX"}</Typography></td>
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
          {props.proposal.select_item.map(
            (selectItem: any, idx: number) => {
              let voteRate = 0;
              try {
                voteRate = props.votedPowerRate[idx].voted;
              } catch {
                voteRate = 0;
              } finally {
              }
              return (
                <FormControlLabel
                  key={idx}
                  control={<Radio />}
                  value={idx}
                  label={selectItem + " " + voteRate + " %" + " " + props.votedPowerRate[idx].icx.toLocaleString() + " ICX"}
                />
              );
            }
          )}
        </RadioGroup>
      </FormControl>
    );
  }

  function SelectList() {
    const expireAt = new Date(props.proposal.expire_date);
    if (expireAt.getTime() > Date.now() &&
      (props.myPRep || props.owner) &&
      props.votedIdx === -1 &&
      props.proposal.status === "Voting") {
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

  function ActionButton() {
    const expireAt = new Date(props.proposal.expire_date);
    if (expireAt.getTime() < Date.now() && props.owner) {
      return <FinalizeVoteButton />;
    }
    if (expireAt.getTime() > Date.now() && (props.myPRep || props.owner) && props.votedIdx === -1) {
      // return (<><FinalizeVoteButton /><VoteButton /></>);
      // TODO : 원복해야 함.
      // 빠른 finalize를 위해 우선 변경한 버튼
      return (<VoteButton />);
    }
    return <></>;
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
  if (props.proposal.status === "Approved") {
    icon = <DoneIcon />;
  } else if (props.proposal.status === "Voting") {
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
              label={props.proposal.status}
              color="primary"
              style={{ float: "left" }}
            />
            <br />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <div className={classes.right}>
              <div style={{ float: "left" }}>
                <Typography variant="h4" color="textPrimary" gutterBottom>
                  <b>
                    {props.proposal.id + ". " + props.proposal.subject}{" "}
                  </b>
                </Typography>
              </div>
              <div onClick={TwitterShare} style={{ float: "right" }}><img src={twitterImg} width="40" alt="트위터 공유하기" /></div>
              <div onClick={FacebookShare} style={{ float: "right" }}><img src={facebookImg} width="40" alt="페이스북 공유하기" /></div>
            </div>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="body1" color="textPrimary">
              Proposer : {props.PRep}
            </Typography>
            <Typography variant="body1" color="textPrimary">
              Ending Time : {props.proposal.expire_date}
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <br />
            <Divider variant="fullWidth" />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="caption" color="textSecondary">
              VOTING PROGRESS
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={8} lg={8}>
            <BarChart width={600} height={70} data={[{ name: "Electoral Threshold", voted: props.voteData.voted, left: props.voteData.th, "100": 100 - props.voteData.voted - props.voteData.th }]} layout="vertical">
              <Bar dataKey="voted" stackId="a" fill="#82ca9d" />
              <Bar dataKey="left" stackId="a" fill="#888888" />
              <Bar dataKey="100" stackId="a" fill="#FFFFFF" />
              <BarTooltip cursor={false} />
              <ReferenceLine x={props.proposal.electoral_threshold} label={props.proposal.electoral_threshold} stroke="red" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis hide dataKey="name" type="category" />
            </BarChart>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={4} lg={4}>
            <table>
              <tbody>
                <tr>
                  <td style={{ float: "left" }}>
                    <Typography variant="body1" color="textPrimary">
                      {" "}Total # of delegate :
                    </Typography>
                  </td>
                  <td style={{ float: "right" }}>
                    <Typography variant="body1" color="textPrimary">
                      {props.voteData.totalDelegate.toLocaleString() + " ICX"}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td style={{ float: "left" }}>
                    <Typography variant="body1" color="textPrimary">
                      {" "}Total # of votes :
                    </Typography>
                  </td>
                  <td style={{ float: "right" }}>
                    <Typography variant="body1" color="textPrimary">
                      {props.voteData.totalVoted.toLocaleString() + " ICX"}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td style={{ float: "left" }}>
                    <Typography variant="body1" color="textPrimary">
                      {" "}Your # of votes :
                    </Typography>
                  </td>
                  <td style={{ float: "right" }}>
                    <Typography variant="body1" color="textPrimary">
                      {props.myVotingPower.toLocaleString() + " ICX"}
                    </Typography>
                  </td>
                </tr>
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
            <SelectList />
          </Grid>
          <Grid item className={clsx(classes.grid, classes.center)} xs={12} md={12} lg={12}>
            <br />
            <ActionButton />
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
              initialValue={props.proposal.contents}
            />
          </Grid>
        </Grid>
      </Paper>
    </Grid >
  );
}

export default Proposal;
