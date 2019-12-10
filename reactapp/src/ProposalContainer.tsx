import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { SET_PUBLISH, SET_VOTE, GET_PROPOSAL, GET_LOCAL_ME, GET_LOCAL_ADDRESS } from "./GQL";
import gql from "graphql-tag";

import { json_rpc_call } from "./IconConnect";

import Proposal from "./Proposal";

let voteData = [
  { name: 'quorum', th: 0, voted: 0 },
  { name: 'token', th: 0, voted: 0 },
];

function ProposalContainer(props: any) {
  console.log("ProposalContainer props", props);
  const id = props.match.params.ID;
  //const forceUpdate = useForceUpdate;

  const [voteSelect, setVoteSelect] = useState();

  const [mutatePublish] = useMutation(SET_PUBLISH);
  const [mutateVote] = useMutation(SET_VOTE);

  function Publish() {
    mutatePublish({
      variables: { proposalId: id }
    }).then(publishResult => {
      console.log("vote", publishResult);
    });
    console.log("Publish!!!!!!!!!!!!!!", queryVal.data.proposal);
  }

  function Vote(voteSelect: number) {
    mutateVote({
      variables: { proposalId: id, selectItemIndex: voteSelect }
    }).then(voteResult => {
      console.log("vote", voteResult);
    });
    console.log("Vote!!!!!!!!!!!!!!!!!", queryVal.data.proposal);
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoteSelect(parseInt((event.target as HTMLInputElement).value));
  };

  function GetVotersVotingPower(voter: string) {
    return 100;
  }

  function isMyPRep() {
    // governance_call("getDelegation", { "address": user_address }).then((result2: any) => {
    console.log(queryAddress);
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
      if (delegateList[i].address === queryAddress.data.icon_address) {
        return true;
      }
    }
    return false;
  }

  function getVotedIdx() {
    let votedIdx = -1;
    console.log(queryVal);
    queryVal.data.proposal.selectitemmodelSet.forEach((aVoteItem: any) => {
      console.log("aVoteItem", aVoteItem);
      let test: any[] = [];
      if (aVoteItem['votemodelSet']) {
        test = aVoteItem['votemodelSet'];
      }
      if (aVoteItem)
        test.forEach((aVote) => {
          console.log("aVote", aVote);
          if (queryMe.data.username === aVote.voter.username) {
            console.log("aVote", aVote);
            return aVote.id;
          }
        });
    });

    if (votedIdx >= 0) {
      voteData[0].voted = votedIdx;
      voteData[1].voted = votedIdx;
    }

    return -1;
  }

  function amIOwner() {
    if (queryVal.data.proposal.prep.username === queryMe.data.username) {
      return true;
    }
    return false;
  }

  function getVotedPowers() {
    let VoteItem: number[] = [];

    queryVal.data.proposal.selectitemmodelSet.forEach((aSelectItem: any) => {
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

    return VoteItem;
  }

  let myPRep = false;
  let votedIdx = -1;
  let owner = false;
  let voteItem: any[] = [];

  const queryMe = useQuery(GET_LOCAL_ME);
  console.log("queryMe", queryMe);
  const queryAddress = useQuery(GET_LOCAL_ADDRESS);
  console.log("queryAddress", queryAddress);

  const queryVal = useQuery(GET_PROPOSAL, {
    variables: { id: id }
  });

  if (queryVal && queryVal.data && queryMe.data) {
    voteData[0].th = queryVal.data.proposal.quorumRate;
    voteData[1].th = queryVal.data.proposal.tokenRate;
    console.log("!@#!@#!@#!@#!@!#!@#!@#");
    myPRep = isMyPRep();
    votedIdx = getVotedIdx();
    owner = amIOwner();
  }
  if (queryVal && queryVal.data) {
    voteItem = getVotedPowers();
    console.log("hahahaha", voteItem);
  }

  // voted item 0, 1, 2, 3     ... -1
  // owner
  // myPRep

  // id
  // Publish

  return (
    <Proposal
      id={id}
      myPRep={myPRep}
      votedIdx={votedIdx}
      owner={owner}
      voteItem={voteItem}
      voteSelect={voteSelect}
      voteData={voteData}
      Publish={Publish}
      Vote={Vote}
      handleChange={handleChange}
      {...queryVal}
    />
  );
}

export default ProposalContainer;