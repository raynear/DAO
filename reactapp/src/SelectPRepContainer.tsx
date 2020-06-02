import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/react-hooks"
import { PREPS, PAGES, VIEWER } from "./GQL";
import { jsonRpcCall, governanceCall } from "./IconConnect";
import SelectPRep from "./SelectPRep";

function SelectPRepContainer(props: any) {
  // console.log("select prep container props", props);
  const [delegations, setDelegations] = useState<any>(false);
  const [pReps, setPReps] = useState<any>(false);
  const [regPages, setRegPages] = useState([]);
  const [regPReps, setRegPReps] = useState([]);

  const queryPReps = useQuery(PREPS);
  const queryPages = useQuery(PAGES);

  useEffect(() => {
    let _preps;
    try {
      _preps = queryPReps.data.get_preps;
    } catch {
      _preps = []
    }
    setRegPReps(_preps);
  }, [queryPReps.data])

  useEffect(() => {
    let _pages;
    try {
      _pages = queryPages.data.get_pages;
    } catch {
      _pages = []
    }
    setRegPages(_pages);
  }, [queryPages.data])


  const handleClick = (PRepName: string) => {
    props.history.push("/Proposals/" + PRepName)
  }

  const queryViewer = useQuery(VIEWER);

  if (queryViewer.data && queryViewer.data.viewer && queryViewer.data.viewer.username && !delegations) {
    jsonRpcCall("get_verify_info_by_id", { "_id": queryViewer.data.viewer.username }).then((result) => {
      const resultJson = JSON.parse(result);
      governanceCall("getDelegation", { "address": resultJson.address }).then((result2) => {
        setDelegations(result2.delegations);
      });
    });
  }

  if (!pReps) {
    governanceCall("getPReps", {}).then((result) => {
      setPReps(result.preps);
    })
  }

  function getPRepName(address: string) {
    for (let i = 0; i < pReps.length; i++) {
      if (pReps[i].address === address) {
        return pReps[i].username;
      }
    }
    return address;
  }

  return (
    <SelectPRep
      regPages={regPages}
      regPReps={regPReps}
      selectedPRep={props.selectedPRep}
      delegations={delegations}
      handleClick={handleClick}
      getPRepName={getPRepName}
    />
  )
}

export default SelectPRepContainer;
