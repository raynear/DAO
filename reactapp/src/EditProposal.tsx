import React, { useState } from "react";
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
import SimpleReactValidator from "simple-react-validator";

import useStyles from "./Style";
import useForceUpdate from "./useForceUpdate";

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

function EditProposal(props: any) {
  const classes = useStyles();
  const forceUpdate = useForceUpdate();

  let proposal_id: any;
  if (
    props.match !== undefined &&
    props.match.hasOwnProperty("params") &&
    props.match.params.hasOwnProperty("proposal_id")
  ) {
    proposal_id = props.match.params.proposal_id;
  } else {
    proposal_id = -1;
  }

  const emptyProposal = {
    subject: "",
    contents: "",
    board: { id: "" },
    expireAt: "2019-10-18T21:11:54",
    selectitemmodelSet: []
  };

  const proposal = props.proposal ? props.proposal : emptyProposal;

  let tmpSelectItems: string[] = [];
  proposal.selectitemmodelSet.map((item: any) => {
    tmpSelectItems.push(item.contents);
    return item;
  });

  const [selectItems, setSelectItems] = useState(tmpSelectItems);
  const [values, setValues] = useState<Proposal>({
    subject: proposal.subject,
    contents: proposal.contents,
    board: proposal.board.id,
    date: new Date(proposal.expireAt)
  });

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
    selectItems.map((item: any, idx: any) => {
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

    props.submitProposal(mutate_var);
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
                  {props.boards.length > 0 &&
                    props.boards.map((item: { id: string; name: string }) => {
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
              <TextField
                id="contentview"
                label="ContentsView"
                value={values.contents}
                multiline
                rows="20"
                margin="normal"
                fullWidth
                className={classes.textField}
                variant="outlined"
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
            {selectItems.map((item: any, idx: any) => {
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
                    helperText={validator.message("item", item, "required")}
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

export default EditProposal;
