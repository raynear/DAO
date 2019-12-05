import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Paper, Grid, Typography, TextField, Button, Slider } from "@material-ui/core";
import { AddRounded } from "@material-ui/icons";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardDatePicker } from "@material-ui/pickers";
import SimpleReactValidator from "simple-react-validator";

import "codemirror/lib/codemirror.css";
import "tui-editor/dist/tui-editor.min.css";
import "tui-editor/dist/tui-editor-contents.min.css";
import { Editor } from "@toast-ui/react-editor";

import useStyles from "./Style";
import useForceUpdate from "./useForceUpdate";

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
  const match = props.match;
  const history = props.history;
  const location = props.location;
  const prop_proposal = props.proposal;
  const prop_submitProposal = props.submitProposal;
  console.log("EditProposal match:", match);
  console.log("EditProposal history:", history);
  console.log("EditProposal location:", location);
  console.log("proposal", prop_proposal);
  console.log("submitProposal", prop_submitProposal);

  const classes = useStyles();
  const forceUpdate = useForceUpdate();

  let editorRef = React.createRef<any>();

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

  const emptyProposal = {
    quorumRate: 50,
    tokenRate: 50,
    prep: { id: 0 },
    subject: "",
    contents: "",
    expireAt: "2019-12-18T21:11:54",
    selectitemmodelSet: []
  };

  const proposal = prop_proposal ? prop_proposal : emptyProposal;

  const [selectItems, setSelectItems] = useState(["", "", "", ""]);
  const [values, setValues] = useState({
    quorumRate: proposal.quorumRate,
    tokenRate: proposal.tokenRate,
    prepId: proposal.prep.id,
    subject: proposal.subject,
    contents: proposal.contents,
    date: new Date(proposal.expireAt)
  });

  useEffect(() => {
    let tmpSelectItems: string[] = [];
    proposal.selectitemmodelSet.map((item: any) => {
      tmpSelectItems.push(item.contents);
      return item;
    });
    if (tmpSelectItems.length > 0) {
      setSelectItems(tmpSelectItems);
    }
    editorRef.current.getInstance().setValue(values.contents);
  }, []);

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

  const handleProposalChange = (name: string) => (
    event: React.ChangeEvent<any>
  ) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleSliderChange = (name: string) => (event: any, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setValues({ ...values, [name]: newValue[0] });
    }
    else {
      setValues({ ...values, [name]: newValue });
    }
  };

  const handleEditorChange = () => {
    const value = editorRef.current.getInstance().getValue();

    setValues({ ...values, contents: value });
  };

  function handlesubmitProposal() {
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
        published: false,
        prepId: 1, // TODO : have to change1!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
        // bring prepId from account id and put it here
        quorumRate: values.quorumRate,
        tokenRate: values.tokenRate,
        expireAt:
          values.date != null
            ? values.date.toISOString()
            : "2019-10-05T09:00:00",
        selectItemList: tmpSelectItemList
      }
    };

    console.log("send mutate_var", mutate_var);
    prop_submitProposal(mutate_var);
    console.log("aAAAAAAAAAAAAAAAAAAAAAAA");
  }

  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <form>
          <Grid container className={classes.container} spacing={0}>
            <Grid className={classes.item} item xs={12} md={12} lg={12}>
              <TextField
                id="subject"
                label="Subject"
                value={values.subject}
                onChange={handleProposalChange("subject")}
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
            <Grid
              className={classes.item}
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
                  className={classes.item}
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

            <Grid className={classes.item} item xs={12} md={12} lg={12}>
              <Editor
                usageStatistics={false}
                height="600px"
                initialEditType="wysiwyg"
                useCommandShortcut={true}
                exts={[
                  {
                    name: "chart",
                    minWidth: 100,
                    maxWidth: 600,
                    minHeight: 100,
                    maxHeight: 300
                  },
                  "scrollSync",
                  "colorSyntax",
                  "uml",
                  "mark",
                  "table"
                ]}
                ref={editorRef}
                onChange={handleEditorChange}
              />
            </Grid>

            <Grid className={classes.item} item xs={12} md={12} lg={12}>
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
              className={classes.item}
              item
              style={{ textAlign: "center" }}
              xs={12}
              md={12}
              lg={12}
            >
              <Typography><b>Quorum : {values.quorumRate}</b></Typography>
              <Slider
                value={values.quorumRate}
                onChange={handleSliderChange("quorumRate")}
                defaultValue={50}
                getAriaValueText={(val) => val + "%"}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
              />
            </Grid>
            <Grid
              className={classes.item}
              item
              style={{ textAlign: "center" }}
              xs={12}
              md={12}
              lg={12}
            >
              <Typography><b>Token : {values.tokenRate}</b></Typography>
              <Slider
                value={values.tokenRate}
                onChange={handleSliderChange("tokenRate")}
                defaultValue={50}
                getAriaValueText={(val) => val + "%"}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
              />
            </Grid>
            <Grid
              className={classes.item}
              item
              style={{ textAlign: "center" }}
              xs={12}
              md={12}
              lg={12}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handlesubmitProposal}
                fullWidth
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
