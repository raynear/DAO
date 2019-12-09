import React, { useState, useMemo, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";

import { Paper, Typography, FormControlLabel, FormControl, RadioGroup, Radio, Button, Grid, Divider, Tooltip } from "@material-ui/core";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip as ChartTooltip, Bar } from "recharts";

import { useApolloClient, useQuery, useMutation } from "@apollo/react-hooks";
import { SET_PUBLISH, SET_VOTE, GET_PROPOSAL } from "./GQL";
import gql from "graphql-tag";

import ReactMarkdown from "react-markdown";
import { json_rpc_call } from "./IconConnect";

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
    id: 0,
    author: { id: 0, username: "" },
    subject: "",
    contents: "",
    prep: { id: 0 },
    published: false,
    expireAt: "2019-12-12T00:00:00.000Z",
    quorumRate: 50,
    tokenRate: 50,
    selectitemmodelSet: []
  });
  const [voteSelect, setVoteSelect] = useState();
  const [username, setUsername] = useState("");
  const [votedFlag, setVotedFlag] = useState(false);

  const client = useApolloClient();

  const [mutatePublish] = useMutation(SET_PUBLISH);
  const [mutateVote] = useMutation(SET_VOTE);

  function Publish() {
    mutatePublish({
      variables: { proposalId: id }
    }).then(publishResult => {
      setProposal(publishResult.data.publishProposal.proposal);
    });
    console.log("Publish!!!!!!!!!!!!!!", proposal);
  }

  function Vote(voteSelect: number) {
    mutateVote({
      variables: { proposalId: id, selectItemIndex: voteSelect }
    }).then(voteResult => {
      setProposal(voteResult.data.voteProposal.proposal);
    });
    console.log("Vote!!!!!!!!!!!!!!!!!", proposal);
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

    proposal.selectitemmodelSet.forEach((aSelectItem) => {
      let VotingPower = 0;

      let test: any[] = [];
      if (aSelectItem['votemodelSet']) {
        test = aSelectItem['votemodelSet'];
      }
      test.forEach((aVote) => {
        VotingPower += GetVotersVotingPower(aVote.voter.username);
      });

      VoteItem.push(VotingPower);
    })

    return (
      <ul>
        {proposal.selectitemmodelSet.map(
          (selectItem: selectItem, idx: number) => {
            if (props.voted === idx) {
              return (
                <li key={idx}>
                  <Tooltip title="You Vote!">
                    <Typography variant="body1" color="primary">
                      {selectItem.contents}
                      {"(" + VoteItem[idx] + ")"}
                    </Typography>
                  </Tooltip>
                </li>
              );
            } else {
              return (
                <li key={idx}>
                  <Typography variant="body1" color="textPrimary">
                    {selectItem.contents} {"(" + VoteItem[idx] + ")"}
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
    const [myPRep, setMyPRep] = useState(false);
    let SelectList = proposal.selectitemmodelSet;

    let votedIdx = -1;
    SelectList.forEach((aVoteItem) => {
      console.log("aVoteItem", aVoteItem);
      let test: any[] = [];
      if (aVoteItem['votemodelSet']) {
        test = aVoteItem['votemodelSet'];
      }
      if (aVoteItem)
        test.forEach((aVote) => {
          console.log("aVote", aVote);
          if (username === aVote.voter.username) {
            console.log("aVote", aVote);
            //          votedIdx = parseInt(aVote.);
            setVotedFlag(true);
            return;
          }
        });
    });

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
            setMyPRep(true);
            break;
          }
        }
        //       });
      });
    }

    console.log("Environment for SelectList", proposal.published, votedFlag, myPRep)
    if (proposal.published === false || votedFlag || !myPRep) {
      console.log("just list");
      return (<SelectItemList voted={votedIdx} />);
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
          onClick={Publish}
        >
          Publish
        </Button>
      </Fragment>
    );
  }

  function ActionButton() {

    /*
    let SelectList = proposal.selectitemmodelSet;
    let flag = false;
    
        SelectList.forEach(item => {
          let test: any[] = [];
          if (item['votemodelSet']) {
            test = item['votemodelSet'];
          }
          test.forEach(vote => {
            console.log("vote!!!!!!!!!!", vote);
            if (username === vote.voter.username) {
              flag = true;
              return;
            }
          })
        })
    */
    if (proposal.published && votedFlag === false) {
      return <VoteButton />;
    } else if (proposal.author.username === username) {
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
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <Grid container className={classes.container}>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              <b>{proposal.id}.</b> P-Rep {proposal.author.username}
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="h5" color="textPrimary" gutterBottom>
              {proposal.subject}
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="caption" color="textPrimary">
              Published : {(proposal.published).toString()}
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="caption" color="textPrimary">
              expire at :
          {proposal.expireAt}
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <br />
            <Divider variant="fullWidth" />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <ReactMarkdown
              source={proposal.contents.split("<br>").join("\n")}
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
              data={voteData}
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

export default GQLGetProposal;
