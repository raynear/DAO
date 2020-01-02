import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { Paper, Typography, FormControlLabel, FormControl, RadioGroup, Radio, Button, Grid, Divider, Tooltip, Slider, Chip } from "@material-ui/core";
import { Done as DoneIcon, HowToVote as VoteIcon, NotInterested as DisapproveIcon } from "@material-ui/icons";
// import clsx from "clsx";

import { TUIViewer } from "./TUIEditor";

import useStyles from "./Style";

import facebookImg from "./img/facebook.png";
import twitterImg from "./img/twitter.png";

function Proposal(props: any) {
  // console.log("Proposal props", props);
  // const forceUpdate = useForceUpdate;

  const classes = useStyles();

  function SelectItemList() {
    //    // console.log("SelectItemList", props.data.proposal.selectitemmodelSet);
    return (
      <ul>
        {props.data.proposal.selectitemmodelSet.map(
          (selectItem: any) => {
            if (props.votedIdx === selectItem.index) {
              return (
                <li key={selectItem.index}>
                  <Tooltip title="Voted" placement="left">
                    <Typography variant="h6" color="textPrimary">
                      {selectItem.contents} {props.votedPower && "(" + props.votedPower[selectItem.index].toString() + ")"}
                    </Typography>
                  </Tooltip>
                </li>
              );
            } else {
              return (
                <li key={selectItem.index}>
                  <Typography variant="h6" color="textPrimary">
                    {selectItem.contents} {props.votedPower && "(" + props.votedPower[selectItem.index].toString() + ")"}
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
  const sliderTest = 40;
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
              <b>{props.data.proposal.id}.</b> {props.data.proposal.prep.username} - {props.data.proposal.prepPid}             </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="h5" color="textPrimary" gutterBottom>
              {props.data.proposal.subject}{" "}
              <Chip
                icon={icon}
                size="small"
                label={props.data.proposal.status}
                clickable
                color="primary"
              />
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="body1" color="textPrimary">
              Published : {(props.data.proposal.published).toString()}
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="body1" color="textPrimary">
              expire at : {props.data.proposal.expireAt}
            </Typography>
            <div className={classes.right}>
              <div onClick={TwitterShare} style={{ float: "right" }}><img src={twitterImg} width="40" alt="트위터 공유하기" /></div>
              <div onClick={FacebookShare} style={{ float: "right" }}><img src={facebookImg} width="40" alt="페이스북 공유하기" /></div>
            </div>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Slider
              disabled
              defaultValue={sliderTest/*props.voteData[0].voted*/}
              aria-labelledby="discrete-slider-custom"
              valueLabelDisplay="auto"
              marks={[{ value: 0, label: '0' }, { value: 100, label: '100' }]}
            />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <br />
            <Divider variant="fullWidth" />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <TUIViewer
              initialValue={props.data.proposal.contents}
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
          <Grid item className={classes.grid} xs={12} md={12} lg={12}>
            <br />
            <ActionButton />
          </Grid>
        </Grid>
      </Paper>
    </Grid >
  );
}

export default Proposal;
