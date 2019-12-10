import React, { useEffect } from "react";
// import { withRouter } from "react-router-dom";
import { Paper, Grid, Typography, TextField, Button, Slider } from "@material-ui/core";
import { AddRounded } from "@material-ui/icons";

import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardDatePicker } from "@material-ui/pickers";

import "codemirror/lib/codemirror.css";
import "tui-editor/dist/tui-editor.min.css";
import "tui-editor/dist/tui-editor-contents.min.css";
import { Editor } from "@toast-ui/react-editor";

import useStyles from "./Style";

function EditProposal(props: any) {
  console.log("EditProposal props", props);

  const classes = useStyles();

  let editorRef = React.createRef<any>();

  //  useEffect(() => {
  //    editorRef.current.getInstance().setValue(props.values.contents);
  //  });

  const handleChange = () => {
    const value = editorRef.current.getInstance().getValue();
    props.setValues({ ...props.values, contents: value });
  }

  if (props.loading) return <p>Loading...</p>;
  if (props.error) return <p>Error!:</p>;
  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <form>
          <Grid container className={classes.container} spacing={0}>
            <Grid className={classes.item} item xs={12} md={12} lg={12}>
              <TextField
                id="subject"
                label="Subject"
                value={props.values.subject}
                onChange={props.handleProposalChange("subject")}
                className={classes.textField}
                variant="outlined"
                helperText={props.validator.message(
                  "subject",
                  props.values.subject,
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
              <Button color="primary" onClick={props.addSelectItem}>
                <AddRounded />
                Add select item
              </Button>
            </Grid>
            {props.selectItems.map((item: any, idx: any) => {
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
                    onChange={props.handleSelectItemChange(idx)}
                    className={classes.textField}
                    helperText={props.validator.message("item", item, "required")}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <Button
                          color="secondary"
                          onClick={() => props.deleteSelectItem(idx)}
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
                initialValue={props.values.contents}
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
                onChange={handleChange}
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
                      value={props.values.date}
                      onChange={props.handleDateChange}
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
                      value={props.values.date}
                      onChange={props.handleDateChange}
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
              <Typography><b>Quorum : {props.values.quorumRate}</b></Typography>
              <Slider
                value={props.values.quorumRate}
                onChange={props.handleSliderChange("quorumRate")}
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
              <Typography><b>Token : {props.values.tokenRate}</b></Typography>
              <Slider
                value={props.values.tokenRate}
                onChange={props.handleSliderChange("tokenRate")}
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
                onClick={props.handlesubmitProposal}
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
