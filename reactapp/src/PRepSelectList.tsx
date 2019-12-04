import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import { FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";
import { useQuery } from "@apollo/react-hooks"
import { GET_PREPS } from "./GQL";
import { json_rpc_call } from "./IconConnect";
import useStyles from "./Style";

function PRepSelectList(props: any) {
  console.log("proposals props", props);
  const classes = useStyles();
  const [selectedPRep, setSelectedPRep] = useState("All");

  const handleChange = (event: any) => {
    setSelectedPRep(event.target.value);
  };

  const { loading, error, data } = useQuery(GET_PREPS);
  if (loading) { console.log("loading", loading); return <p>Loading...</p> }
  if (error) { console.log("error", error); return <p>Error...</p> }

  console.log(data);
  if (data && data !== undefined && data.hasOwnProperty("username") && data.username !== undefined) {
    json_rpc_call("GetVerifyInfoByID", { "_ID": data.username }).then((result) => {
      console.log("result", result);
      json_rpc_call("getDelegation", { "address": result.data.ID }).then((result2) => {
        console.log("result2", result2);
      });
    });
  }
  // myPReps list 상위로 배치하기

  let allPRep;
  try {
    allPRep = data.allPrep;
  } catch {
    allPRep = [];
  }
  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel className={classes.selectLabel}>PReps</InputLabel>
      <Select
        value={selectedPRep}
        onChange={handleChange}
        style={{ minWidth: 120 }}
      >
        <MenuItem selected={true} value={"All"}>
          All PReps
        </MenuItem>
        {allPRep.map((item: any) => (
          <MenuItem key={item.id} value={item.name}>
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default withRouter(PRepSelectList);
