import React, { useState, useMemo, useEffect, Fragment } from "react";
import { Link, withRouter } from "react-router-dom";

import { Paper, Typography, FormControlLabel, FormControl, RadioGroup, Radio, Button, Grid } from "@material-ui/core";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";

import { useApolloClient, useQuery, useMutation } from "@apollo/react-hooks";
import { SET_PUBLISH, SET_VOTE, GET_PROPOSAL } from "./GQL";
import gql from "graphql-tag";

import ReactMarkdown from "react-markdown";
import { json_rpc_call, governance_call } from "./IconConnect";

import useStyles from "./Style";

let voteData = [
  { name: 'quorum', th: 0, voted: 0 },
  { name: 'token', th: 0, voted: 0 },
];

interface selectItem {
  index: 0;
  contents: "";
}

function GQLGetProposal(props: any) {
  console.log("Proposal props", props);
  const classes = useStyles();
  const id = props.match.params.ID;
  //const forceUpdate = useForceUpdate;

  const [proposal, setProposal] = useState({
    author: "",
    subject: "",
    contents: "",
    prepId: 1,
    published: false,
    expireAt: "2019-12-12T00:00:00.000Z",
    quorumRate: 50,
    tokenRate: 50,
    selectitemmodelSet: []
  });
  const [voteSelect, setVoteSelect] = useState();
  const [username, setUsername] = useState("");

  const client = useApolloClient();

  const [mutatePublish] = useMutation(SET_PUBLISH);
  const [mutateVote] = useMutation(SET_VOTE);

  function Publish() {
    mutatePublish({
      variables: { proposalId: id }
    }).then(publishResult => {
      setProposal(publishResult.data.publishProposal.proposal);
    });
    console.log(proposal);
  }

  function Vote(voteSelect: number) {
    mutateVote({
      variables: { proposalId: id, selectItemIndex: voteSelect }
    }).then(voteResult => {
      setProposal(voteResult.data.voteProposal.proposal);
    });
    console.log(proposal);
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoteSelect(parseInt((event.target as HTMLInputElement).value));
  };

  function GetVotersVotingPower(voter: string) {
    return 100;
  }

  function SelectItemList(props: any) {
    console.log("print proposal", proposal);
    let VoteItem: number[] = [];
    /*
    for (let i in proposal.selectitemmodelSet) {
      const a = proposal.selectitemmodelSet[i];
      let VotingPower = 0;
      console.log("!!!!!!!!!!!!!!!!!!!!1")
      //      if ('votemodelSet' in proposal.selectitemmodelSet) {
      if (a && a.hasOwnProperty('votemodelSet')) {
        for (let j in proposal.selectitemmodelSet[i].votemodelSet) {
          VotingPower += GetVotersVotingPower(
            proposal.selectitemmodelSet[i].votemodelSet[j].voter.username
          );
        }
      }
      VoteItem.push(VotingPower);
    }*/
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

    voteData[0].th = proposal.quorumRate;
    voteData[1].th = proposal.tokenRate;
  });

  function SelectList() {
    let SelectList = proposal.selectitemmodelSet;

    let votedIdx = -1;
    let votedFlag = false;
    for (let i in SelectList) {
      /*
      for (let j in SelectList[i].votemodelSet) {
        if (username === SelectList[i].votemodelSet[j].voter.username) {
          votedIdx = parseInt(i);
          votedFlag = true;
          break;
        }
      }
      */
      console.log(SelectList[i]);
    }

    if (votedIdx >= 0) {
      voteData[0].voted = votedIdx;
      voteData[1].voted = votedIdx;
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

        //        governance_call("getDelegation", { "address": user_address }).then((result2: any) => {
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
        onClick={() => Vote(voteSelect)}
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
          onClick={() => Publish()}
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
      console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAA", SelectList[i]);
      /*
      for (let j in SelectList[i].votemodelSet) {
        if (username === SelectList[i].votemodelSet[j].voter.username) {
          flag = true;
          break;
        }
      }
      */
    }

    if (proposal.published) {
      return <VoteButton />;
    } else if (proposal.author === username) {
      return <PublishButton />;
    } else {
      return <div>{" "}</div>
    }
  }

  const { loading, error, data } = useQuery(GET_PROPOSAL, {
    variables: { id: id }
  });

  useMemo(() => {
    if (data) {
      setProposal(data.proposal);
    }
  }, [data]);


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!:</p>;
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
          data={voteData}
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

export default GQLGetProposal;
