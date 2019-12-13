import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { SET_PUBLISH, SET_VOTE, GET_PROPOSAL, GET_LOCAL_ME, GET_LOCAL_ADDRESS } from "./GQL";
import axios from "axios";

import { selected_icon_service, governance_call } from "./IconConnect";

import Proposal from "./Proposal";

let voteData = [
  { name: 'electoralTH', th: 0, voted: 0 },
  { name: 'winningTH', th: 0, voted: 0 },
];

function ProposalContainer(props: any) {
  console.log("ProposalContainer props", props);
  const id = props.match.params.ID;

  const [voteSelect, setVoteSelect] = useState();
  const [votedPower, setVotedPower] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  const [mutatePublish] = useMutation(SET_PUBLISH);
  const [mutateVote] = useMutation(SET_VOTE);

  function Publish() {
    mutatePublish({
      variables: { proposalId: id }
    }).then(publishResult => {
      console.log("publish", publishResult);
    });
    console.log("Publish!!!!!!!!!!!!!!", queryVal.data.proposal);
    setVoteSelect(-1);
    window.location.reload();
  }

  function Vote() {
    mutateVote({
      variables: { proposalId: id, selectItemIndex: voteSelect }
    }).then(voteResult => {
      console.log("vote", voteResult);
    });
    console.log("Vote!!!!!!!!!!!!!!!!!", queryVal.data.proposal);
    setVoteSelect(-1);
    window.location.reload();
  }

  async function FindBlockHeightFromDatetime(datetime: string) {
    // 주어진 datetime 바로 전에 생성된 block height
    const givenDate = new Date(datetime);
    const delegateStartBlockHeight = 9000000;
    const lastBlock = await selected_icon_service.getBlock('latest').execute();

    let min = delegateStartBlockHeight;
    let max = lastBlock.height;
    let findFlag = false;
    while (!findFlag) {
      let curr = Math.floor((min + max) / 2);
      if (curr === min || curr === max) {
        findFlag = true;
      }
      const respBlock = await axios.get("https://tracker.icon.foundation/v3/block/info", { params: { height: curr } });
      const currDate = new Date(respBlock.data.data.createDate);
      if (currDate < givenDate) {
        min = curr;
      } else {
        max = curr;
      }
    }

    const maxBlock = await axios.get("https://tracker.icon.foundation/v3/block/info", { params: { height: max } });
    const maxDate = new Date(maxBlock.data.data.createDate);
    const minBlock = await axios.get("https://tracker.icon.foundation/v3/block/info", { params: { height: min } });
    const minDate = new Date(minBlock.data.data.createDate);
    if (givenDate < maxDate) {
      if (givenDate < minDate) {
        return min - 1;
      }
      else {
        return min;
      }
    } else {
      return max;
    }
  }

  async function FindBlockHeightFromDatetime_testnet(datetime: string) {
    // 주어진 datetime 바로 전에 생성된 block height
    const givenDate = new Date(datetime);
    const delegateStartBlockHeight = 4000000;
    const lastBlock = await selected_icon_service.getBlock('latest').execute();

    let min = delegateStartBlockHeight;
    let max = lastBlock.height;
    let findFlag = false;
    while (!findFlag) {
      let curr = Math.floor((min + max) / 2);
      if (curr === min || curr === max) {
        findFlag = true;
      }
      const respBlock = await axios.get("https://bicon.tracker.solidwallet.io/v3/block/info", { params: { height: curr } });
      const currDate = new Date(respBlock.data.data.createDate);
      if (currDate < givenDate) {
        min = curr;
      } else {
        max = curr;
      }
    }

    const maxBlock = await axios.get("https://bicon.tracker.solidwallet.io/v3/block/info", { params: { height: max } });
    const maxDate = new Date(maxBlock.data.data.createDate);
    const minBlock = await axios.get("https://bicon.tracker.solidwallet.io/v3/block/info", { params: { height: min } });
    const minDate = new Date(minBlock.data.data.createDate);
    if (givenDate < maxDate) {
      if (givenDate < minDate) {
        return min - 1;
      }
      else {
        return min;
      }
    } else {
      return max;
    }
  }

  async function CalculateFinalVoteRate(address: string, blockHeight: number) {
    let latestTx: any = false;

    const respTxList = await axios.get("https://tracker.icon.foundation/v3/address/txList", { params: { address: address, page: 1, count: 1000 } })
    const txList = respTxList.data.data;
    const txCnt = respTxList.data.listSize;
    const txTotalCnt = respTxList.data.totalSize;

    for (let aTxKey in txList) {
      const aTx = txList[aTxKey];
      if (aTx.height < blockHeight && aTx.toAddr === "cx0000000000000000000000000000000000000000") {
        const respTxDetail = await axios.get("https://tracker.icon.foundation/v3/transaction/txDetail", { params: { txHash: aTx.txHash } });
        const txDetail = respTxDetail.data.data;
        const txData = JSON.parse(txDetail.dataString);
        if (txData.method === "setDelegation") {
          if (latestTx.height < aTx.height || latestTx === false) {
            latestTx = aTx;
          }
        }
      }
    }
    return latestTx;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Selected", (event.target as HTMLInputElement).value);
    setVoteSelect(parseInt((event.target as HTMLInputElement).value));
  };

  async function GetVotersVotingPower(prepAddress: string, voterAddress: string) {
    //    const delegateResp = await governance_call("getDelegate", { address: voterAddress });
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

    console.log(result2);
    for (const aPRepKey in result2.result.delegations) {
      const aPRep = result2.result.delegations[aPRepKey];
      if (aPRep.address === prepAddress) {
        console.log(")()(())())()()(", aPRep.value);
        return parseInt(aPRep.value, 16);
      }
    }
    return 1;
  }

  function isMyPRep() {
    // governance_call("getDelegation", { "address": queryAddress.data.icon_address}).then((result2: any) => {
    //    console.log(queryAddress);
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
      if (delegateList[i].address === queryVal.data.proposal.prep.iconAddress) {
        return true;
      }
    }
    return false;
  }

  function getVotedIdx() {
    let votedIdx = -1;
    console.log("getVotedIdx", queryVal.data.proposal.selectitemmodelSet);
    queryVal.data.proposal.selectitemmodelSet.forEach((aVoteItem: any) => {
      if (aVoteItem && aVoteItem.votemodelSet)
        aVoteItem.votemodelSet.forEach((aVote: any) => {
          console.log("aVote", aVote);
          if (queryMe.data.username === aVote.voter.username) {
            console.log("aVote", aVote);
            votedIdx = parseInt(aVoteItem.index);
          }
        });
    });

    if (votedIdx >= 0) {
      voteData[0].voted = votedIdx;
      voteData[1].voted = votedIdx;
    }

    return votedIdx;
  }

  function amIOwner() {
    if (queryVal.data.proposal.prep.username === queryMe.data.username) {
      return true;
    }
    return false;
  }

  async function getVotedPowers() {
    let VoteItem: number[] = [];

    for (const selectItemKey in queryVal.data.proposal.selectitemmodelSet) {
      const aSelectItem = queryVal.data.proposal.selectitemmodelSet[selectItemKey];
      //    .forEach((aSelectItem: any) => {
      let VotingPower = 0;

      let test: any[] = [];
      if (aSelectItem['votemodelSet']) {
        test = aSelectItem['votemodelSet'];
      }
      //      test.forEach(async (aVote) => 
      for (const VoteKey in test) {
        const aVote = test[VoteKey];
        VotingPower += await GetVotersVotingPower(queryVal.data.proposal.prep.iconAddress, aVote.voter.iconAddress);
        console.log("!@#!@#", VotingPower);
      }

      VoteItem.push((VotingPower / 1000000000000000000));
    }

    console.log("VoteItem!!!!!!!!!!!!!!!!!", VoteItem);
    return VoteItem;
  }

  const queryMe = useQuery(GET_LOCAL_ME);
  //  console.log("queryMe", queryMe);
  const queryAddress = useQuery(GET_LOCAL_ADDRESS);
  //  console.log("queryAddress", queryAddress);
  const queryVal = useQuery(GET_PROPOSAL, { variables: { id: id } });

  if (queryMe.loading || queryAddress.loading || queryVal.loading) {
    return <p>loading</p>
  }

  let myPRep = false;
  let votedIdx = -1;
  let owner = false;

  if (queryVal && queryVal.data && queryMe.data && queryAddress.data) {
    //    console.log("!@#!@#!@#!@#!@!#!@#!@#");
    myPRep = isMyPRep();
    votedIdx = getVotedIdx();
    owner = amIOwner();
    //    console.log("condition value", myPRep, votedIdx, owner);
  }
  if (queryVal && queryVal.data) {
    voteData[0].th = queryVal.data.proposal.electoralTh;
    voteData[1].th = queryVal.data.proposal.winningTh;

    getVotedPowers().then((result) => {
      if (votedPower[0] === 0 && votedPower[1] === 0 && votedPower[2] === 0 && votedPower[3] === 0 && votedPower[4] === 0 && votedPower[5] === 0 && votedPower[6] === 0 && votedPower[7] === 0 && votedPower[8] === 0 && votedPower[9] === 0) {
        setVotedPower(result);
        //        console.log("hahahaha", votedPower);
      }
    });
  }

  /*
    FindBlockHeightFromDatetime("2019-10-15T03:05:03").then((result) => {
  //    console.log(result);
      CalculateFinalVoteRate("hx9f4d9755a8c6e65a502bda11a8931641f934c837", result).then((result2) => {
  //      console.log(result2);
      });
    });
  */
  return (
    <>
      <Proposal
        id={id}
        myPRep={myPRep}
        votedIdx={votedIdx}
        owner={owner}
        votedPower={votedPower}
        voteSelect={voteSelect}
        voteData={voteData}
        Publish={Publish}
        Vote={Vote}
        handleChange={handleChange}
        {...queryVal}
      />
    </>
  );
}

export default ProposalContainer;