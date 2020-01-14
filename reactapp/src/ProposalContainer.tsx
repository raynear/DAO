import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { SET_VOTE, FINALIZE, VIEWER } from "./GQL";

import { governance_call, json_rpc_call } from "./IconConnect";

import Proposal from "./Proposal";


function ProposalContainer(props: any) {
  // console.log("ProposalContainer props", props);
  const PRep = props.match.params.PRep
  const id = props.match.params.ID;

  const [callResult, setCallResult] = useState<any>(false);
  const [voteSelect, setVoteSelect] = useState();
  const [voteData, setVoteData] = useState({ name: 'electoralTH', th: 0, voted: 0, totalVoted: 0, totalDelegate: 0 })
  const [votedPowerRate, setVotedPowerRate] = useState<any[]>([])
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [mutateVote] = useMutation(SET_VOTE);
  const [mutateFinalize] = useMutation(FINALIZE);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
    window.location.reload();
  }

  const back = () => {
    props.history.go(-1);
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("Selected", (event.target as HTMLInputElement).value);
    setVoteSelect(parseInt((event.target as HTMLInputElement).value));
  };

  function GetTotalVotingPower() {
    // const delegateResp = await governance_call("getPRep", { address: prepAddress });

    return parseInt(callResult.getPRep.delegated, 16) / 1000000000000000000;
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

  function getMyDelegation() {
    if (callResult.getDelegation === false) {
      return 0;
    }
    else {
      const delegateList = callResult.getDelegation.delegations;
      for (let i = 0; i < delegateList.length; i++) {
        if (delegateList[i].address === callResult.GetProposal.address) {
          let myVotingPower = parseInt(delegateList[i].value, 16);
          myVotingPower = (myVotingPower / 1000000000000000000);
          return myVotingPower;
        }
      }
      return 0;
    }
  }

  function getVotedIdx() {
    const votes = callResult.GetVotes;

    let votedIdx = -1;
    for (let i = 0; i < votes.length; i++) {
      // console.log(i, votes[i], queryViewer.data.viewer.iconAddress);
      if (votes[i].voter === queryViewer.data.viewer.iconAddress) {
        // console.log("Set IDX!!!!!!!!!!!!!!!!!")
        votedIdx = votes[i].selectItem;
      }
    }
    // console.log(votedIdx);
    return votedIdx
  }

  function amIOwner() {
    try {
      if (PRep === queryViewer.data.viewer.username) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function getVotedPowerRate(WinningTh: number) {
    let totalVotedPower = 0;

    const votes = callResult.GetVotes;

    let VotedPowerRate = [];
    let VotedPowers = [];
    for (let i = 0; i < callResult.GetProposal.select_item.length; i++) {
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

    console.log("VotedPowerRate", VotedPowerRate);

    for (let i = 0; i < VotedPowerRate.length; i++) {
      // console.log(i, VotedPowerRate[i]);
      let VotingPower = 0;
      for (let j = 0; j < VotedPowerRate[i].length; j++) {
        VotingPower += await GetVotersVotingPower(callResult.GetProposal.address, VotedPowerRate[i][j]);
      }

      VotedPowers[i] = (VotingPower / 1000000000000000000);
      totalVotedPower += (VotingPower / 1000000000000000000);
    }
    console.log("VotedPowers", VotedPowers);
    console.log("totalVotedPower", totalVotedPower);

    let TotalDelegate = GetTotalVotingPower();

    console.log("TotalDelegate", TotalDelegate);

    return { VotedPowerRate: VotedPowerRate, VotedPowers: VotedPowers, totalVotedPower: totalVotedPower, TotalDelegate: TotalDelegate }
  }

  async function Call() {
    if (callResult) return;

    let votes = {};
    const GetVotesResp = await json_rpc_call("GetVotes", { "_Proposer": PRep, "_ProposalID": id });
    console.log("GetVotesResp", GetVotesResp);
    if (GetVotesResp) {
      votes = JSON.parse(GetVotesResp).vote;
    }

    const GetProposalResp = await json_rpc_call("GetProposal", { "_Proposer": PRep, "_ProposalID": id })
    console.log("GetProposalResp", GetProposalResp);
    if (GetProposalResp) {
      let Proposal = JSON.parse(GetProposalResp);
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
        aProposal['transaction'] = Proposal.transaction;
        aProposal['final'] = Proposal.final;
        aProposal['winner'] = Proposal.winner;
        let items = JSON.parse(Proposal.select_item)
        aProposal['select_item'] = items;


        const GetPRepResp = await governance_call("getPRep", { address: aProposal.address });
        console.log("GetPRepResp", GetPRepResp);

        let GetDelegationResp: any = false;
        if (queryViewer.data && queryViewer.data.viewer) {
          GetDelegationResp = await governance_call("getDelegation", { address: queryViewer.data.viewer.iconAddress });
          console.log("GetDelegationResp", GetDelegationResp);
        }
        setCallResult({ GetVotes: votes, GetProposal: aProposal, getPRep: GetPRepResp, getDelegation: GetDelegationResp });
      }
    }
  }

  const queryViewer = useQuery(VIEWER);

  if (queryViewer.loading) {
    return <p>loading</p>
  }

  if (callResult === false) {
    Call();
    return <p>loading</p>;
  }
  console.log("callResult!!!!!", callResult);

  // logined?
  let myDelegation = 0;
  let votedIdx = -1;
  if (queryViewer.data && queryViewer.data.viewer) {
    myDelegation = getMyDelegation();
    votedIdx = getVotedIdx();
  }

  const value = { myPRep: !(myDelegation === 0), votedIdx: votedIdx, owner: amIOwner(), myVotingPower: myDelegation };

  console.log("votedPowerRate", votedPowerRate, votedPowerRate[0]);
  if (votedPowerRate[0] === undefined) {
    const WinningTh = callResult.GetProposal.winning_threshold;
    getVotedPowerRate(WinningTh).then((r) => {
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
      console.log("r", r);
      if (voteData.th === 0) {
        let tmpVoteData = voteData;
        tmpVoteData.voted = Math.round((r.totalVotedPower / r.TotalDelegate) * 100);
        tmpVoteData.th = callResult.GetProposal.electoral_threshold - tmpVoteData.voted;
        if (tmpVoteData.th < 0) tmpVoteData.th = 0;
        tmpVoteData.totalVoted = r.totalVotedPower;
        tmpVoteData.totalDelegate = r.TotalDelegate;
        setVoteData(tmpVoteData);
      }

      let VoteItem: any[] = [];
      for (let i = 0; i < r.VotedPowers.length; i++) {
        const votedRate = Math.round((r.VotedPowers[i] / r.totalVotedPower) * 100);
        VoteItem.push({ name: callResult.GetProposal.select_item[i], voted: votedRate ? votedRate : 0, left: votedRate ? (votedRate > WinningTh ? 0 : WinningTh - votedRate) : 0, icx: r.VotedPowers[i] });
      }
      setVotedPowerRate(VoteItem);
    });
    return <p>Loading...</p>;
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
      votes={callResult.GetVotes}
      Vote={Vote}
      FinalizeVote={FinalizeVote}
      handleChange={handleChange}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
      page={page}
      rowsPerPage={rowsPerPage}
      proposal={callResult.GetProposal}
    />
  );
}

export default ProposalContainer;
