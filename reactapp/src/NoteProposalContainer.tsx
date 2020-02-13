import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { SET_PUBLISH, GET_PROPOSAL, GET_VIEWER } from "./GQL";

import { governanceCall } from "./IconConnect";

import NoteProposal from "./NoteProposal";


function NoteProposalContainer(props: any) {
  // console.log("NoteProposalContainer props", props);
  const pRep = props.match.params.PRep
  const id = props.match.params.ID;

  const [voteSelect, setVoteSelect] = useState();
  const [value, setValue] = useState({ load: false, owner: false, totalVotingPower: 0, pRepVotingPower: 0 });

  const [mutatePublish] = useMutation(SET_PUBLISH);

  function publish() {
    mutatePublish({
      variables: { proposalId: id }
    }).then(publishResult => {
      // console.log("publish", publishResult);
    });
    // console.log("Publish!!!!!!!!!!!!!!", queryVal.data.proposal);
    setVoteSelect(-1);
    props.history.push("/Proposals/" + pRep);
    // window.location.reload();
    // queryVal.refetch();
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("Selected", (event.target as HTMLInputElement).value);
    setVoteSelect(parseInt((event.target as HTMLInputElement).value));
  };

  async function getTotalVotingPower(prepAddress: string) {
    const delegateResp = await governanceCall("getPRep", { address: prepAddress });

    return parseInt(delegateResp.delegated, 16) / 1000000000000000000;
  }

  async function getVotersVotingPower(prepAddress: string, voterAddress: string) {
    const delegateResp = await governanceCall("getDelegation", { address: voterAddress });
    // console.log(delegateResp);
    for (const aPRepKey in delegateResp.delegations) {
      const aPRep = delegateResp.delegations[aPRepKey];
      if (aPRep.address === prepAddress) {
        // console.log(")()(())())()()(", aPRep.value);
        return parseInt(aPRep.value, 16);
      }
    }
    return 0;
  }

  function amIOwner() {
    if (queryVal.data.proposal.prep.username === queryViewer.data.viewer.username) {
      return true;
    }
    return false;
  }

  const queryViewer = useQuery(GET_VIEWER);
  const queryVal = useQuery(GET_PROPOSAL, { variables: { id: id } })

  if (queryVal.loading || queryViewer.loading) {
    return <p>loading</p>
  }
  // console.log("___________________________________________");
  // console.log(queryVal, queryViewer);

  if (queryVal && queryVal.data && queryViewer.data) {
    if (!value.load) {
      // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", result);
      getTotalVotingPower(queryVal.data.proposal.prep.iconAddress).then((result) => {
        getVotersVotingPower(queryVal.data.proposal.prep.iconAddress, queryViewer.data.viewer.iconAddress).then((result2) => {
          setValue({ load: true, owner: amIOwner(), totalVotingPower: result, pRepVotingPower: result2 });
        });
      });
    }
    // console.log("condition value", myPRep, votedIdx, owner);
  }

  return (
    <NoteProposal
      pRep={pRep}
      id={id}
      value={value}
      voteSelect={voteSelect}
      publish={publish}
      handleChange={handleChange}
      {...queryVal}
    />
  );
}

export default NoteProposalContainer;