import React, { useState, useEffect } from "react";
// import { Redirect } from "react-router-dom";
import { FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";
import { json_rpc_call } from "./IconConnect";
import useStyles from "./Style";

function PRepSelectList(props: any) {
  console.log("proposals props", props);
  const classes = useStyles();
  const [selectedPRep, setSelectedPRep] = useState();

  let myPReps: any[] = [];

  const handleChange = (event: any) => {
    setSelectedPRep(event.target.value);
  };

  useEffect(() => {
    const result = json_rpc_call("GetVerifyInfoByID", { "_ID": "raynear3" });
    console.log("result", result);
    // const result2 = json_rpc_call("getDelegation", { "address": result.data.ID });
    // console.log("result2", result2);
    // myPReps list 상위로 배치하기
  }, [])

  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel className={classes.selectLabel}>PReps</InputLabel>
      <Select
        value={selectedPRep}
        onChange={handleChange}
        style={{ minWidth: 120 }}
      >
        {myPReps.map((item: any) => (
          <MenuItem value={item.id}>
            item.name
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default PRepSelectList;
