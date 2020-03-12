import React, { useState, useEffect } from "react";

import { useQuery } from "@apollo/react-hooks";
import { GET_VIEWER, PROPOSALS, PREP_INFO_BY_ID, MY_VOTING_POWER, LAST_PROPOSAL_ID } from "./GQL";

import Proposals from "./Proposals";

function ProposalsContainer(props: any) {
  // console.log("ProposalsContainer props", props);
  const selectedPRep = props.match.params.PRep;
  const perPage = 12;

  const [currPage, setCurrPage] = useState(1);
  const [pRepInfo, setPRepInfo] = useState({ name: "", website: "", delegate: 0 });
  const [lastProposalID, setLastProposalID] = useState(0);
  const [myVotingPower, setMyVotingPower] = useState(0);


  const queryVal = useQuery(GET_VIEWER);
  const queryProposals = useQuery(PROPOSALS, { variables: { proposer: selectedPRep, currPage: 1, perPage: 12 } });
  const queryPRepInfoByID = useQuery(PREP_INFO_BY_ID, { variables: { proposer: selectedPRep } });
  const queryLastProposalID = useQuery(LAST_PROPOSAL_ID, { variables: { proposer: selectedPRep } });
  const queryMyVotingPower = useQuery(MY_VOTING_POWER, { variables: { proposer: selectedPRep } });

  useEffect(() => {
    let _pRepInfo;
    try {
      _pRepInfo = queryPRepInfoByID.data.get_prep_info_by_id;
    } catch {
      _pRepInfo = { name: "", website: "", delegate: 0 };
    }
    setPRepInfo(_pRepInfo);
  }, [queryPRepInfoByID.data])

  useEffect(() => {
    let _lastProposalID;
    try {
      _lastProposalID = queryLastProposalID.data.get_last_proposal_id;
    } catch {
      _lastProposalID = { name: "", website: "", delegate: 0 };
    }
    setLastProposalID(_lastProposalID);
  }, [queryLastProposalID.data])

  useEffect(() => {
    let _votingPower;
    try {
      _votingPower = queryMyVotingPower.data.get_my_voting_power;
    } catch {
      _votingPower = 0;
    }
    setMyVotingPower(_votingPower);
  }, [queryMyVotingPower.data])

  // console.log("queryVal", queryVal);
  // console.log("queryProposals", queryProposals);
  // console.log("queryPRepInfoByID", queryPRepInfoByID);
  // console.log("queryLastProposalID", queryLastProposalID);
  console.log("queryMyVotingPower", queryMyVotingPower);

  return (
    <Proposals
      loading={queryVal.loading || queryProposals.loading}
      error={queryProposals.error}
      data={queryProposals.data}
      pRepInfo={pRepInfo}
      lastProposalID={lastProposalID}
      myVotingPower={myVotingPower}
      pRep={selectedPRep}
      currPage={currPage}
      itemPerPage={perPage}
      setCurrPage={setCurrPage}
    />
  );
}

export default ProposalsContainer;
