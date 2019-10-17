import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Card, CardContent, Typography, FormControl, FormControlLabel, Radio, RadioGroup, Container, Grid } from '@material-ui/core';

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
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={3}>
        {data.allProposal.map((item: proposal) => (
          <Grid item xs={12} md={8} lg={9}>
            <Card key={item.id} className={classes.card}>
              <CardContent>
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Proposals;