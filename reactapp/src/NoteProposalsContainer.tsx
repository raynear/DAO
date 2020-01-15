import React, { useState } from "react";

import { useQuery } from "@apollo/react-hooks";
import { GET_PROPOSALS } from "./GQL";
import { json_rpc_call } from "./IconConnect";

import NoteProposals from "./NoteProposals";

function NoteProposalsContainer(props: any) {
  // console.log("ProposalsContainer props", props);
  const selectedPRep = props.match.params.PRep;

  const [values, setValues] = useState({
    first: 0,
    end: 10,
    total: 0,
    page: 12,
    currPage: 0
  });
  const [filterValues, setFilterValues] = useState({
    first: 0,
    end: 10,
    total: 0,
    page: 12,
    currPage: 0
  });

  const [flag, setFlag] = useState(false);

  const handleChange = (name: any) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilterValues({ ...filterValues, [name]: event.target.value });
  };

  function queryFilters() {
    setValues(filterValues);
  }

  function createNewProposal() {
    props.history.push("/EditProposal");
  }

  const handlePageClick = (data: any) => {
    console.log(data.selected);
  }

  if (!flag) {
    if (values.total === 0) {
      json_rpc_call("GetLastProposalID", { "_Proposer": selectedPRep }).then((result) => {
        // console.log("GetLastProposalID");
        // console.log(result);
        setValues({ ...values, total: parseInt(result) })
      });
    }
    setFlag(true);
  }


  // console.log("what we send?", values);
  const queryVal = useQuery(GET_PROPOSALS, {
    fetchPolicy: "network-only",
    variables: {
      selectedPRep: selectedPRep,
      first: values.first,
      end: values.end
    }
  });

  return (
    <NoteProposals
      {...queryVal}
      PRep={selectedPRep}
      values={values}
      filterValues={filterValues}
      queryFilters={queryFilters}
      createNewProposal={createNewProposal}
      handleChange={handleChange}
      handlePageClick={handlePageClick}
    />
  );
}

export default NoteProposalsContainer;
