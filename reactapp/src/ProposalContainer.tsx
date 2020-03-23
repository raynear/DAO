import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { SET_VOTE, GET_VIEWER, PROPOSAL, VOTES, PREP_INFO_BY_ID, MY_VOTING_POWER, VOTED_POWER_RATES } from "./GQL";
import { jsonRpcCall } from "./IconConnect";

import Proposal from "./Proposal";


function ProposalContainer(props: any) {
  // console.log("ProposalContainer props", props);
  const pRep = props.match.params.PRep
  const id = props.match.params.ID;

  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState({ title: "Wait", contents: "Now your vote write on ICON" });

  const [votes, setVotes] = useState<any>([]);
  const [proposal, setProposal] = useState<any>({
    ID: "0",
    proposer: "",
    address: "",
    subject: "",
    contents: "",
    electoral_threshold: 0,
    winning_threshold: 0,
    status: "",
    expire_timestamp: 0,
    select_item: [""],
    transaction: "",
    final: "",
    winner: ""
  }
  );
  const [values, setValues] = useState<any>({
    owner: false,
    myPRep: false,
    myVotingPower: 0,
    votedIdx: -1,
    totalDelegate: 0,
    totalVotedPower: 0,
  });

  const [viewer, setViewer] = useState<any>({
    username: "",
    iconAddress: ""
  })

  const [voteSelect, setVoteSelect] = useState(-1);
  const [voteData, setVoteData] = useState({ name: 'electoralTH', th: 0, voted: 0, totalVoted: 0, totalDelegate: 0, icx: 0 })
  const [votedPowerRate, setVotedPowerRate] = useState<any>([])
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
    setOpen(true);
    setMsg({ title: "Wait", contents: "Now your vote write on ICON" });
    mutateVote({
      variables: { proposer: pRep, proposalId: id, selectItemIndex: voteSelect }
    }).then(voteResult => {
      console.log("vote", voteResult);
    });
    // console.log("Vote!!!!!!!!!!!!!!!!!", queryVal.data.proposal);
    setVoteSelect(-1);
    waitResult(5, 2);
    queryVotes.refetch();
    // queryVal.refetch();
  }

  const back = () => {
    props.history.go(-1);
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("Selected", (event.target as HTMLInputElement).value);
    setVoteSelect(parseInt((event.target as HTMLInputElement).value));
  };

  function getVotedIdx(votes: any, address: string) {
    let votedIdx = -1;
    for (let i = 0; i < votes.length; i++) {
      if (votes[i].voter === address) {
        votedIdx = votes[i].selectItem;
      }
    }
    return votedIdx
  }

  function amIOwner(username: string) {
    if (pRep === username) {
      return true;
    }
    return false;
  }

  function sleep(t: number) {
    return new Promise(resolve => setTimeout(resolve, t));
  }

  async function waitResult(count: number, interval: number) {
    setOpen(true);
    for (let i = 0; i < count + 1; i++) {
      let result = await jsonRpcCall("get_votes", { "_proposer": pRep, "_proposal_id": id });
      const votes_call = JSON.parse(result);
      for (let i = 0; i < votes_call.length; i++) {
        const aVote = votes_call[i];
        if (aVote.voter === queryViewer.data.viewer.iconAddress) {
          setMsg({ title: "Done", contents: "You vote on " + aVote.selectItem });
          return aVote;
        }
      }
      await sleep(interval * 1000);
    }
    setMsg({ title: "Fail", contents: "Cannot find your vote" });
  }


  const queryViewer = useQuery(GET_VIEWER);
  console.log("queryViewer", queryViewer);
  const queryProposal = useQuery(PROPOSAL, { variables: { proposer: pRep, proposal_id: id } });
  console.log("queryProposal", queryProposal);
  const queryVotes = useQuery(VOTES, { variables: { proposer: pRep, proposal_id: id } });
  console.log("queryVotes", queryVotes);

  const queryPRepInfoByID = useQuery(PREP_INFO_BY_ID, { variables: { proposer: pRep } });
  console.log("queryPRepInfoByID", queryPRepInfoByID);
  const queryVotingPower = useQuery(MY_VOTING_POWER, { variables: { proposer: pRep, username: viewer.username } });
  console.log("queryVotingPower", queryVotingPower);
  const queryVotedPowerRates = useQuery(VOTED_POWER_RATES, { variables: { proposer: pRep, proposal_id: id } });
  console.log("queryVotedPowerRates", queryVotedPowerRates);

  useEffect(() => {
    let _proposal;
    try {
      _proposal = queryProposal.data.get_proposal;
    } catch {
      _proposal = {
        ID: "0",
        proposer: "",
        address: "",
        subject: "Loading",
        contents: "",
        electoral_threshold: 0,
        winning_threshold: 0,
        status: "Loading",
        expire_timestamp: 0,
        select_item: [""],
        transaction: "",
        final: "",
        winner: ""
      };
    }
    setProposal(_proposal);
  }, [queryProposal.data]);

  useEffect(() => {
    let _votes: any;
    try {
      _votes = queryVotes.data.get_votes;
    } catch {
      _votes = [];
    }
    setVotes(_votes);
  }, [queryVotes.data]);

  useEffect(() => {
    let _username;
    let _iconAddress;
    try {
      _username = queryViewer.data.viewer.username;
      _iconAddress = queryViewer.data.viewer.iconAddress;
    } catch {
      _username = "";
      _iconAddress = "";
    }
    setViewer({ username: _username, iconAddress: _iconAddress });
  }, [queryViewer.data]);

  useEffect(() => {
    let _myPRep;
    let _myVotingPower;
    try {
      _myPRep = !(queryVotingPower.data.get_my_voting_power === 0);
      _myVotingPower = queryVotingPower.data.get_my_voting_power;
    } catch {
      _myPRep = false;
      _myVotingPower = 0;
    }
    setValues({ ...values, myPRep: _myPRep, myVotingPower: _myVotingPower });
  }, [queryVotingPower.data])

  useEffect(() => {
    let _totalDelegate;
    try {
      _totalDelegate = parseInt(queryPRepInfoByID.data.get_prep_info_by_id.delegated, 16) / 1000000000000000000;
    } catch {
      _totalDelegate = 0;
    }
    setValues({ ...values, totalDelegate: _totalDelegate });
  }, [queryPRepInfoByID.data]);

  useEffect(() => {
    let _votedPowerRate;
    let _totalVotedPower;
    try {
      let Item = queryVotedPowerRates.data.get_voted_power_rates;
      _votedPowerRate = Item.votedPowerRate;
      _totalVotedPower = Item.totalVotedPower;
    } catch {
      _votedPowerRate = [];
      _totalVotedPower = 0;
    }
    setVotedPowerRate(_votedPowerRate);
    setValues({ ...values, totalVotedPower: _totalVotedPower });
  }, [queryVotedPowerRates.data])


  let _votedIdx;
  try {
    _votedIdx = getVotedIdx(votes, queryViewer.data.viewer.iconAddress);
  } catch {
    _votedIdx = -1;
  }

  useEffect(() => {
    let _owner;
    try {
      _owner = amIOwner(viewer.username);
    } catch {
      _owner = false;
    }
    setValues({ ...values, owner: _owner });
  }, [viewer.username]);

  useEffect(() => {
    let tmpVoteData = voteData;
    try {
      tmpVoteData.voted = Math.round((values.totalVotedPower / values.totalDelegate ? values.totalDelegate : 0.00000001) * 100);
      tmpVoteData.th = parseInt(proposal.electoral_threshold) - tmpVoteData.voted;
      if (tmpVoteData.th < 0) tmpVoteData.th = 0;
      tmpVoteData.totalVoted = values.totalVotedPower;
      tmpVoteData.totalDelegate = values.totalDelegate;
    } catch {
      tmpVoteData = voteData;
    }
    setVoteData(tmpVoteData);
  }, [proposal, values.totalVotedPower, values.totalDelegate])

  /*
    useEffect(() => {
      let _voteItem;
      try {
        const winningTh = proposal.winningTh;
        if (values.totalVotedPower === 0) {
          throw Error;
        }
        let voteItem: any[] = [];
        for (let i = 0; i < votedPowerRate.length; i++) {
          const votedRate = Math.round((votedPowerRate[i].votedPower / values.totalVotedPower ? values.totalVotedPower : 0.0000001) * 100);
          voteItem.push({ name: proposal.select_item[i], voted: votedRate ? votedRate : 0, left: votedRate ? (votedRate > winningTh ? 0 : winningTh - votedRate) : 0, icx: votedPowerRate[i].votedPower });
        }
        _voteItem = voteItem;
      } catch{
        let voteItem: any[] = [];
        for (let i = 0; i < votedPowerRate.length; i++) {
          voteItem.push({ name: proposal.select_item[i], voted: 0, left: 0, icx: 0 });
        }
        _voteItem = voteItem;
      }
      setVotedPowerRate(_voteItem);
    }, [proposal, votedPowerRate, values.totalVotedPower, values.totalDelegate])
  */
  console.log("values", values);

  return (
    <Proposal
      // Data from url
      pRep={pRep}
      id={id}

      // return pure data
      proposal={proposal}
      votes={votes}

      // edited data
      owner={values.owner}
      myPRep={values.myPRep}
      myVotingPower={values.myVotingPower}
      votedIdx={_votedIdx}
      voteSelect={voteSelect}
      votedPowerRate={votedPowerRate}
      voteData={voteData}

      // functions
      back={back}
      vote={vote}

      // pagination
      handleChange={handleChange}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
      page={page}
      rowsPerPage={rowsPerPage}

      // Dialog
      open={open}
      setOpen={setOpen}
      msg={msg}
    />
  );
}

export default ProposalContainer;
