import React from "react";
// import { withRouter } from "react-router-dom";
import { Paper, Grid, Typography, TextField, Button, Slider } from "@material-ui/core";
import { AddRounded } from "@material-ui/icons";

import { TUIEditor } from "./TUIEditor";

import useStyles from "./Style";

function EditProposal(props: any) {
  console.log("EditProposal props", props);

  const classes = useStyles();

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
              <TUIEditor
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
                onChange={props.handleEditorChange}
              />
            </Grid>

            <Grid className={classes.item} item xs={12} md={12} lg={12}>
              <br />
              <TextField
                id="votingDue"
                label="VotingDue"
                type="number"
                value={props.values.votingDue}
                onChange={props.handleProposalChange("votingDue")}
                className={classes.textField}
                variant="outlined"
                inputProps={{ min: 0, max: 365, step: 1 }}
              />
              <Typography>Expire At {props.values.expireAt.toISOString()}</Typography>
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
              <Typography><b>Electoral TH : {props.values.electoralTh}</b></Typography>
              <Slider
                value={props.values.electoralTh}
                onChange={props.handleSliderChange("electoralTh")}
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
              <Typography><b>Winning TH : {props.values.winningTh}</b></Typography>
              <Slider
                value={props.values.winningTh}
                onChange={props.handleSliderChange("winningTh")}
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
