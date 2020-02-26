import React from "react";
import { Grid, Paper, List, ListSubheader, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { Star, FiberManualRecord } from "@material-ui/icons";
import useStyles from "./Style";

function SelectPRep(props: any) {
  // console.log("select prep props", props);
  const classes = useStyles();

  if (props.loading) return <p>Loading...</p>
  if (props.error) return <p>Error...</p>

  let allPRep: any[] = [];
  try {
    for (let i = 0; i < props.data.allPrep.length; i++) {
      for (let j = 0; j < props.delegations.length; j++) {
        if (props.data.allPrep[i].iconAddress === props.delegations[j].address) {
          allPRep.push({ username: props.data.allPrep[i].username, iconAddress: props.data.allPrep[i].iconAddress, isMyPRep: true })
        }
      }
    }
    for (let i = 0; i < props.data.allPrep.length; i++) {
      let flag = false;
      for (let j = 0; j < allPRep.length; j++) {
        if (props.data.allPrep[i].username === allPRep[j].username) {
          flag = true;
        }
      }
      if (!flag) {
        allPRep.push({ username: props.data.allPrep[i].username, iconAddress: props.data.allPrep[i].iconAddress, isMyPRep: false })
      }
    }
  } catch {
  }
  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <Grid container className={classes.container}>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <List
              component="nav"
              subheader={
                <ListSubheader component="div">
                  Select P-Rep
                </ListSubheader>
              }
            >
              {allPRep.map((item: any, idx: number) => (
                <ListItem key={idx} button onClick={() => props.handleClick(item.username)}>
                  {item.isMyPRep &&
                    <ListItemIcon>
                      <Star />
                    </ListItemIcon>
                  }
                  {!item.isMyPRep &&
                    <ListItemIcon>
                      <FiberManualRecord />
                    </ListItemIcon>
                  }
                  <ListItemText>{props.getPRepName(item.iconAddress)}</ListItemText>
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
