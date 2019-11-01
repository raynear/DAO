import React, { useState, useMemo } from "react";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
//import useForceUpdate from "./useForceUpdate";
import Proposal from "./Proposal";

const GET_PROPOSAL = gql`
  query Proposal($id: Int!) {
    proposal(id: $id) {
      author {
        username
      }
      subject
      contents
      published
      expireAt
      selectitemmodelSet {
        index
        contents
      }
    }
    me {
      username
    }
  }
`;

const SET_PUBLISH = gql`
  mutation PublishProposal($proposalId: Int!) {
    publishProposal(proposalId: $proposalId) {
      proposal {
        author {
          username
        }
        subject
        contents
        published
        expireAt
        selectitemmodelSet {
          index
          contents
        }
      }
    }
  }
`;

const SET_VOTE = gql`
  mutation VoteProposal($proposalId: Int!, $selectItemIndex: Int!) {
    voteProposal(proposalId: $proposalId, selectItemIndex: $selectItemIndex) {
      vote {
        id
      }
    }
  }
`;

function GQLGetProposal({ match }: any) {
  const id = match.params.id;
  //  const forceUpdate = useForceUpdate;
  const [values, setValues] = useState();

  const [mutatePublish] = useMutation(SET_PUBLISH);
  const [mutateVote] = useMutation(SET_VOTE);

  function Publish() {
    mutatePublish({
      variables: { proposalId: id }
    }).then(publishResult => {
      setValues(publishResult.data.publishProposal.proposal);
    });
  }

  function Vote(voteSelect: number) {
    mutateVote({
      variables: { proposalId: id, selectItemIndex: voteSelect }
    }).then(voteResult => {
      console.log("Vote");
      console.log(voteResult);
    });
  }

  const { loading, error, data } = useQuery(GET_PROPOSAL, {
    variables: { id: id }
  });

  useMemo(() => {
    if (data) {
      setValues(data.proposal);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!:{error}</p>;
  return (
    <Proposal proposal={values} match={match} Publish={Publish} Vote={Vote} />
  );
}

export default GQLGetProposal;
