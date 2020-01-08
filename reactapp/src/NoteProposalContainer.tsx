import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { SET_PUBLISH, GET_PROPOSAL, VIEWER } from "./GQL";

import { governance_call } from "./IconConnect";

import NoteProposal from "./NoteProposal";


function NoteProposalContainer(props: any) {
  // console.log("NoteProposalContainer props", props);
  const PRep = props.match.params.PRep
  const id = props.match.params.ID;

  const [voteSelect, setVoteSelect] = useState();
  const [value, setValue] = useState({ load: false, owner: false, totalVotingPower: 0, pRepVotingPower: 0 });

  const [mutatePublish] = useMutation(SET_PUBLISH);

  function Publish() {
    mutatePublish({
      variables: { proposalId: id }
    }).then(publishResult => {
      // console.log("publish", publishResult);
    });
    // console.log("Publish!!!!!!!!!!!!!!", queryVal.data.proposal);
    setVoteSelect(-1);
    props.history.push("/Proposals/" + PRep);
    // window.location.reload();
    // queryVal.refetch();
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("Selected", (event.target as HTMLInputElement).value);
    setVoteSelect(parseInt((event.target as HTMLInputElement).value));
  };

  async function GetTotalVotingPower(prepAddress: string) {
    const delegateResp = await governance_call("getPRep", { address: prepAddress });

    return parseInt(delegateResp.delegated, 16) / 1000000000000000000;
  }

  async function GetVotersVotingPower(prepAddress: string, voterAddress: string) {
    const delegateResp = await governance_call("getDelegation", { address: voterAddress });
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

  const queryViewer = useQuery(VIEWER);
  const queryVal = useQuery(GET_PROPOSAL, { variables: { id: id } })

  if (queryVal.loading || queryViewer.loading) {
    return <p>loading</p>
  }
  // console.log("___________________________________________");
  // console.log(queryVal, queryViewer);

  if (queryVal && queryVal.data && queryViewer.data) {
    if (!value.load) {
      // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", result);
      GetTotalVotingPower(queryVal.data.proposal.prep.iconAddress).then((result) => {
        GetVotersVotingPower(queryVal.data.proposal.prep.iconAddress, queryViewer.data.viewer.iconAddress).then((result2) => {
          setValue({ load: true, owner: amIOwner(), totalVotingPower: result, pRepVotingPower: result2 });
        });
      });
    }
    // console.log("condition value", myPRep, votedIdx, owner);
  }

  return (
    <NoteProposal
      PRep={PRep}
      id={id}
      value={value}
      voteSelect={voteSelect}
      Publish={Publish}
      handleChange={handleChange}
      {...queryVal}
    />
  );
}

export default NoteProposalContainer;