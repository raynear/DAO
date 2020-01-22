import React, { useState } from "react";

import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import { NEW_PREP, ADD_ICON_ADDRESS, VIEWER, GET_LOCAL_ADDRESS } from "./GQL";

import { jsonRpcCall, governanceCall } from "./IconConnect";

import VerifyIcon from "./VerifyIcon";

function VerifyIconContainer(props: any) {
  // console.log("VerifyIconContainer props", props);
  const client = useApolloClient();

  const [iconAddress, setIconAddress] = useState("");
  const [isPRep, setIsPRep] = useState(false);
  const [verifiedAddress, setVerifiedAddress] = useState("");
  const [mutateNewPRep] = useMutation(NEW_PREP);
  const [mutateAddIconAddress] = useMutation(ADD_ICON_ADDRESS);

  async function callVerify() {
    let result = await jsonRpcCall("get_verify_info_by_id", { "_id": queryVal.data.viewer.username });
    // console.log(queryVal.data.viewer.username, result);
    let result_json = JSON.parse(result);
    if (result_json.address) {
      setVerifiedAddress(result_json.address);
    }

    let PRepList = await governanceCall("getPReps", { "startRanking": "0x1", "endRanking": "0x60" });
    // console.log("PRepList", PRepList);
    PRepList.preps.forEach((item: any, idx: number, array: any) => {
      if (item.address === result_json.address) {
        setIsPRep(true);
        return;
      }
    });
  }

  function SelectedAddress() {
    const { loading, error, data } = useQuery(GET_LOCAL_ADDRESS);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error!:{error.message}</p>;
    if (data && data.connected_address) {
      setIconAddress(data.connected_address);
      return <p>{data.connected_address}</p>
    }
    return <p>{" "}</p>
  }

  function newPRepPage() {
    mutateNewPRep({ variables: { Address: verifiedAddress } }).then(() => {
      if (props.setActiveStep) {
        props.setActiveStep(2);
      }
      else {
        client.writeData({ data: { snack: { open: true, message: "You Make PRep Page", __typename: "snack" } } })
        props.history.push("/");
      }
    });
  }

  function addIconAddress() {
    // console.log("!@#!@#!@#", verifiedAddress);
    mutateAddIconAddress({ variables: { IconAddress: verifiedAddress } }).then((result) => {
      // console.log(result);
      if (props.setActiveStep) {
        props.setActiveStep(2);
      }
      else {
        client.writeData({ data: { snack: { open: true, message: "You Are Verified!", __typename: "snack" } } })
        props.history.push("/");
      }
    });
  }

  const queryVal = useQuery(VIEWER);
  return (<VerifyIcon
    {...queryVal}
    activeStep={props.activeStep}
    SelectedAddress={SelectedAddress}
    newPRepPage={newPRepPage}
    addIconAddress={addIconAddress}
    callVerify={callVerify}
    iconAddress={iconAddress}
    verifiedAddress={verifiedAddress}
    isPRep={isPRep}
  />);
}

export default VerifyIconContainer;