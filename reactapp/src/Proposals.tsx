import React from "react";
import { Link } from "react-router-dom";

import { Paper, Typography, Grid, Chip, CircularProgress } from "@material-ui/core";
import { MoreVert, ArrowRight, Done as DoneIcon, HowToVote as VoteIcon, NotInterested as DisapproveIcon } from "@material-ui/icons";
import Pagination from "react-js-pagination";
import clsx from "clsx";

import useStyles from "./Style";
import "./paginate.css";

function Proposals(props: any) {
  console.log("Proposals props", props);
  const classes = useStyles();

  const select_items = [0, 1, 2, 3];

  if (props.loading) return <CircularProgress />;
  if (props.error) { console.log(props.error); return <p>Error!</p>; }

  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <Grid container className={classes.container} spacing={0}>
          <Grid item className={classes.item} xs={12} md={8} lg={8}>
            {/*<img src={props.pRepInfo.logo} width="100" alt={props.pRepInfo.name} />*/}
            <a href={props.pRepInfo.website} style={{ textDecoration: "none", color: "#000000" }}>
              <Typography variant="h4">{props.pRepInfo.name}</Typography>
            </a>
          </Grid>
          <Grid item className={classes.item} xs={12} md={4} lg={4}>
            <table>
              <tbody>
                <tr>
                  <td>
                    <Typography variant="h6">Total Delegations</Typography>
                  </td>
                  <td>
                    <Typography variant="h6">:</Typography>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Typography variant="h6">{(parseInt(props.pRepInfo.delegated, 16) / 1000000000000000000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " ICX"}</Typography>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Typography variant="h6">My Voting Power</Typography>
                  </td>
                  <td>
                    <Typography variant="h6">:</Typography>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Typography variant="h6">{props.myVotingPower.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " ICX"}</Typography>
                  </td>
                </tr>
              </tbody>
            </table>
          </Grid>
        </Grid>
      </Paper>
      <Paper className={classes.paper}>
        <Grid container className={classes.container} spacing={0}>
          {props.data.get_proposals.map((item: any, idx: number) => {
            // console.log("item", select_item);
            let icon;
            if (item.status === "Approved") {
              icon = <DoneIcon />;
            } else if (item.status === "Voting") {
              icon = <VoteIcon />;
            } else {
              icon = <DisapproveIcon />;
            }
            return (
              <Grid item className={classes.item} key={idx} xs={12} sm={6} md={4} lg={4}>
                <Paper className={classes.paper}>
                  <Grid container className={classes.container}>
                    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
                      <Chip
                        icon={icon}
                        size="small"
                        label={item.status}
                        color="primary"
                      />
                    </Grid>
                    <Grid item className={classes.grid} style={{ overflow: "hidden" }} xs={12} md={12} lg={12}>
                      <Typography variant="h5" color="textPrimary" gutterBottom>
                        <Link className={classes.link} to={"/Proposal/" + props.pRep + "/" + item.ID} color="textPrimary">
                          <b>{item.ID}.</b>{" "}{item.subject}
                        </Link>
                      </Typography>
                    </Grid>
                    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
                      <table>
                        <tbody>
                          {item.select_item.map((itm: any, idx: number) => {
                            const selectItem = item.select_item[idx];
                            if (idx > item.select_item.length - 1) {
                              return (
                                <tr key={idx}>
                                  <td>&nbsp;</td>
                                  <td><Typography variant="h6" color="textSecondary">&nbsp;</Typography></td>
                                </tr>
                              );
                            }
                            return (
                              <tr key={idx}>
                                <td><ArrowRight /></td>
                                <td>
                                  <Typography variant="h6" color="textSecondary">{selectItem}</Typography>
                                </td>
                              </tr>
                            );
                          })}
                          {item.select_item.length - select_items.length > 0 &&
                            <tr>
                              <td>&nbsp;</td>
                              <td><MoreVert /></td>
                            </tr>
                          }
                          {item.select_item.length - select_items.length <= 0 &&
                            <tr>
                              <td>&nbsp;</td>
                              <td><Typography variant="h6" key={idx} color="textSecondary">&nbsp;</Typography></td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            );
          })}
          <Grid item className={clsx(classes.item, classes.center)} xs={12} lg={12}>
            <Pagination
              activePage={props.currPage}
              itemsCountPerPage={props.itemPerPage}
              totalItemsCount={props.lastProposalID}
              pageRangeDisplayed={5}
              onChange={(data) => props.setCurrPage(data)}
              activeLinkClass={"link"}
            />
          </Grid>
        </Grid>
      </Paper>
    </Grid >
  );
}

export default Proposals;
