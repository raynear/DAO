import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks"
import { GET_PREPS } from "./GQL";
import { jsonRpcCall, governanceCall } from "./IconConnect";
import SelectPRep from "./SelectPRep";

function SelectPRepContainer(props: any) {
  // console.log("select prep props", props);
  const [delegations, setDelegations] = useState<any>(false);

  const queryVal = useQuery(GET_PREPS);

  const handleClick = (PRepName: string) => {
    props.history.push("/Proposals/" + PRepName)
  }

  if (queryVal.data && !delegations) {
    jsonRpcCall("get_verify_info_by_id", { "_id": queryVal.data.viewer.username }).then((result) => {
      const resultJson = JSON.parse(result);
      governanceCall("getDelegation", { "address": resultJson.address }).then((result2) => {
        setDelegations(result2.delegations);
      });
    });
  }
  // myPReps list 상위로 배치하기

  return (
    <SelectPRep
      {...queryVal}
      selectedPRep={props.selectedPRep}
      delegations={delegations}
      handleClick={handleClick}
    />
  )
}

export default SelectPRepContainer;
