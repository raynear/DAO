import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { SET_VOTE, GET_VIEWER } from "./GQL";

import { governanceCall, jsonRpcCall } from "./IconConnect";

import Proposal from "./Proposal";


function ProposalContainer(props: any) {
  // console.log("ProposalContainer props", props);
  const pRep = props.match.params.PRep
  const id = props.match.params.ID;

  const [callResult, setCallResult] = useState<any>(false);
  const [voteSelect, setVoteSelect] = useState();
  const [voteData, setVoteData] = useState({ name: 'electoralTH', th: 0, voted: 0, totalVoted: 0, totalDelegate: 0 })
  const [votedPowerRate, setVotedPowerRate] = useState<any[]>([])
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [mutateVote] = useMutation(SET_VOTE);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function vote() {
    mutateVote({
      variables: { proposer: pRep, proposalId: id, selectItemIndex: voteSelect }
    }).then(voteResult => {
      // console.log("vote", voteResult);
    });
    // console.log("Vote!!!!!!!!!!!!!!!!!", queryVal.data.proposal);
    setVoteSelect(-1);
    window.location.reload();
    // queryVal.refetch();
  }

  const back = () => {
    props.history.go(-1);
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("Selected", (event.target as HTMLInputElement).value);
    setVoteSelect(parseInt((event.target as HTMLInputElement).value));
  };

  function getTotalVotingPower() {
    // const delegateResp = await governanceCall("getPRep", { address: prepAddress });

    return parseInt(callResult.getPRep.delegated, 16) / 1000000000000000000;
  }

  async function getVotersVotingPower(prepAddress: string, voterAddress: string) {
    const delegateResp = await governanceCall("getDelegation", { address: voterAddress });
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
        if (delegateList[i].address === callResult.getProposal.address) {
          let myVotingPower = parseInt(delegateList[i].value, 16);
          myVotingPower = (myVotingPower / 1000000000000000000);
          return myVotingPower;
        }
      }
      return 0;
    }
  }

  function getVotedIdx() {
    const votes = callResult.getVotes;

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
      if (pRep === queryViewer.data.viewer.username) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function getVotedPowerRate() {
    let totalVotedPower = 0;

    const votes = callResult.getVotes;
    // console.log("votes", votes);

    let votedPowerRate = [];
    let votedPowers = [];
    for (let i = 0; i < callResult.getProposal.select_item.length; i++) {
      votedPowerRate[i] = [];
      votedPowers[i] = 0;
    }

    for (let i = 0; i < votes.length; i++) {
      const aVote = votes[i];

      if (votedPowerRate[aVote.selectItem]) {
        votedPowerRate[aVote.selectItem].push(aVote.voter);
      } else {
        votedPowerRate[aVote.selectItem] = [aVote.voter];
      }
    }

    // console.log("votedPowerRate", votedPowerRate);

    for (let i = 0; i < votedPowerRate.length; i++) {
      // console.log(i, VotedPowerRate[i]);
      let votingPower = 0;
      for (let j = 0; j < votedPowerRate[i].length; j++) {
        votingPower += await getVotersVotingPower(callResult.getProposal.address, votedPowerRate[i][j]);
      }

      votedPowers[i] = (votingPower / 1000000000000000000);
      totalVotedPower += (votingPower / 1000000000000000000);
    }
    // console.log("votedPowers", votedPowers);
    // console.log("totalVotedPower", totalVotedPower);

    let totalDelegate = getTotalVotingPower();

    // console.log("totalDelegate", totalDelegate);

    return { votedPowerRate: votedPowerRate, votedPowers: votedPowers, totalVotedPower: totalVotedPower, totalDelegate: totalDelegate }
  }

  async function call() {
    if (callResult) return;

    let votes = {};
    const getVotesResp = await jsonRpcCall("get_votes", { "_proposer": pRep, "_proposal_id": id });
    // console.log("GetVotesResp", GetVotesResp);
    if (getVotesResp) {
      votes = JSON.parse(getVotesResp).vote;
    }

    const getProposalResp = await jsonRpcCall("get_proposal", { "_proposer": pRep, "_proposal_id": id })
    // console.log("GetProposalResp", getProposalResp);
    if (getProposalResp) {
      let proposal = JSON.parse(getProposalResp);
      // console.log("proposal", proposal);
      let aProposal: any = {};
      if (proposal.subject !== "") {
        aProposal['id'] = proposal.ID;
        aProposal['subject'] = proposal.subject;
        aProposal['contents'] = proposal.contents;
        aProposal['address'] = proposal.address;
        aProposal['status'] = proposal.status;
        aProposal['expire_timestamp'] = proposal.expire_timestamp;
        aProposal['winning_threshold'] = proposal.winning_threshold;
        aProposal['electoral_threshold'] = proposal.electoral_threshold;
        aProposal['transaction'] = proposal.transaction;
        aProposal['final'] = proposal.final;
        aProposal['winner'] = proposal.winner;
        let items = JSON.parse(proposal.select_item)
        aProposal['select_item'] = items;

        const getPRepResp = await governanceCall("getPRep", { address: aProposal.address });
        // console.log("GetPRepResp", getPRepResp);

        let getDelegationResp: any = false;
        if (queryViewer.data && queryViewer.data.viewer && queryViewer.data.viewer.iconAddress) {
          getDelegationResp = await governanceCall("getDelegation", { address: queryViewer.data.viewer.iconAddress });
          // console.log("GetDelegationResp", getDelegationResp);
        }
        setCallResult({ getVotes: votes, getProposal: aProposal, getPRep: getPRepResp, getDelegation: getDelegationResp });
      }
    }
  }

  const queryViewer = useQuery(GET_VIEWER);

  if (queryViewer.loading) {
    return <p>loading</p>
  }

  if (callResult === false) {
    call();
    return <p>loading</p>;
  }
  // console.log("callResult!!!!!", callResult);

  // logined?
  let myDelegation = 0;
  let votedIdx = -1;
  if (queryViewer.data && queryViewer.data.viewer) {
    myDelegation = getMyDelegation();
    votedIdx = getVotedIdx();
  }

  const value = { myPRep: !(myDelegation === 0), votedIdx: votedIdx, owner: amIOwner(), myVotingPower: myDelegation };

  // console.log("votedPowerRate", votedPowerRate, votedPowerRate[0]);
  if (votedPowerRate[0] === undefined) {
    const winningTh = callResult.getProposal.winning_threshold;
    getVotedPowerRate().then((r) => {
      // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
      // console.log("r", r);
      if (voteData.th === 0) {
        let tmpVoteData = voteData;
        tmpVoteData.voted = Math.round((r.totalVotedPower / r.totalDelegate) * 100);
        tmpVoteData.th = callResult.getProposal.electoral_threshold - tmpVoteData.voted;
        if (tmpVoteData.th < 0) tmpVoteData.th = 0;
        tmpVoteData.totalVoted = r.totalVotedPower;
        tmpVoteData.totalDelegate = r.totalDelegate;
        setVoteData(tmpVoteData);
      }

      let voteItem: any[] = [];
      for (let i = 0; i < r.votedPowers.length; i++) {
        const votedRate = Math.round((r.votedPowers[i] / r.totalVotedPower) * 100);
        voteItem.push({ name: callResult.getProposal.select_item[i], voted: votedRate ? votedRate : 0, left: votedRate ? (votedRate > winningTh ? 0 : winningTh - votedRate) : 0, icx: r.votedPowers[i] });
      }
      setVotedPowerRate(voteItem);
    });
    return <p>Loading...</p>;
  }

  return (
    <Proposal
      pRep={pRep}
      id={id}
      myPRep={value.myPRep}
      votedIdx={value.votedIdx}
      myVotingPower={value.myVotingPower}
      owner={value.owner}
      voteSelect={voteSelect}
      back={back}
      votedPowerRate={votedPowerRate}
      voteData={voteData}
      votes={callResult.getVotes}
      vote={vote}
      handleChange={handleChange}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
      page={page}
      rowsPerPage={rowsPerPage}
      proposal={callResult.getProposal}
    />
  );
}

export default ProposalContainer;
