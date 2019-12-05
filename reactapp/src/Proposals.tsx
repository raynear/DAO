import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { Paper, Typography, Grid, Button, TextField } from "@material-ui/core";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";

import { useQuery } from "@apollo/react-hooks";
import { GET_PROPOSALS } from "./GQL";
import { json_rpc_call } from "./IconConnect";
import PRepSelectList from "./PRepSelectList";

import useStyles from "./Style";

interface selectItem {
  id: "";
  contents: "";
}

interface proposal {
  id: "";
  subject: "";
  contents: "";
  selectitemmodelSet: Array<selectItem>;
}

interface value {
  selectedPRep: string;
  search: string;
  first: number;
  skip: number;
}

function Proposals(props: any) {
  console.log("Proposals props", props);
  const classes = useStyles();
  const [values, setValues] = useState<value>({
    selectedPRep: "",
    search: "",
    first: 10,
    skip: 0
  });
  const [queryValues, setQueryValues] = useState<value>({
    selectedPRep: "",
    search: "",
    first: 10,
    skip: 0
  });

  const handleChange = (name: keyof value) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setQueryValues({ ...values, [name]: event.target.value });
  };

  function queryFilters() {
    setValues(queryValues);
  }

  useEffect(() => {
    const result = json_rpc_call("GetVerifyInfoByID", { "_ID": "raynear3" });
    console.log("result", result);
    //    const result2 = json_rpc_call("getDelegation", { "address": result.data.ID });
    //    console.log("result2", result2);
  }, [])

  function ChangeSelection(select: string) {
    setValues({ ...values, selectedPRep: select });
  }

  console.log("what we send?", values);
  const { loading, error, data } = useQuery(GET_PROPOSALS, {
    fetchPolicy: "network-only",
    variables: {
      selectedPRep: values.selectedPRep,
      search: values.search,
      first: values.first,
      skip: values.skip
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <Grid container className={classes.container} spacing={0}>
          <Grid item className={classes.item} xs={12} lg={12}>
            <PRepSelectList SelectedPRep={values.selectedPRep} ChangeSelection={ChangeSelection} />
          </Grid>
          <Grid item className={classes.item} xs={12} lg={12}>
            <Grid container className={classes.container} spacing={0}>
              <Grid item className={classes.item} xs={3} lg={3}>
                <TextField
                  className={classes.textField}
                  label="search"
                  type="text"
                  value={queryValues.search}
                  onChange={handleChange("search")}
                />
              </Grid>
              <Grid item className={classes.item} xs={3} lg={3}>
                <TextField
                  className={classes.textField}
                  label="first"
                  type="number"
                  value={queryValues.first}
                  onChange={handleChange("first")}
                />
              </Grid>
              <Grid item className={classes.item} xs={3} lg={3}>
                <TextField
                  className={classes.textField}
                  label="skip"
                  type="number"
                  value={queryValues.skip}
                  onChange={handleChange("skip")}
                />
              </Grid>
              <Grid item className={clsx(classes.item, classes.center)} xs={3} lg={3}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => queryFilters()}
                >
                  fetch!
                </Button>
              </Grid>
            </Grid>
          </Grid>
          {data.proposals.map((item: proposal, idx: number) => (
            <Grid item className={classes.item} key={idx} xs={12} lg={6}>
              <Paper className={classes.paper}>
                <Typography
                  className={classes.title}
                  color="textSecondary"
                  gutterBottom
                >
                  {" "}
                  Type Of Proposal
                </Typography>
                <Typography variant="h5" color="textPrimary" gutterBottom>
                  <Link to={"/Proposal/" + item.id} color="textPrimary">
                    {item.subject}
                  </Link>
                </Typography>
                <ReactMarkdown
                  source={item.contents.split("\n").join("  \n")}
                  skipHtml={false}
                  escapeHtml={false}
                />
                {item.selectitemmodelSet.map((selectItem, idx) => (
                  <Typography variant="body1" key={idx} color="textSecondary">
                    {selectItem.contents}
                  </Typography>
                ))}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Grid>
  );
}

export default Proposals;
