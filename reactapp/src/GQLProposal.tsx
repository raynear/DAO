import React, { useState, useMemo } from "react";

import { useQuery, useMutation } from "@apollo/react-hooks";
import { SET_PUBLISH, SET_VOTE, GET_PROPOSAL } from "./GQL";

import Proposal from "./Proposal";

function GQLGetProposal(props: any) {
  const id = props.match.params.ID;
  //const forceUpdate = useForceUpdate;
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
      setValues(voteResult.data.voteProposal.proposal);
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
    <Proposal proposal={values} Publish={Publish} Vote={Vote} />
  );
}

export default GQLGetProposal;
