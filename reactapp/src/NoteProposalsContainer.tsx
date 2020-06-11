import React, { useState } from "react";

import { useQuery } from "@apollo/react-hooks";
import { GET_PROPOSALS } from "./GQL";

import NoteProposals from "./NoteProposals";

function NoteProposalsContainer(props: any) {
  // console.log("ProposalsContainer props", props);
  const selectedPRep = props.match.params.PRep;

  const perPage = 12;
  const [activePage, setActivePage] = useState(1);

  const handlePageChange = (data: any) => {
    // console.log(data);
    setActivePage(data);
  };

  function createNewProposal() {
    props.history.push("/EditProposal");
  }

  // console.log("what we send?", values);
  const queryVal = useQuery(GET_PROPOSALS, {
    fetchPolicy: "network-only",
    variables: {
      selectedPRep: selectedPRep,
      first: (activePage - 1) * perPage,
      end: activePage * perPage - 1,
    },
  });

  return (
    <NoteProposals
      {...queryVal}
      pRep={selectedPRep}
      createNewProposal={createNewProposal}
      activePage={activePage}
      itemPerPage={perPage}
      handlePageChange={handlePageChange}
    />
  );
}

export default NoteProposalsContainer;
