import React, { Fragment, useState } from "react";
import { withRouter, Redirect } from "react-router-dom";

import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import { GET_PROPOSAL_N_PREP, SET_PROPOSAL, GET_LOCAL_ME } from "./GQL";

import EditProposal from "./EditProposal";

function GQLEditProposal(props: any) {
  console.log("GQLEditProposal props", props);
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

  const client = useApolloClient();

  const [username, setUsername] = useState("");
  const [redirect, setRedirect] = useState();
  const [mutateProposal] = useMutation(SET_PROPOSAL);

  client.query({ query: GET_LOCAL_ME }).then((result) => {
    console.log("get local me", result);
    try {
      setUsername(result.data.username);
    } catch {
      setUsername("");
    }
  })

  const { loading, error, data } = useQuery(GET_PROPOSAL_N_PREP, {
    variables: { id: proposal_id, UserID: username }
  });

  function submitProposal(mutate_var: any) {
    console.log("submitProposal mutate_var:", mutate_var);
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
  if (error) return <p>Error!:</p>;
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

export default GQLEditProposal;
