import React from "react";
import { Grid, Paper, List, ListSubheader, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { StarBorder as StarIcon } from "@material-ui/icons";
import useStyles from "./Style";

function SelectPRep(props: any) {
  console.log("select prep props", props);
  const classes = useStyles();

  if (props.loading) return <p>Loading...</p>
  if (props.error) { return <p>Error...</p> }// console.log("error", props.error); 

  let allPRep;
  try {
    allPRep = props.data.allPrep;
  } catch {
    allPRep = [];
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
              {allPRep.map((item: any) => (
                <ListItem key={item.id} button onClick={() => props.handleClick(item.username)}>
                  <ListItemIcon><StarIcon /></ListItemIcon>
                  <ListItemText>{item.username}</ListItemText>
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
