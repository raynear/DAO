import React, { useState, useEffect } from "react";
// import { Redirect } from "react-router-dom";
import { FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";

import useStyles from "./Style";

import IconService from 'icon-sdk-js';

const MAIN_NET = "https://bicon.net.solidwallet.io/api/v3";
const TO_CONTRACT = "cx2e019e69cac769857042fd1efd079981bcd66a62";
const provider = new IconService.HttpProvider(MAIN_NET);
const icon_service = new IconService(provider);
const IconBuilder = IconService.IconBuilder;
// const IconConverter = IconService.IconConverter;



function PRepSelectList(props: any) {
  console.log("proposals props", props);
  const classes = useStyles();
  const [selectedPRep, setSelectedPRep] = useState();

  let myPReps: any[] = [];

  const handleChange = (event: any) => {
    setSelectedPRep(event.target.value);
  };

  useEffect(() => {
    var callBuilder = new IconBuilder.CallBuilder();
    var callObj = callBuilder
      .to("cx0c9bce7e3e198cb8917317028f08be141bfdaff0")
      .method("GetVerifyInfoByID")
      .params({ "_ID": "raynear3" })
      .build();

    const result = icon_service.call(callObj).execute();
    console.log("result", result);
    //    const result2 = json_rpc_call("getDelegation", { "address": result.data.ID });
    //    console.log("result2", result2);
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
