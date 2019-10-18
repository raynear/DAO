import React, { Fragment } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Paper, Typography, FormControl, FormControlLabel, Radio, RadioGroup, Grid } from '@material-ui/core';

import useStyles from './Style';

const GET_PROPOSALS = gql`
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
  id: "",
  contents: ""
}

interface proposal {
  id: "",
  subject: "",
  contents: "",
  selectitemmodelSet: Array<selectItem>
}

function Proposals() {
  const classes = useStyles();
  const { loading, error, data } = useQuery(GET_PROPOSALS);
  if (loading) return (<p>Loading...</p>);
  if (error) return (<p>Error!:{error}</p>);
  return (
    <Fragment>
      {data.allProposal.map((item: proposal, idx: number) => (
        <Grid className={classes.grid} key={idx} item xs={12} lg={6}>
          <Paper className={classes.paper}>
            <Typography className={classes.title} color="textSecondary" gutterBottom> Type Of Proposal</Typography>
            <Typography variant="h5" color="textPrimary" gutterBottom>{item.subject}</Typography>
            <Typography variant="h6" color="textSecondary">{item.contents}</Typography>
            <FormControl>
              <RadioGroup>
                {item.selectitemmodelSet.map((selectItem) => (
                  <FormControlLabel key={selectItem.contents} control={<Radio />} value={selectItem.contents} label={selectItem.contents} />
                ))}
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>
      ))}
    </Fragment>
  );
}

export default Proposals;