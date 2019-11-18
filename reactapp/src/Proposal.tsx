import React, { useEffect, useState, Fragment } from "react";
import {
  Paper,
  Typography,
  FormControlLabel,
  FormControl,
  RadioGroup,
  Radio,
  Button,
  Grid
} from "@material-ui/core";

import gql from "graphql-tag";
import { useApolloClient } from "@apollo/react-hooks";

import ReactMarkdown from "react-markdown";

import useStyles from "./Style";

interface selectItem {
  index: 0;
  contents: "";
}

function Proposal(props: any) {
  const classes = useStyles();

  const client = useApolloClient();

  const [voteSelect, setVoteSelect] = useState();
  const [username, setUsername] = useState("");

  const id = props.match.params.id;
  const proposal = props.proposal;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoteSelect(parseInt((event.target as HTMLInputElement).value));
  };

  function GetVotersVotingPower(voter: string) {
    return 100;
  }

  function SelectItemList(props: any) {
    let VoteItem: number[] = [];
    for (let i in proposal.selectitemmodelSet) {
      let VotingPower = 0;
      for (let j in proposal.selectitemmodelSet[i].votemodelSet) {
        VotingPower += GetVotersVotingPower(
          proposal.selectitemmodelSet[i].votemodelSet[j].voter.username
        );
      }
      VoteItem.push(VotingPower);
    }
    return (
      <Fragment>
        {proposal.selectitemmodelSet.map(
          (selectItem: selectItem, idx: number) => {
            if (props.voted === idx) {
              return (
                <Typography key={idx}>
                  {selectItem.contents}
                  {"(" + VoteItem[idx] + ")"} {"<= You Voted"}
                </Typography>
              );
            } else {
              return (
                <Typography key={idx}>
                  {selectItem.contents} {"(" + VoteItem[idx] + ")"}
                </Typography>
              );
            }
          }
        )}
      </Fragment>
    );
  }

  function RadioButtons() {
    return (
      <FormControl>
        <RadioGroup value={voteSelect} onChange={handleChange}>
          {proposal.selectitemmodelSet.map(
            (selectItem: selectItem, idx: number) => (
              <FormControlLabel
                key={idx}
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

  useEffect(() => {
    client
      .query({
        query: gql`
          {
            username @client
          }
        `
      })
      .then(result => {
        if (username === "" && result.data !== null) {
          setUsername(result.data.username);
        }
      });
  });

  function SelectList() {
    let SelectList = proposal.selectitemmodelSet;

    let votedIdx = -1;
    let flag = false;
    for (let i in SelectList) {
      for (let j in SelectList[i].votemodelSet) {
        if (username === SelectList[i].votemodelSet[j].voter.username) {
          votedIdx = parseInt(i);
          flag = true;
          break;
        }
      }
    }

    if (proposal.published === false || flag) {
      return <SelectItemList voted={votedIdx} />;
    } else {
      return <RadioButtons />;
    }
  }

  function VoteButton() {
    return (
      <Button
        variant="contained"
        color="primary"
        disabled={voteSelect === -1}
        onClick={() => props.Vote(voteSelect)}
      >
        Vote
      </Button>
    );
  }

  function PublishButton() {
    return (
      <Fragment>
        <Button variant="outlined" color="primary" href={"/EditProposal/" + id}>
          Edit
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => props.Publish()}
        >
          Publish
        </Button>
      </Fragment>
    );
  }

  function ActionButton() {
    let SelectList = proposal.selectitemmodelSet;

    let flag = false;
    for (let i in SelectList) {
      for (let j in SelectList[i].votemodelSet) {
        if (username === SelectList[i].votemodelSet[j].voter.username) {
          flag = true;
          break;
        }
      }
    }

    if (flag) {
      return <div> </div>;
    } else if (proposal.published) {
      return <VoteButton />;
    } else {
      return <PublishButton />;
    }
  }

  return (
    <Grid className={classes.grid} item xs={12} lg={12}>
      <Paper className={classes.paper}>
        <Typography
          className={classes.title}
          color="textSecondary"
          gutterBottom
        >
          {" "}
          Type Of Proposal
        </Typography>
        <Typography variant="h5" color="textPrimary" gutterBottom>
          {proposal.subject}
        </Typography>
        <ReactMarkdown
          source={proposal.contents.split("\n").join("  \n")}
          skipHtml={false}
          escapeHtml={false}
        />
        <Typography variant="h6" color="textPrimary">
          expire at:
          {proposal.expireAt}
        </Typography>
        <SelectList />
        <br />
        <ActionButton />
      </Paper>
    </Grid>
  );
}

export default Proposal;
