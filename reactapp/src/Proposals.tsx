import React from 'react';
import { Fragment } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Card, CardActions, CardContent, Button, Typography, FormControl, FormLabel, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';

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

const useStyles = makeStyles((theme: Theme) => createStyles({
  card: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  formControl: {
    margin: theme.spacing(3),
  },
}));

function Proposals() {
  const classes = useStyles();
  const { loading, error, data } = useQuery(GET_PROPOSALS);
  if (loading) return (<p>Loading...</p>);
  if (error) return (<p>Error!:{error}</p>);
  return (
    <div>
      {data.allProposal.map((item: proposal) => (
        <Card className={classes.card}>
          <CardContent>
            <Typography className={classes.title} color="textSecondary" gutterBottom>{item.subject}</Typography>
            <Typography variant="h5">{item.contents}</Typography>
            <FormControl>
              <RadioGroup>
                {item.selectitemmodelSet.map((selectItem) => (
                  <FormControlLabel control={<Radio />} value={selectItem.contents} label={selectItem.contents} />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default Proposals;