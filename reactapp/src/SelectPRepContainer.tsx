import React from "react";
import { useQuery } from "@apollo/react-hooks"
import { GET_PREPS } from "./GQL";
import { jsonRpcCall } from "./IconConnect";
import SelectPRep from "./SelectPRep";

function SelectPRepContainer(props: any) {
  // console.log("select prep props", props);

  const queryVal = useQuery(GET_PREPS);

  const handleClick = (PRepName: string) => {
    props.history.push("/Proposals/" + PRepName)
  }

  const data = queryVal.data;
  // console.log(data);
  if (data && data.username) {
    jsonRpcCall("GetVerifyInfoByID", { "_ID": data.username }).then((result) => {
      // console.log("result", result);
      jsonRpcCall("getDelegation", { "address": result.data.ID }).then((result2) => {
        // console.log("result2", result2);
      });
    });
  }
  // myPReps list 상위로 배치하기

  return <SelectPRep {...queryVal} selectedPRep={props.selectedPRep} handleClick={handleClick} />
}

export default SelectPRepContainer;
