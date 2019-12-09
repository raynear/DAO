import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";
import useStyles from "./Style";

function PRepSelectList(props: any) {
  console.log("prep select list props", props);
  const classes = useStyles();

  if (props.loading) return <p>Loading...</p>
  if (props.error) { console.log("error", props.error); return <p>Error...</p> }

  let allPRep;
  try {
    allPRep = props.data.allPrep;
  } catch {
    allPRep = [];
  }
  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel className={classes.selectLabel}>PReps</InputLabel>
      <Select
        value={props.selectedPRep}
        onChange={props.handleChange}
        style={{ minWidth: 120 }}
      >
        <MenuItem value={"All"}>
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

export default PRepSelectList;
