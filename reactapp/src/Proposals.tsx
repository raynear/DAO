import React from "react";
import { useState, useEffect } from "react";
//import { Redirect } from "react-router-dom";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import "apollo-cache-control";
import {
  Paper,
  Typography,
  Link,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@material-ui/core";

//import clsx from "clsx";

import ReactMarkdown from "react-markdown";

import useStyles from "./Style";

import IconService from 'icon-sdk-js';

const MAIN_NET = "http://localhost:9000/api/v3";
const TO_CONTRACT = "cx2e019e69cac769857042fd1efd079981bcd66a62";
const provider = new IconService.HttpProvider(MAIN_NET);
const icon_service = new IconService(provider);
const IconBuilder = IconService.IconBuilder;
const IconConverter = IconService.IconConverter;


async function json_rpc_call(method_name: string, params: any) {
  console.log("params", params);
  var callBuilder = new IconBuilder.CallBuilder();
  var callObj = callBuilder
    .to(TO_CONTRACT)
    .method(method_name)
    .params(params)
    .build();

  console.log(callObj);
  return await icon_service.call(callObj).execute();
}

const GET_PROPOSALS = gql`
  query Proposals($search: String, $first: Int, $skip: Int) {
    proposals(search: $search, first: $first, skip: $skip) {
      id
      author {
        id
        email
      }
      subject
      contents
      selectitemmodelSet {
        contents
      }
    }
  }
`;

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

  let myPReps: any[] = [];

  const handleChange = (name: keyof value) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setQueryValues({ ...values, [name]: event.target.value });
  };

  function queryFilters() {
    setValues(queryValues);
  }

  useEffect(async () => {

    var callBuilder = new IconBuilder.CallBuilder();
    var callObj = callBuilder
      .to("cx_DAO_SCORE")
      .method("GetVerifyInfoByID")
      .params({ "_ID": props.username })
      .build();

    let VerifyInfo = await icon_service.call(callObj).execute();

    const response = await json_rpc_call("getDelegation", { "address": VerifyInfo.ID });
    const delegateList = response.data;
    for (const i in delegateList) {
      myPReps.push(delegateList[i]);
    }

  }, [])


  const { loading, error, data } = useQuery(GET_PROPOSALS, {
    fetchPolicy: "network-only",
    variables: {
      search: values.search,
      first: values.first,
      skip: values.skip
    }
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!:{error}</p>;
  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.papercontainer}>
        <Grid container className={classes.container} spacing={0}>
          <Grid item className={classes.grid} xs={12} lg={12}>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel className={classes.selectLabel}>Board</InputLabel>
              <Select
                value={values.selectedPRep}
                onChange={() => handleChange("selectedPRep")}
                style={{ minWidth: 120 }}
              >
                {myPReps.map((item, idx) => {
                  <MenuItem value={item.id}>
                    item.name
                </MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item className={classes.grid} xs={12} lg={12}>
            <TextField
              className={classes.textField}
              label="search"
              type="text"
              value={queryValues.search}
              onChange={handleChange("search")}
            />
            <TextField
              className={classes.textField}
              label="first"
              type="number"
              value={queryValues.first}
              onChange={handleChange("first")}
            />
            <TextField
              className={classes.textField}
              label="skip"
              type="number"
              value={queryValues.skip}
              onChange={handleChange("skip")}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => queryFilters()}
            >
              fetch!
            </Button>
          </Grid>
          {data.proposals.map((item: proposal, idx: number) => (
            <Grid item className={classes.grid} key={idx} xs={12} lg={6}>
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
                  <Link href={"/Proposal/" + item.id} color="textPrimary">
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
