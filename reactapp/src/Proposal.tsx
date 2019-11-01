import React, { useState, Fragment } from "react";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
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

import useForceUpdate from "./useForceUpdate";

import useStyles from "./Style";

const GET_PROPOSAL = gql`
  query Proposal($id: Int!) {
    proposal(id: $id) {
      author {
        username
      }
      subject
      contents
      published
      expireAt
      selectitemmodelSet {
        index
        contents
      }
    }
    me {
      username
    }
  }
`;

const SET_PUBLISH = gql`
  mutation PublishProposal($proposalId: Int!) {
    publishProposal(proposalId: $proposalId) {
      proposal {
        author {
          username
        }
        subject
        contents
        published
        expireAt
        selectitemmodelSet {
          index
          contents
        }
      }
    }
  }
`;

const SET_VOTE = gql`
  mutation VoteProposal($proposalId: Int!, $selectItemIndex: Int!) {
    voteProposal(proposalId: $proposalId, selectItemIndex: $selectItemIndex) {
      vote {
        id
      }
    }
  }
`;

interface selectItem {
  index: 0;
  contents: "";
}

function Proposal({ match }: any) {
  const classes = useStyles();
  const forceUpdate = useForceUpdate();

  const [values, setValues] = useState();
  const [voteSelect, setVoteSelect] = useState();

  const id = match.params.id;

  const [mutatePublish] = useMutation(SET_PUBLISH);
  const [mutateVote] = useMutation(SET_VOTE);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoteSelect(parseInt((event.target as HTMLInputElement).value));
  };

  const { loading, error, data } = useQuery(GET_PROPOSAL, {
    variables: { id: id }
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!:{error}</p>;

  function SelectItemList() {
    return (
      <div>
        {data.proposal.selectitemmodelSet.map(
          (selectItem: selectItem, idx: number) => (
            <Typography key={idx}>{selectItem.contents}</Typography>
          )
        )}
      </div>
    );
  }

  function RadioButtons() {
    return (
      <FormControl>
        <RadioGroup value={voteSelect} onChange={handleChange}>
          {data.proposal.selectitemmodelSet.map(
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
    if (data.proposal.published === false) {
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
        onClick={() => Vote()}
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
        <Button variant="contained" color="primary" onClick={() => Publish()}>
          Publish
        </Button>
      </Fragment>
    );
  }

  function Publish() {
    mutatePublish({
      variables: { proposalId: id }
    }).then(() => {
      forceUpdate();
    });
  }

  function Vote() {
    mutateVote({
      variables: { proposalId: id, selectItemIndex: voteSelect }
    }).then(() => {
      forceUpdate();
    });
  }

  function ActionButton() {
    if (data.proposal.published) {
      return <VoteButton />;
    } else {
      return <PublishButton />;
    }
  }

  if (
    data.proposal.author.username !== data.me.username &&
    !data.proposal.published
  ) {
    return <Typography>it's not published</Typography>;
  }

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
          {data.proposal.subject}
        </Typography>
        <Typography variant="h6" color="textSecondary">
          {data.proposal.contents}
        </Typography>
        <Typography variant="h6" color="textPrimary">
          expire at:
          {data.proposal.expireAt}
        </Typography>
        <SelectList />
        <br />
        <ActionButton />
      </Paper>
    </Grid>
  );
}

export default Proposal;
