import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { SET_VOTE, FINALIZE, VIEWER } from "./GQL";

import { governance_call, json_rpc_call } from "./IconConnect";

import Proposal from "./Proposal";


function ProposalContainer(props: any) {
  // console.log("ProposalContainer props", props);
  const PRep = props.match.params.PRep
  const id = props.match.params.ID;

  const [proposal, setProposal] = useState<any>(false);
  const [voteSelect, setVoteSelect] = useState();
  //  const [votedPower, setVotedPower] = useState<any>(false);
  const [value, setValue] = useState({ load: false, myPRep: false, votedIdx: -1, owner: false, myVotingPower: 0 });
  const [voteData, setVoteData] = useState({ name: 'electoralTH', th: 0, voted: 0, totalVoted: 0, totalDelegate: 0 })
  const [votedPowerRate, setVotedPowerRate] = useState<any[]>([])

  const [mutateVote] = useMutation(SET_VOTE);
  const [mutateFinalize] = useMutation(FINALIZE);

  function Vote() {
    mutateVote({
      variables: { proposer: PRep, proposalId: id, selectItemIndex: voteSelect }
    }).then(voteResult => {
      console.log("vote", voteResult);
    });
    // console.log("Vote!!!!!!!!!!!!!!!!!", queryVal.data.proposal);
    setVoteSelect(-1);
    window.location.reload();
    // queryVal.refetch();
  }

  function FinalizeVote() {
    mutateFinalize({
      variables: { Proposer: queryViewer.data.viewer.username, ProposalID: parseInt(id) }
    }).then(finalizeResult => {
      // console.log("finalize", finalizeResult);
    });
  }

  const back = () => {
    props.history.go(-1);
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
    return 0;
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
      if (delegateList[i].address === proposal.address) {
        let myVotingPower = parseInt(delegateList[i].value, 16);
        myVotingPower = (myVotingPower / 1000000000000000000);
        return myVotingPower;
      }
    }
    return 0;
  }

  async function getVotedIdx() {
    let votedIdx = -1;
    // console.log("getVotedIdx", queryVal.data.proposal.select_item);

    const votestr = await json_rpc_call("GetVotes", { "_Proposer": PRep, "_ProposalID": id })
    // console.log("VOTES!!!!!!!!!!!", votestr);
    const votes = JSON.parse(votestr).vote;
    // console.log("VOTES!!!", votes, queryViewer);

    for (let i = 0; i < votes.length; i++) {
      // console.log(i, votes[i], queryViewer.data.viewer.iconAddress);
      if (votes[i].voter === queryViewer.data.viewer.iconAddress) {
        // console.log("Set IDX!!!!!!!!!!!!!!!!!")
        votedIdx = votes[i].selectItem;
      }
    }
    // console.log(votedIdx);
    return votedIdx

    /*
      proposal.select_item.forEach((aVoteItem: any) => {
      if (aVoteItem && aVoteItem.votemodelSet)
        aVoteItem.votemodelSet.forEach((aVote: any) => {
          // console.log("aVote", aVote);
          if (queryViewer.data.viewer.username === aVote.voter.username) {
            // console.log("aVote", aVote);
            votedIdx = parseInt(aVoteItem.index);
          }
        });
    });
    */
  }

  function amIOwner() {
    if (PRep === queryViewer.data.viewer.username) {
      return true;
    }
    return false;
  }

  async function getVotedPowerRate(WinningTh: number) {
    let VoteItem: any[] = [];
    // let tmpList: number[] = [];
    let totalVotedPower = 0;

    // let TotalDelegate = await GetTotalVotingPower(proposal.address);
    const votestr = await json_rpc_call("GetVotes", { "_Proposer": PRep, "_ProposalID": id })
    // console.log("#######################");
    // console.log(votestr);
    const votes = JSON.parse(votestr).vote;

    let VotedPowerRate = [];
    let VotedPowers = [];
    for (let i = 0; i < proposal.select_item.length; i++) {
      VotedPowerRate[i] = [];
      VotedPowers[i] = 0;
    }

    for (let i = 0; i < votes.length; i++) {
      const aVote = votes[i];

      if (VotedPowerRate[aVote.selectItem]) {
        VotedPowerRate[aVote.selectItem].push(aVote.voter);
      } else {
        VotedPowerRate[aVote.selectItem] = [aVote.voter];
      }
    }

    // console.log("VotedPowerRate", VotedPowerRate);

    for (let i = 0; i < VotedPowerRate.length; i++) {
      // console.log(i, VotedPowerRate[i]);
      let VotingPower = 0;
      for (let j = 0; j < VotedPowerRate[i].length; j++) {
        VotingPower += await GetVotersVotingPower(proposal.address, VotedPowerRate[i][j]);
      }

      VotedPowers[i] = (VotingPower / 1000000000000000000);
      totalVotedPower += (VotingPower / 1000000000000000000);
    }

    let TotalDelegate = await GetTotalVotingPower(proposal.address);

    let tmpVoteData = voteData;
    tmpVoteData.voted = Math.round((totalVotedPower / TotalDelegate) * 100);
    tmpVoteData.th = proposal.electoral_threshold - tmpVoteData.voted;
    if (tmpVoteData.th < 0) tmpVoteData.th = 0;
    tmpVoteData.totalVoted = totalVotedPower;
    tmpVoteData.totalDelegate = TotalDelegate;
    setVoteData(tmpVoteData);

    // console.log("VotedPowers", VotedPowers);

    for (let i = 0; i < VotedPowers.length; i++) {
      const votedRate = Math.round((VotedPowers[i] / totalVotedPower) * 100);
      VoteItem.push({ name: proposal.select_item[i], voted: votedRate ? votedRate : 0, left: votedRate ? (votedRate > WinningTh ? 0 : WinningTh - votedRate) : 0, icx: VotedPowers[i] });
    }

    return VoteItem;


    /*
    for (const selectItemKey in proposal.select_item) {
      const aSelectItem = proposal.select_item[selectItemKey];
      let VotingPower = 0;

      let test: any[] = [];
      if (aSelectItem['votemodelSet']) {
        test = aSelectItem['votemodelSet'];
      }
      for (const VoteKey in test) {
        const aVote = test[VoteKey];
        VotingPower += await GetVotersVotingPower(proposal.address, aVote.voter.iconAddress);
        // console.log("!@#!@#", VotingPower);
      }

      tmpList.push((VotingPower / 1000000000000000000));
      totalVotedPower += (VotingPower / 1000000000000000000);
    }

    for (let i = 0; i < tmpList.length; i++) {
      const votedRate = Math.round((tmpList[i] / totalVotedPower) * 100);
      VoteItem.push({ name: proposal.select_item[i].contents, voted: votedRate, left: votedRate > WinningTh ? 0 : WinningTh - votedRate });
    }

    return VoteItem;
    */
  }

  if (proposal === false) {
    json_rpc_call("GetProposal", { "_Proposer": PRep, "_ProposalID": id }).then((result) => {
      // console.log(result);
      if (result) {
        let Proposal = JSON.parse(result);
        // console.log("proposal", Proposal);
        let aProposal: any = {};
        if (Proposal.subject !== "") {
          aProposal['id'] = Proposal.ID;
          aProposal['subject'] = Proposal.subject;
          aProposal['contents'] = Proposal.contents;
          aProposal['address'] = Proposal.address;
          aProposal['status'] = Proposal.status;
          aProposal['expire_date'] = Proposal.expire_date;
          aProposal['winning_threshold'] = Proposal.winning_threshold;
          aProposal['electoral_threshold'] = Proposal.electoral_threshold;
          aProposal['winner'] = Proposal.winner;
          let items = JSON.parse(Proposal.select_item)
          aProposal['select_item'] = items;

          // console.log(aProposal);
          setProposal(aProposal);
        }
      }
    });
  }

  const queryViewer = useQuery(VIEWER);
  //  const queryVal = useQuery(GET_PROPOSAL, { variables: { id: id } });

  if (queryViewer.loading || proposal === false) {
    return <p>loading</p>
  }
  // console.log("___________________________________________");
  // console.log(queryVal, queryViewer);


  if (queryViewer.data) {
    if (!value.load) {
      isMyPRep(queryViewer.data.viewer.iconAddress).then((result) => {
        // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", result);
        getVotedIdx().then((votedIdx) => {
          setValue({ load: true, myPRep: !(result === 0), votedIdx: (votedIdx === undefined) ? -1 : votedIdx, owner: amIOwner(), myVotingPower: result });
        });
      });
    }
  }

  // console.log("condition value", myPRep, votedIdx, owner);
  //  getVotedPowerList().then((result) => {
  //    if (!votedPower) {
  //      setVotedPower(result);
  //      // console.log("hahahaha", votedPower);
  //    }
  //  });

  getVotedPowerRate(proposal.winning_threshold).then((result) => {
    if (votedPowerRate[0] === undefined) {
      setVotedPowerRate(result);
      // console.log("hahahaha", votedPower);
    }
  });

  if (votedPowerRate[0] === undefined) {
    return <></>;
  }

  return (
    <Proposal
      PRep={PRep}
      id={id}
      myPRep={value.myPRep}
      votedIdx={value.votedIdx}
      myVotingPower={value.myVotingPower}
      owner={value.owner}
      voteSelect={voteSelect}
      back={back}
      votedPowerRate={votedPowerRate}
      voteData={voteData}
      Vote={Vote}
      FinalizeVote={FinalizeVote}
      handleChange={handleChange}
      proposal={proposal}
    />
  );
}

export default ProposalContainer;