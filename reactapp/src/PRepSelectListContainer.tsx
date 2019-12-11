import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks"
import { GET_PREPS } from "./GQL";
import { json_rpc_call } from "./IconConnect";
import PRepSelectList from "./PRepSelectList";

function PRepSelectListContainer(props: any) {
  console.log("prep select list props", props);

  const queryVal = useQuery(GET_PREPS);

  const data = queryVal.data;
  console.log(data);
  if (data && data.username) {
    json_rpc_call("GetVerifyInfoByID", { "_ID": data.username }).then((result) => {
      console.log("result", result);
      json_rpc_call("getDelegation", { "address": result.data.ID }).then((result2) => {
        console.log("result2", result2);
      });
    });
  }
  // myPReps list 상위로 배치하기

  return <PRepSelectList {...queryVal} selectedPRep={props.selectedPRep} handleChange={props.handleChange} />
}

export default PRepSelectListContainer;
