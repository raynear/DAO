import React, { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import { Paper, Typography, FormControlLabel, FormControl, RadioGroup, Radio, Button, Grid } from "@material-ui/core";

import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";

import gql from "graphql-tag";
import { useApolloClient } from "@apollo/react-hooks";

import ReactMarkdown from "react-markdown";
import IconService from 'icon-sdk-js';

import useStyles from "./Style";

let data = [
  { name: 'quorum', th: 0, voted: 0 },
  { name: 'token', th: 0, voted: 0 },
];

interface selectItem {
  index: 0;
  contents: "";
}

const MAIN_NET = "http://localhost:9000/api/v3";
const to_contract = "cx2e019e69cac769857042fd1efd079981bcd66a62";
const provider = new IconService.HttpProvider(MAIN_NET);
const icon_service = new IconService(provider);
const iconBuilder = IconService.IconBuilder;
// const iconConverter = IconService.IconConverter;


async function json_rpc_call(method_name: string, params: any) {
  console.log("params", params);
  var callbuilder = new iconBuilder.callbuilder();
  var callobj = callbuilder
    .to(to_contract)
    .method(method_name)
    .params(params)
    .build();

  console.log(callobj);
  return await icon_service.call(callobj).execute();
}

/*
async function json_rpc_transaction_call(from_wallet: string, method_name: string, params: any) {
  let timestamp = new Date();
  var txBuilder = new IconBuilder.CallTransactionBuilder();
  var txObj = txBuilder
    .from(from_wallet)
    .to(TO_CONTRACT)
    .nid(IconConverter.toBigNumber("3"))
    .version(IconConverter.toBigNumber("3"))
    .stepLimit(IconConverter.toBigNumber("100000000"))
    .timestamp(timestamp.valueOf() * 1000)
    .method(method_name)
    .params(params)
    .build();
  const scoreData = JSON.stringify({
    "jsonrpc": "2.0",
    "method": "icx_sendTransaction",
    "params": IconConverter.toRawTransaction(txObj),
    "id": 0
  });

  const parsed = JSON.parse(scoreData);
  const customEvent = new CustomEvent("ICONEX_RELAY_REQUEST", {
    detail: {
      type: 'REQUEST_JSON-RPC',
      payload: parsed
    }
  }
  );
  window.dispatchEvent(customEvent);
}
*/

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

    data[0].th = proposal.quorumRate;
    data[1].th = proposal.tokenRate;
  });

  const eventHandler = (event: any) => {
    const type = event.detail.type;
    const payload = event.detail.payload;
    if (type === "RESPONSE_SIGNING") {
      console.log("response signing");
      console.log(payload); // e.g., 'q/dVc3qj4En0GN+...'
    } else if (type === "RESPONSE_JSON-RPC") {
      console.log("response json rpc");
      console.log(payload);
    }
  };
  window.addEventListener("ICONEX_RELAY_RESPONSE", eventHandler);

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

    var callBuilder = new iconBuilder.CallBuilder();
    var callObj = callBuilder
      .to("cx_DAO_SCORE")
      .method("GetVerifyInfoByID")
      .params({ "_ID": props.username })
      .build();

    icon_service.call(callObj).execute().then((result: any) => {
      console.log("verify2", result);
      let VerifyInfo = result.data
      let myPRep = false;
      json_rpc_call("getDelegation", { "address": VerifyInfo.ID }).then((result2: any) => {
        console.log("verify2", result2);
        const delegateList = result2;
        if (delegateList.include(proposal.author)) {
          myPRep = true;
        }
      });
      if (proposal.published === false || votedFlag || !myPRep) {
        return <SelectItemList voted={votedIdx} />;
      } else {
        return <RadioButtons />;
      }
    });

    return <div>{" "}</div>
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
