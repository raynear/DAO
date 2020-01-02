import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { SET_PUBLISH, SET_VOTE, FINALIZE, GET_PROPOSAL, VIEWER } from "./GQL";

import { governance_call } from "./IconConnect";

import Proposal from "./Proposal";

interface vote {
  name: string;
  th: number;
  voted: number;
}

function ProposalContainer(props: any) {
  // console.log("ProposalContainer props", props);
  const id = props.match.params.ID;

  const [voteSelect, setVoteSelect] = useState();
  const [votedPower, setVotedPower] = useState<any>(false);
  const [value, setValue] = useState({ load: false, myPRep: false, votedIdx: -1, owner: false });
  const [voteData, setVoteData] = useState<vote[]>([{ name: 'electoralTH', th: 0, voted: 0 }])
  const [votedPowerRate, setVotedPowerRate] = useState<any[]>([{ name: "", left: 0, voted: 0 }])
  const [flag, setFlag] = useState(false);

  const [mutatePublish] = useMutation(SET_PUBLISH);
  const [mutateVote] = useMutation(SET_VOTE);
  const [mutateFinalize] = useMutation(FINALIZE);

  function Publish() {
    mutatePublish({
      variables: { proposalId: id }
    }).then(publishResult => {
      // console.log("publish", publishResult);
    });
    // console.log("Publish!!!!!!!!!!!!!!", queryVal.data.proposal);
    setVoteSelect(-1);
    window.location.reload();
    // queryVal.refetch();
  }

  function Vote() {
    mutateVote({
      variables: { proposalId: id, selectItemIndex: voteSelect }
    }).then(voteResult => {
      // console.log("vote", voteResult);
    });
    // console.log("Vote!!!!!!!!!!!!!!!!!", queryVal.data.proposal);
    setVoteSelect(-1);
    window.location.reload();
    // queryVal.refetch();
  }

  function FinalizeVote() {
    mutateFinalize({
      variables: { ProposalID: parseInt(id) }
    }).then(finalizeResult => {
      // console.log("finalize", finalizeResult);
    });
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("Selected", (event.target as HTMLInputElement).value);
    setVoteSelect(parseInt((event.target as HTMLInputElement).value));
  };

  async function GetTotalVotingPower(prepAddress: string) {
    const delegateResp = await governance_call("getPRep", { address: prepAddress });

    return parseInt(delegateResp.delegated, 16) / 1000000000000000000;
  }

  async function GetVotersVotingPower(prepAddress: string, voterAddress: string) {
    const delegateResp = await governance_call("getDelegation", { address: voterAddress });
    // console.log(delegateResp);
    for (const aPRepKey in delegateResp.delegations) {
      const aPRep = delegateResp.delegations[aPRepKey];
      if (aPRep.address === prepAddress) {
        // console.log(")()(())())()()(", aPRep.value);
        return parseInt(aPRep.value, 16);
      }
    }
    return 1;
  }

  async function isMyPRep(address: string) {
    const delegateResp = await governance_call("getDelegation", { "address": address })
    // console.log(delegateResp);
    let delegateList;
    try {
      delegateList = delegateResp.delegations;
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
    // console.log("getVotedIdx", queryVal.data.proposal.selectitemmodelSet);
    queryVal.data.proposal.selectitemmodelSet.forEach((aVoteItem: any) => {
      if (aVoteItem && aVoteItem.votemodelSet)
        aVoteItem.votemodelSet.forEach((aVote: any) => {
          // console.log("aVote", aVote);
          if (queryViewer.data.viewer.username === aVote.voter.username) {
            // console.log("aVote", aVote);
            votedIdx = parseInt(aVoteItem.index);
          }
        });
    });
    return votedIdx;
  }

  function amIOwner() {
    if (queryVal.data.proposal.prep.username === queryViewer.data.viewer.username) {
      return true;
    }
    return false;
  }

  async function getVotedPowerList() {
    let VoteItem: number[] = [];
    let totalVotedPower = 0;

    let TotalDelegate = await GetTotalVotingPower(queryVal.data.proposal.prep.iconAddress);

    for (const selectItemKey in queryVal.data.proposal.selectitemmodelSet) {
      const aSelectItem = queryVal.data.proposal.selectitemmodelSet[selectItemKey];
      let VotingPower = 0;

      let test: any[] = [];
      if (aSelectItem['votemodelSet']) {
        test = aSelectItem['votemodelSet'];
      }
      for (const VoteKey in test) {
        const aVote = test[VoteKey];
        VotingPower += await GetVotersVotingPower(queryVal.data.proposal.prep.iconAddress, aVote.voter.iconAddress);
        // console.log("!@#!@#", VotingPower);
      }

      VoteItem.push((VotingPower / 1000000000000000000));
      totalVotedPower += (VotingPower / 1000000000000000000);
    }

    let tmpVoteData = voteData;
    tmpVoteData[0].voted = Math.round((totalVotedPower / TotalDelegate) * 100);
    setVoteData(tmpVoteData);


    // console.log("totalvote", totalVotedPower);
    // console.log("totaldelegated icx", TotalDelegate);
    // console.log("VoteItem!!!!!!!!!!!!!!!!!", VoteItem);
    return VoteItem;
  }

  async function getVotedPowerRate(WinningTh: number) {
    let VoteItem: any[] = [];
    let tmpList: number[] = [];
    let totalVotedPower = 0;

    //    let TotalDelegate = await GetTotalVotingPower(queryVal.data.proposal.prep.iconAddress);

    for (const selectItemKey in queryVal.data.proposal.selectitemmodelSet) {
      const aSelectItem = queryVal.data.proposal.selectitemmodelSet[selectItemKey];
      let VotingPower = 0;

      let test: any[] = [];
      if (aSelectItem['votemodelSet']) {
        test = aSelectItem['votemodelSet'];
      }
      for (const VoteKey in test) {
        const aVote = test[VoteKey];
        VotingPower += await GetVotersVotingPower(queryVal.data.proposal.prep.iconAddress, aVote.voter.iconAddress);
        // console.log("!@#!@#", VotingPower);
      }

      tmpList.push((VotingPower / 1000000000000000000));
      totalVotedPower += (VotingPower / 1000000000000000000);
    }

    for (let i = 0; i < tmpList.length; i++) {
      const votedRate = Math.round((tmpList[i] / totalVotedPower) * 100);
      VoteItem.push({ name: queryVal.data.proposal.selectitemmodelSet[i].contents, voted: votedRate, left: votedRate > WinningTh ? 0 : WinningTh - votedRate });
    }

    return VoteItem;
  }

  //  const queryMe = useQuery(GET_LOCAL_ME);
  //  // console.log("queryMe", queryMe);
  //  const queryAddress = useQuery(GET_LOCAL_ADDRESS);
  //  // console.log("queryAddress", queryAddress);
  const queryViewer = useQuery(VIEWER);
  const queryVal = useQuery(GET_PROPOSAL, { variables: { id: id } });


  if (queryViewer.loading || queryVal.loading) {
    return <p>loading</p>
  }
  // console.log("___________________________________________");
  // console.log(queryVal, queryViewer);

  if (queryVal && queryVal.data && queryViewer.data) {
    // console.log("!@#!@#!@#!@#!@!#!@#!@#");
    // console.log("queryVal", queryVal);
    if (!value.load) {
      isMyPRep(queryViewer.data.viewer.iconAddress).then((result) => { setValue({ load: true, myPRep: result, votedIdx: getVotedIdx(), owner: amIOwner() }); });
    }
    // // console.log("condition value", myPRep, votedIdx, owner);
  }
  if (queryVal && queryVal.data) {
    if (!flag) {
      let tmpVoteData = voteData;
      tmpVoteData[0].th = queryVal.data.proposal.electoralTh;
      setFlag(true);
      setVoteData(tmpVoteData);
    }

    getVotedPowerList().then((result) => {
      if (!votedPower) {
        setVotedPower(result);
        // // console.log("hahahaha", votedPower);
      }
    });

    getVotedPowerRate(queryVal.data.proposal.winningTh).then((result) => {
      if (votedPowerRate[0].name === "" && votedPowerRate[0].left === 0 && votedPowerRate[0].voted === 0) {
        setVotedPowerRate(result);
        // // console.log("hahahaha", votedPower);
      }
    });
  }

  return (
    <Proposal
      id={id}
      myPRep={value.myPRep}
      votedIdx={value.votedIdx}
      owner={value.owner}
      voteSelect={voteSelect}
      votedPower={votedPower}
      votedPowerRate={votedPowerRate}
      voteData={voteData}
      Publish={Publish}
      Vote={Vote}
      FinalizeVote={FinalizeVote}
      handleChange={handleChange}
      {...queryVal}
    />
  );
}

export default ProposalContainer;