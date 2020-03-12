import React from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { SET_PUBLISH, GET_PROPOSAL, GET_VIEWER } from "./GQL";

import NoteProposal from "./NoteProposal";


function NoteProposalContainer(props: any) {
  // console.log("NoteProposalContainer props", props);
  const pRep = props.match.params.PRep
  const id = props.match.params.ID;

  const proposalDummy = {
    proposal: {
      selectitemmodelSet: [{ index: 0, contents: "..." }],
      status: "...",
      ID: 0,
      subject: "...",
      prep: { username: "..." },
      expireAt: 0,
      contents: "..."
    },
    get_prep_info_by_id: {
      delegated: 0
    }
  }

  const errorDummy = {
    proposal: {
      selectitemmodelSet: [{ index: 0, contents: "..." }],
      status: "...",
      ID: 0,
      subject: "...",
      prep: { username: "..." },
      expireAt: 0,
      contents: "..."
    },
    get_prep_info_by_id: {
      delegated: 0
    }
  }

  const [mutatePublish] = useMutation(SET_PUBLISH);

  function publish() {
    mutatePublish({
      variables: { proposalId: id }
    }).then(publishResult => {
      console.log("Publish", publishResult);
    });
    // console.log("Publish!!!!!!!!!!!!!!", queryVal.data.proposal);
    props.history.push("/Proposals/" + pRep);
  }

  const queryViewer = useQuery(GET_VIEWER);
  const queryVal = useQuery(GET_PROPOSAL, { variables: { id: id, selectedPRep: pRep } })

  if (queryVal.loading || queryViewer.loading) {
    return (
      <NoteProposal
        pRep={pRep}
        id={id}
        publish={publish}
        data={proposalDummy}
      />
    );
  }
  if (queryVal.error || queryViewer.error) {
    if (queryVal.error)
      errorDummy.proposal.contents = queryVal.error.toString();
    if (queryViewer.error)
      errorDummy.proposal.contents += queryViewer.error.toString();
    return (
      <NoteProposal
        pRep={pRep}
        id={id}
        publish={() => { }}
        data={errorDummy}
      />
    );
  }
  // console.log("___________________________________________");
  console.log(queryVal, queryViewer);

  return (
    <NoteProposal
      pRep={pRep}
      id={id}
      publish={publish}
      {...queryVal}
    />
  );
}

export default NoteProposalContainer;