import React, { Fragment, useState } from "react";
import { Redirect } from "react-router-dom";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import EditProposal from "./EditProposal";

const GET_PROPOSAL = gql`
  query Proposal($id: Int!) {
    proposal(id: $id) {
      board {
        id
      }
      subject
      contents
      published
      expireAt
      selectitemmodelSet {
        id
        index
        contents
      }
    }
    allBoard {
      id
      name
    }
  }
`;

const SET_PROPOSAL = gql`
  mutation SetProposal(
    $proposalId: Int
    $subject: String!
    $contents: String!
    $boardId: Int!
    $published: Boolean!
    $expireAt: DateTime!
    $selectItemList: [SelectItemInput]
  ) {
    setProposal(
      proposalId: $proposalId
      subject: $subject
      contents: $contents
      boardId: $boardId
      published: $published
      expireAt: $expireAt
      selectItemList: $selectItemList
    ) {
      proposal {
        id
        selectitemmodelSet {
          id
        }
      }
    }
  }
`;

function GQLEditProposal({ match }: any) {
  let proposal_id: any;
  if (
    match !== undefined &&
    match.hasOwnProperty("params") &&
    match.params.hasOwnProperty("proposal_id")
  ) {
    proposal_id = match.params.proposal_id;
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
        match={match}
        boards={data.allBoard}
        proposal={data.proposal}
        submitProposal={submitProposal}
      />
    </Fragment>
  );
}

export default GQLEditProposal;
