import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { Paper, Typography, Button, Grid, Divider, Chip } from "@material-ui/core";
import { ArrowRight, Done as DoneIcon, HowToVote as VoteIcon, NotInterested as DisapproveIcon } from "@material-ui/icons";
import { BarChart, Bar, XAxis, YAxis, Tooltip as BarTooltip } from "recharts";
import clsx from "clsx";

import { TUIViewer } from "./TUIEditor";

import useStyles from "./Style";

import facebookImg from "./img/facebook.png";
import twitterImg from "./img/twitter.png";

function NoteProposal(props: any) {
  console.log("NoteProposal props", props);
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
          onClick={props.Publish}
        >
          Publish
        </Button>
      </Fragment>
    );
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
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <br />
            <Divider variant="fullWidth" />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="caption" color="textSecondary">
              Threshold
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={8} lg={8}>
            <BarChart width={600} height={40} data={[{ name: "Threshold", winning: props.data.proposal.winningTh, electoral: props.data.proposal.electoralTh, "100": 100 }]} layout="vertical">
              <Bar dataKey="winning" fill="#82ca9d" />
              <Bar dataKey="electoral" fill="#3888c8" />
              <BarTooltip cursor={false} />
              <XAxis hide type="number" />
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
                      {props.value.totalVotingPower}
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
                      {props.value.pRepVotingPower}
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
