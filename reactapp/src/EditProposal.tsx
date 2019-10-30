import React, { useState, useMemo } from "react";
import SimpleReactValidator from "simple-react-validator";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import {
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem
} from "@material-ui/core";
import { AddRounded } from "@material-ui/icons";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker
} from "@material-ui/pickers";

import useStyles from "./Style";
import useForceUpdate from "./useForceUpdate";

const GET_PROPOSAL = gql`
  query Proposal($id: Int!) {
    proposal(id: $id) {
      board {
        id
      }
      subject
      contents
      published
      expireAt
      selectitemmodelSet {
        id
        index
        contents
      }
    }
    allBoard {
      id
      name
    }
  }
`;

const SET_PROPOSAL = gql`
  mutation SetProposal(
    $proposalId: Int
    $subject: String!
    $contents: String!
    $boardId: Int!
    $published: Boolean!
    $expireAt: DateTime!
    $selectItemList: [SelectItemInput]
  ) {
    setProposal(
      proposalId: $proposalId
      subject: $subject
      contents: $contents
      boardId: $boardId
      published: $published
      expireAt: $expireAt
      selectItemList: $selectItemList
    ) {
      proposal {
        id
        selectitemmodelSet {
          id
        }
      }
    }
  }
`;

interface Board {
  id: string;
  name: string;
}
interface Proposal {
  subject: string;
  contents: string;
  board: string;
  date: Date;
}

const validator = new SimpleReactValidator({
  locale: "en",
  className: "text-danger",
  element: (message: any, className: any) => (
    <Typography variant="caption" color="error" className={className}>
      {message}
    </Typography>
  )
});

