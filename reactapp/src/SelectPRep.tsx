import React from "react";
import {
  Grid,
  Paper,
  List,
  ListSubheader,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from "@material-ui/core";
import { Star, FiberManualRecord } from "@material-ui/icons";
import useStyles from "./Style";

function SelectPRep(props: any) {
  // console.log("select prep props", props);
  const classes = useStyles();

  if (props.loading) return <CircularProgress />;
  if (props.error) return <p>Error...</p>;

  let allPRep: any[] = [];
  try {
    for (let i = 0; i < props.regPReps.length; i++) {
      for (let j = 0; j < props.delegations.length; j++) {
        if (props.regPReps[i].address === props.delegations[j].address) {
          allPRep.push({
            username: props.regPReps[i].username,
            pRepName: props.regPReps[i].pRepName,
            iconAddress: props.regPReps[i].address,
            isMyPRep: true
          });
        }
      }
    }
    for (let i = 0; i < props.regPReps.length; i++) {
      let flag = false;
      for (let j = 0; j < allPRep.length; j++) {
        if (props.regPReps[i].username === allPRep[j].username) {
          flag = true;
        }
      }
      if (!flag) {
        allPRep.push({
          username: props.regPReps[i].username,
          pRepName: props.regPReps[i].pRepName,
          iconAddress: props.regPReps[i].address,
          isMyPRep: false
        });
      }
    }
  } catch { }
  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <Grid container className={classes.container}>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <List
              component="nav"
              subheader={
                <ListSubheader component="div">Community Vote</ListSubheader>
              }
            >
              {props.regPages.map((item: any, idx: any) => (
                <ListItem key={idx} button onClick={() => props.handleClick(item)}>
                  <ListItemIcon>
                    <FiberManualRecord />
                  </ListItemIcon>
                  <ListItemText>{item}</ListItemText>
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <List
              component="nav"
              subheader={
                <ListSubheader component="div">Select P-Rep</ListSubheader>
              }
            >
              {allPRep.map((item: any, idx: number) => (
                <ListItem
                  key={idx}
                  button
                  onClick={() => props.handleClick(item.username)}
                >
                  {item.isMyPRep && (
                    <ListItemIcon>
                      <Star />
                    </ListItemIcon>
                  )}
                  {!item.isMyPRep && (
                    <ListItemIcon>
                      <FiberManualRecord />
                    </ListItemIcon>
                  )}
                  <ListItemText>
                    {item.pRepName}
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

export default SelectPRep;
