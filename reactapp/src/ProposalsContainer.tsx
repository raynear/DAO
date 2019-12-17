import React, { useState, useEffect } from "react";

import { useQuery } from "@apollo/react-hooks";
import { GET_PROPOSALS } from "./GQL";
import { json_rpc_call } from "./IconConnect";

import Proposals from "./Proposals";

function ProposalsContainer(props: any) {
  console.log("ProposalsContainer props", props);
  const [values, setValues] = useState({
    selectedPRep: "",
    search: "",
    first: 10,
    skip: 0
  });
  const [filterValues, setFilterValues] = useState({
    selectedPRep: "",
    search: "",
    first: 10,
    skip: 0
  });

  const handleChange = (name: any) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilterValues({ ...filterValues, [name]: event.target.value });
    if (name === "selectedPRep") {
      setValues({ ...values, selectedPRep: event.target.value });
    }
  };

  function queryFilters() {
    setValues(filterValues);
  }

  useEffect(() => {
    const result = json_rpc_call("GetVerifyInfoByID", { "_ID": "raynear3" });
    console.log("result", result);
    //    const result2 = json_rpc_call("getDelegation", { "address": result.data.ID });
    //    console.log("result2", result2);
  }, [])

  console.log("what we send?", values);
  const queryVal = useQuery(GET_PROPOSALS, {
    fetchPolicy: "network-only",
    variables: {
      selectedPRep: values.selectedPRep,
      search: values.search,
      first: values.first,
      skip: values.skip
    }
  });

  return (
    <Proposals
      {...queryVal}
      values={values}
      filterValues={filterValues}
      queryFilters={queryFilters}
      handleChange={handleChange}
    />
  );
}

export default ProposalsContainer;
