import React, { Fragment, useState } from "react";
import { withRouter, Redirect } from "react-router-dom";

import { useQuery, useMutation } from "@apollo/react-hooks";
import { GET_PROPOSAL, SET_PROPOSAL } from "./GQL";

import EditProposal from "./EditProposal";

function GQLEditProposal(props: any) {
  console.log("GQLEditProposal match", props.match);
  console.log("GQLEditProposal history", props.history);
  console.log("GQLEditProposal location", props.location);

  let proposal_id: any;
  if (
    props.match !== undefined &&
    props.match.hasOwnProperty("params") &&
    props.match.params.hasOwnProperty("proposal_id")
  ) {
    proposal_id = props.match.params.proposal_id;
  } else {
    proposal_id = -1;
  }

  const [redirect, setRedirect] = useState();
  const [mutateProposal] = useMutation(SET_PROPOSAL);

  const { loading, error, data } = useQuery(GET_PROPOSAL, {
    variables: { id: proposal_id }
  });

  function submitProposal(mutate_var: any) {
    mutateProposal(mutate_var).then(result => {
      setRedirect(result.data.setProposal.proposal.id);
    });
  }

  function renderRedirect() {
    if (redirect) {
      return <Redirect to={"/Proposal/" + redirect} />;
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!:{error}</p>;
  return (
    <Fragment>
      {renderRedirect()}
      <EditProposal
        boards={data.allBoard}
        proposal={data.proposal}
        submitProposal={submitProposal}
      />
    </Fragment>
  );
}

export default withRouter(GQLEditProposal);
