import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks"
import { GET_PREPS, GET_VIEWER } from "./GQL";
import { jsonRpcCall, governanceCall } from "./IconConnect";
import SelectPRep from "./SelectPRep";

function SelectPRepContainer(props: any) {
  // console.log("select prep container props", props);
  const [delegations, setDelegations] = useState<any>(false);

  const queryVal = useQuery(GET_PREPS);

  const handleClick = (PRepName: string) => {
    props.history.push("/Proposals/" + PRepName)
  }

  const queryViewer = useQuery(GET_VIEWER);

  if (queryViewer.data && queryViewer.data.viewer && queryViewer.data.viewer.username && !delegations) {
    jsonRpcCall("get_verify_info_by_id", { "_id": queryViewer.data.viewer.username }).then((result) => {
      const resultJson = JSON.parse(result);
      governanceCall("getDelegation", { "address": resultJson.address }).then((result2) => {
        setDelegations(result2.delegations);
      });
    });
  }

  async function getPRepName(address: string) {
    const result = await governanceCall("getDelegation", { "address": address });
    if (result && result.name) {
      return result.name;
    }
    return address;
  }

  return (
    <SelectPRep
      {...queryVal}
      selectedPRep={props.selectedPRep}
      delegations={delegations}
      handleClick={handleClick}
      getPRepName={getPRepName}
    />
  )
}

export default SelectPRepContainer;
