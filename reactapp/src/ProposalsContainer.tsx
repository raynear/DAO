import React, { useState } from "react";

// import { useQuery } from "@apollo/react-hooks";
// import { GET_PROPOSALS } from "./GQL";
import { json_rpc_call } from "./IconConnect";

import Proposals from "./Proposals";

function ProposalsContainer(props: any) {
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

  const [proposals, setProposals] = useState([]);
  const [flag, setFlag] = useState(false);

  const handleChange = (name: any) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilterValues({ ...filterValues, [name]: event.target.value });
  };

  function queryFilters() {
    setValues(filterValues);
  }

  const handlePageClick = (data: any) => {
    console.log(data.selected);
  }

  if (!flag) {
    if (proposals.length === 0) {
      json_rpc_call("GetProposals", { "_Proposer": selectedPRep, "_StartProposalID": (values.first).toString(), "_EndProposalID": (values.end).toString() }).then((result) => {
        console.log("GetProposals");
        console.log(result);
        if (result) {
          let Proposals = JSON.parse(result);
          console.log("test", Proposals);
          let tmpProposals: any = [];
          let aProposal: any = {};
          if (Proposals.length > 0) {
            for (let i = 0; i < Proposals.length; i++) {
              if (Proposals[i].subject === "") {
                continue;
              }
              aProposal['id'] = Proposals[i].ID;
              aProposal['subject'] = Proposals[i].subject;
              aProposal['status'] = Proposals[i].status;
              aProposal['winner'] = Proposals[i].winner;
              let items = JSON.parse(Proposals[i].select_item)
              aProposal['select_item'] = items;

              tmpProposals.push(aProposal);
            }
            setProposals(tmpProposals);
          }
        }
      });
    }

    if (values.total === 0) {
      json_rpc_call("GetLastProposalID", { "_Proposer": selectedPRep }).then((result) => {
        console.log("GetLastProposalID");
        console.log(result);
        setValues({ ...values, total: parseInt(result) })
      });
    }
    setFlag(true);
  }


  // console.log("what we send?", values);
  // const queryVal = useQuery(GET_PROPOSALS, {
  //   fetchPolicy: "network-only",
  //   variables: {
  //     selectedPRep: selectedPRep,
  //     first: values.first,
  //     end: values.end
  //   }
  // });

  return (
    <Proposals
      //      {...queryVal}
      proposals={proposals}
      PRep={selectedPRep}
      values={values}
      filterValues={filterValues}
      queryFilters={queryFilters}
      handleChange={handleChange}
      handlePageClick={handlePageClick}
    />
  );
}

export default ProposalsContainer;
