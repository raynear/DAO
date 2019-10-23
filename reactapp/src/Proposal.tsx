import React, { Fragment } from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import {
  Paper,
  Typography,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Grid
} from "@material-ui/core";

import useStyles from "./Style";

const GET_PROPOSAL = gql`
  query {
    allProposal {
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

function Proposal() {
  const classes = useStyles();

  const { loading, error, data } = useQuery(GET_PROPOSAL);
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
          {data.subject}
        </Typography>
        <Typography variant="h6" color="textSecondary">
          {data.contents}
        </Typography>
        <FormControl>
          <RadioGroup>
            {/*data.selectitemmodelSet.map(selectItem => (
              <FormControlLabel
                key={selectItem.contents}
                control={<Radio />}
                value={selectItem.contents}
                label={selectItem.contents}
              />
            ))*/}
          </RadioGroup>
        </FormControl>
      </Paper>
    </Grid>
  );
}

export default Proposal;