function ProposalForm({ match }: any) {
  const classes = useStyles();
  const forceUpdate = useForceUpdate();

  let proposal_id: any;
  if (
    match !== undefined &&
    match.hasOwnProperty("params") &&
    match.params.hasOwnProperty("proposal_id")
  ) {
    proposal_id = match.params.proposal_id;
  } else {
    proposal_id = -1;
  }

  const [selectItems, setSelectItems] = useState(["", ""]);
  const [values, setValues] = useState<Proposal>({
    subject: "",
    contents: "",
    board: "",
    date: new Date("2019-10-18T21:11:54")
  });
  const [boards, setBoards] = useState([]);

  const [mutateProposal] = useMutation(SET_PROPOSAL);

  const { loading, error, data } = useQuery(GET_PROPOSAL, {
    variables: { id: proposal_id }
  });

  useMemo(() => {
    if (!loading && !error && data) {
      let aBoards = data.allBoard.map((item: Board) => ({
        id: item.id,
        name: item.name
      }));
      setBoards(aBoards);
    }

    if (
      data !== undefined &&
      data !== null &&
      data.hasOwnProperty("proposal") &&
      data.proposal !== null
    ) {
      const aProposal = data.proposal;
      setValues({
        subject: aProposal.subject,
        contents: aProposal.contents,
        board: aProposal.board.id,
        date: new Date(aProposal.expireAt)
      });

      //      setSelectedDate(new Date(aProposal.expireAt));

      let tmpSelectItems: string[] = [];
      aProposal.selectitemmodelSet.map((item: any, idx: number) => {
        tmpSelectItems.push(item.contents);
        return item;
      });
      setSelectItems(tmpSelectItems);
    }
  }, [data]);

  if (data !== undefined && data.proposal.published) {
    return (
      <Grid className={classes.grid} item xs={12} md={12} lg={12}>
        <Paper className={classes.paper}>
          <Typography variant="h5" color="secondary">
            Proposal "{data.proposal.subject}" is already published.
          </Typography>
          <Typography variant="h5" color="textPrimary">
            Published Proposal edit is prohibited.
          </Typography>
        </Paper>
      </Grid>
    );
  }

  const addSelectItem = () => {
    setSelectItems([...selectItems, ""]);
  };

  const handleSelectItemChange = (index: number) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectItems([
      ...selectItems.slice(0, index),
      event.target.value,
      ...selectItems.slice(index + 1)
    ]);
  };

  function deleteSelectItem(index: number) {
    let tmp = selectItems;
    tmp.splice(index, 1);
    setSelectItems(tmp);
    forceUpdate();
  }

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setValues({ ...values, date: date });
    }
  };

  const handleProposalChange = (name: keyof Proposal) => (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    setValues({ ...values, [name]: event.target.value });
  };

  function submitProposal() {
    if (!validator.allValid()) {
      validator.showMessages();
      forceUpdate();
      return;
    }

    let tmpSelectItemList: { index: Number; contents: String }[] = [];
    selectItems.map((item, idx) => {
      tmpSelectItemList.push({
        index: idx,
        contents: item
      });
      //await mutateSelectItem({ variables: { proposalID: newProposalID, contents: item.value } });
      return item;
    });

    let mutate_var: { [index: string]: any } = {
      variables: {
        proposalId: proposal_id,
        subject: values.subject,
        contents: values.contents,
        boardId: values.board,
        published: false,
        expireAt:
          values.date != null
            ? values.date.toISOString()
            : "2019-10-05T09:00:00",
        selectItemList: tmpSelectItemList
      }
    };

    mutateProposal(mutate_var);
  }

  return (
    <Grid className={classes.grid} item xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <form>
          <Grid container spacing={0} className={classes.container}>
            <Grid className={classes.grid} item xs={12} md={12} lg={12}>
              <FormControl className={classes.formControl}>
                <InputLabel className={classes.selectLabel}>Board</InputLabel>
                <Select
                  value={values.board}
                  onChange={handleProposalChange("board")}
                  variant="outlined"
                  style={{ minWidth: 120 }}
                >
                  {boards.length > 0 &&
                    boards.map((item: { id: string; name: string }) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      );
                    })}
                </Select>
                {validator.message("select", values.board, "required") && (
                  <FormHelperText>
                    <Typography variant="caption" color="error">
                      {validator.message("select", values.board, "required")}
                    </Typography>
                  </FormHelperText>
                )}
              </FormControl>
              <br />
            </Grid>
            <Grid className={classes.grid} item xs={12} md={12} lg={12}>
              <TextField
                id="subject"
                label="Subject"
                value={values.subject}
                onChange={handleProposalChange("subject")}
                margin="normal"
                fullWidth
                className={classes.textField}
                variant="outlined"
                helperText={validator.message(
                  "subject",
                  values.subject,
                  "required|min:10"
                )}
              />
              <br />
            </Grid>
            <Grid className={classes.grid} item xs={12} md={12} lg={12}>
              <TextField
                id="content"
                label="Contents"
                value={values.contents}
                onChange={handleProposalChange("contents")}
                multiline
                rows="20"
                placeholder="Proposal Contents"
                margin="normal"
                fullWidth
                className={classes.textField}
                variant="outlined"
                helperText={validator.message(
                  "contents",
                  values.contents,
                  "required|min:10"
                )}
              />
            </Grid>
            <Grid className={classes.grid} item xs={12} md={12} lg={12}>
              <br />
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid
                  className={classes.container}
                  container
                  justify="space-around"
                >
                  <Grid item>
                    <KeyboardDatePicker
                      disableToolbar
                      variant="inline"
                      format="MM/dd/yyyy"
                      margin="normal"
                      id="date-picker-inline"
                      label="Date picker inline"
                      className={classes.textField}
                      value={values.date}
                      onChange={handleDateChange}
                      KeyboardButtonProps={{
                        "aria-label": "change date"
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <KeyboardTimePicker
                      margin="normal"
                      variant="inline"
                      id="time-picker"
                      label="Time picker"
                      className={classes.textField}
                      value={values.date}
                      onChange={handleDateChange}
                      KeyboardButtonProps={{
                        "aria-label": "change time"
                      }}
                    />
                  </Grid>
                </Grid>
              </MuiPickersUtilsProvider>
              <br />
            </Grid>
            <Grid
              className={classes.grid}
              item
              xs={12}
              md={12}
              lg={12}
              style={{ textAlign: "right" }}
            >
              <Button color="primary" onClick={addSelectItem}>
                <AddRounded />
                Add select item
              </Button>
            </Grid>
            {selectItems.map((item, idx) => {
              return (
                <Grid
                  className={classes.grid}
                  key={idx}
                  item
                  xs={12}
                  md={12}
                  lg={12}
                >
                  <TextField
                    id={String(idx + 1)}
                    label={String(idx + 1)}
                    name={String(idx + 1)}
                    value={item}
                    onChange={handleSelectItemChange(idx)}
                    fullWidth
                    className={classes.textField}
                    helperText={validator.message("contents", item, "required")}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <Button
                          color="secondary"
                          onClick={() => deleteSelectItem(idx)}
                        >
                          Delete
                        </Button>
                      )
                    }}
                  />
                  <br />
                </Grid>
              );
            })}
            <Grid
              className={classes.grid}
              item
              style={{ textAlign: "center" }}
              xs={12}
              md={12}
              lg={12}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={submitProposal}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Grid>
  );
}

export default ProposalForm;
