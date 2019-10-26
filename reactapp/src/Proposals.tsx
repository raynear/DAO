import React from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import "apollo-cache-control";
import {
  Paper,
  Typography,
  Link,
  Grid,
  Button,
  TextField
} from "@material-ui/core";

import useStyles from "./Style";

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
  search: string;
  first: number;
  skip: number;
}

function Proposals() {
  const classes = useStyles();
  const [values, setValues] = React.useState<value>({
    search: "",
    first: 10,
    skip: 0
  });
  const [queryValues, setQueryValues] = React.useState<value>({
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
    <Grid container className={classes.container} spacing={0}>
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
        <Grid className={classes.grid} key={idx} item xs={12} lg={6}>
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
            <Typography variant="h6" color="textSecondary">
              {item.contents}
            </Typography>
            {item.selectitemmodelSet.map((selectItem, idx) => (
              <Typography variant="body1" key={idx} color="textSecondary">
                {selectItem.contents}
              </Typography>
            ))}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default Proposals;
