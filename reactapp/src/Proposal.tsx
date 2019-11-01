import React, { useState, Fragment } from "react";
import {
  Paper,
  Typography,
  FormControlLabel,
  FormControl,
  RadioGroup,
  Radio,
  Button,
  Grid
} from "@material-ui/core";

import useStyles from "./Style";

interface selectItem {
  index: 0;
  contents: "";
}

function Proposal(props: any) {
  const classes = useStyles();

  const [voteSelect, setVoteSelect] = useState();

  const id = props.match.params.id;
  const proposal = props.proposal;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoteSelect(parseInt((event.target as HTMLInputElement).value));
  };

  function SelectItemList() {
    return (
      <Fragment>
        {proposal.selectitemmodelSet.map(
          (selectItem: selectItem, idx: number) => (
            <Typography key={idx}>{selectItem.contents}</Typography>
          )
        )}
      </Fragment>
    );
  }

  function RadioButtons() {
    return (
      <FormControl>
        <RadioGroup value={voteSelect} onChange={handleChange}>
          {proposal.selectitemmodelSet.map(
            (selectItem: selectItem, idx: number) => (
              <FormControlLabel
                key={idx}
                control={<Radio />}
                value={selectItem.index}
                label={selectItem.contents}
              />
            )
          )}
        </RadioGroup>
      </FormControl>
    );
  }

  function SelectList() {
    if (proposal.published === false /* || username in proposal.votedlist */) {
      return <SelectItemList />;
    } else {
      return <RadioButtons />;
    }
  }

  function VoteButton() {
    return (
      <Button
        variant="contained"
        color="primary"
        disabled={voteSelect === -1}
        onClick={() => props.Vote(voteSelect)}
      >
        Vote
      </Button>
    );
  }

  function PublishButton() {
    return (
      <Fragment>
        <Button variant="outlined" color="primary" href={"/EditProposal/" + id}>
          Edit
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => props.Publish()}
        >
          Publish
        </Button>
      </Fragment>
    );
  }

  function ActionButton() {
    if (false /*username in votedlist*/) {
      return <div> </div>;
    } else if (proposal.published) {
      return <VoteButton />;
    } else {
      return <PublishButton />;
    }
  }

  return (
    <Grid className={classes.grid} item xs={12} lg={12}>
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
          {proposal.subject}
        </Typography>
        <Typography variant="h6" color="textSecondary">
          {proposal.contents}
        </Typography>
        <Typography variant="h6" color="textPrimary">
          expire at:
          {proposal.expireAt}
        </Typography>
        <SelectList />
        <br />
        <ActionButton />
      </Paper>
    </Grid>
  );
}

export default Proposal;
