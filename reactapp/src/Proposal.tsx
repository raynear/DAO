import React from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import {
  Paper,
  Typography,
  FormControlLabel,
  FormControl,
  RadioGroup,
  Radio,
  Grid
} from "@material-ui/core";

import useStyles from "./Style";

const GET_PROPOSAL = gql`
  query Proposal($id: Int!) {
    proposal(id: $id) {
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

function Proposal({ match }: any) {
  const classes = useStyles();

  const id = match.params.id;
  const { loading, error, data } = useQuery(GET_PROPOSAL, {
    variables: { id: id }
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!:{error}</p>;
  return (
    <Grid className={classes.grid} item xs={12} lg={6}>
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
          {data.proposal[0].subject}
        </Typography>
        <Typography variant="h6" color="textSecondary">
          {data.proposal[0].contents}
        </Typography>
        <FormControl>
          <RadioGroup>
            {data.proposal[0].selectitemmodelSet.map(
              (selectItem: selectItem, idx: number) => (
                <FormControlLabel
                  key={idx}
                  control={<Radio />}
                  value={selectItem.contents}
                  label={selectItem.contents}
                />
              )
            )}
          </RadioGroup>
        </FormControl>
      </Paper>
    </Grid>
  );
}

export default Proposal;
