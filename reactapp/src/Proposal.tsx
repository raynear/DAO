import React, { useEffect, useState, Fragment } from "react";
import { Link, withRouter } from "react-router-dom";
import { Paper, Typography, FormControlLabel, FormControl, RadioGroup, Radio, Button, Grid } from "@material-ui/core";

import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";

import gql from "graphql-tag";
import { useApolloClient } from "@apollo/react-hooks";

import ReactMarkdown from "react-markdown";
import { json_rpc_call, governance_call } from "./IconConnect";

import useStyles from "./Style";

let data = [
  { name: 'quorum', th: 0, voted: 0 },
  { name: 'token', th: 0, voted: 0 },
];

interface selectItem {
  index: 0;
  contents: "";
}

function Proposal(props: any) {
  console.log("Proposal props", props);
  const classes = useStyles();

  const client = useApolloClient();

  const [voteSelect, setVoteSelect] = useState();
  const [username, setUsername] = useState("");

  const id = props.match.params.ID;
  const proposal = props.proposal;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoteSelect(parseInt((event.target as HTMLInputElement).value));
  };

  function GetVotersVotingPower(voter: string) {
    return 100;
  }

  function SelectItemList(props: any) {
    console.log("print proposal", proposal);
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
      .query({ query: gql`{username @client}` })
      .then(result => {
        if (username === "" && result.data !== null) {
          setUsername(result.data.username);
        }
      });

    data[0].th = proposal.quorumRate;
    data[1].th = proposal.tokenRate;
  });

  function SelectList() {
    let SelectList = proposal.selectitemmodelSet;

    let votedIdx = -1;
    let votedFlag = false;
    for (let i in SelectList) {
      for (let j in SelectList[i].votemodelSet) {
        if (username === SelectList[i].votemodelSet[j].voter.username) {
          votedIdx = parseInt(i);
          votedFlag = true;
          break;
        }
      }
    }

    if (votedIdx >= 0) {
      data[0].voted = votedIdx;
      data[1].voted = votedIdx;
    }

    if (username) {
      json_rpc_call("GetVerifyInfoByID", { "_ID": username }).then((result: any) => {
        const verifyData = JSON.parse(result);
        let user_address;
        try {
          user_address = verifyData.address;
        }
        catch{
          user_address = ""
        }
        let myPRep = false;
        let result2 = JSON.parse(`{
          "result": {
            "status": "0x1",
            "totalDelegated": "0xa688906bd8b0000",
            "totalFined": "0x1300",
            "votingPower": "0x3782dace9d90000",
            "delegations": [
              {
                "address": "hxd1a3147ac75edc40d1094b8ec4f6a2bbd77ffbd4",
                "value": "0x3782dace9d90000",
                "status": "0x0"
              },
              {
                "address": "hx1d6463e4628ee52a7f751e9d500a79222a7f3935",
                "value": "0x3782dace9d90000",
                "status": "0x0"
              },
              {
                "address": "hxb6bc0bf95d90cb3cd5b3abafd9682a62f36cc826",
                "value": "0x6f05b59d3b20000",
                "status": "0x2",
                "fined": "0x1300"
              }
            ]
          }
        }`);
        //        governance_call("getDelegation", { "address": user_address }).then((result2: any) => {
        console.log("verify2", result2);
        let delegateList;
        try {
          delegateList = result2.result.delegations;
        }
        catch {
          delegateList = [];
        }
        for (let i = 0; i < delegateList.length; i++) {
          if (delegateList[i].address === user_address) {
            myPRep = true;
            break;
          }
        }
        //       });
        if (proposal.published === false || votedFlag || !myPRep) {
          console.log("just list");
          return <SelectItemList voted={votedIdx} />;
        } else {
          console.log("votable list");
          return <RadioButtons />;
        }
      });
    }

    return <div>{username}</div>
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
        <Button variant="outlined" color="primary">
          <Link to={"/EditProposal/" + id}>
            Edit
          </Link>
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
        <Typography variant="caption" color="textPrimary">
          expire at:
          {proposal.expireAt}
        </Typography>
        <br />
        <br />
        <SelectList />
        <BarChart
          width={200}
          height={200}
          data={data}
          margin={{
            top: 20, right: 20, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="th" fill="#8884d8" background={{ fill: '#EEEEEE' }} />
          <Bar dataKey="voted" fill="#3377ff" background={{ fill: '#EEEEEE' }} />
        </BarChart>
        <br />
        <ActionButton />
      </Paper>
    </Grid>
  );
}

export default Proposal;
