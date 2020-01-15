import React from "react";
import { IconButton, Paper, Typography, FormControlLabel, FormControl, RadioGroup, Radio, Button, Grid, Divider, Tooltip, Chip, Table, TableHead, TableBody, TableFooter, TablePagination, TableRow, TableCell, useTheme } from "@material-ui/core";
import { ArrowLeft, ArrowRight, Done as DoneIcon, HowToVote as VoteIcon, NotInterested as DisapproveIcon, FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage } from "@material-ui/icons";
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, Tooltip as BarTooltip } from "recharts";
import clsx from "clsx";

import { TUIViewer } from "./TUIEditor";

import useStyles from "./Style";

import facebookImg from "./img/facebook.png";
import twitterImg from "./img/twitter.png";

function Proposal(props: any) {
  console.log("Proposal props", props);
  // const forceUpdate = useForceUpdate;

  const classes = useStyles();


  interface ITablePaginationActionsProps {
    count: number;
    page: number;
    rowsPerPage: number;
    onChangePage: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
  }

  function TablePaginationActions(props: ITablePaginationActionsProps) {
    const classes = useStyles();
    const theme = useTheme();
    const { count, page, rowsPerPage, onChangePage } = props;

    const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onChangePage(event, 0);
    };

    const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onChangePage(event, page - 1);
    };

    const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onChangePage(event, page + 1);
    };

    const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
      <div className={classes.pagination}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
        </IconButton>
        <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
        </IconButton>
      </div>
    );
  }



  function SelectItemList() {
    // console.log("SelectItemList", props.proposal.select_item);
    return (
      <table>
        <tbody>
          {props.proposal.select_item.map(
            (selectItem: any, idx: number) => {
              let voteRate = 0;
              try {
                voteRate = props.votedPowerRate[idx].voted;
              } catch {
                voteRate = 0;
              } finally {
              }
              return (
                <tr key={idx}>
                  <td><ArrowRight /></td>
                  <td style={{ minWidth: "100px" }}>
                    {props.votedIdx === idx &&
                      <Tooltip key={idx} title="Voted" placement="left">
                        <Typography variant="h6">{selectItem}</Typography>
                      </Tooltip>
                    }
                    {props.votedIdx !== idx &&
                      <Typography variant="h6">{selectItem}</Typography>
                    }
                  </td>
                  <td align="right" style={{ minWidth: "50px" }}><Typography variant="h6">{" " + voteRate + " %"}</Typography></td>
                  <td align="right" style={{ minWidth: "200px" }}><Typography variant="h6">{props.votedPowerRate.length > 0 && " " + props.votedPowerRate[idx].icx.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " ICX"}</Typography></td>
                </tr>
              );
            }
          )}
        </tbody>
      </table >
    );
  }

  function RadioButtons() {
    return (
      <FormControl>
        <RadioGroup value={props.voteSelect} onChange={props.handleChange}>
          {props.proposal.select_item.map(
            (selectItem: any, idx: number) => {
              let voteRate = 0;
              try {
                voteRate = props.votedPowerRate[idx].voted;
              } catch {
                voteRate = 0;
              } finally {
              }
              return (
                <FormControlLabel
                  key={idx}
                  control={<Radio />}
                  value={idx}
                  label={selectItem + " " + voteRate + " % " + props.votedPowerRate[idx].icx.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " ICX"}
                />
              );
            }
          )}
        </RadioGroup>
      </FormControl>
    );
  }

  function SelectList() {
    const expireAt = new Date(props.proposal.expire_date);
    if (expireAt.getTime() > Date.now() &&
      (props.myPRep || props.owner) &&
      props.votedIdx === -1 &&
      props.proposal.status === "Voting") {
      return (<RadioButtons />);
    }
    return (<SelectItemList />);
  }

  function VoteButton() {
    return (
      <Button
        variant="contained"
        color="primary"
        disabled={props.voteSelect === -1}
        onClick={props.Vote}
      >
        Vote
      </Button>
    );
  }

  function FinalizeVoteButton() {
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={props.FinalizeVote}
      >
        Finalize Vote
      </Button>
    );
  }

  function ActionButton() {
    const expireAt = new Date(props.proposal.expire_date);
    if (expireAt.getTime() < Date.now()) {
      if (props.owner && props.proposal.status === "Voting") {
        return <FinalizeVoteButton />;
      }
      else if (props.proposal.status === "Voting") {
        return <Typography>Vote End(Time over)</Typography>;
      }
    }
    if (expireAt.getTime() > Date.now() && (props.myPRep || props.owner) && props.votedIdx === -1) {
      // return (<><FinalizeVoteButton /><VoteButton /></>);
      // TODO : 원복해야 함.
      // 빠른 finalize를 위해 우선 변경한 버튼
      return (<VoteButton />);
    }
    return <></>;
  }

  function FacebookShare() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(document.URL) + '&t=' + encodeURIComponent(document.title), 'facebooksharedialog', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
  }

  function TwitterShare() {
    window.open('https://twitter.com/intent/tweet?text=[%EA%B3%B5%EC%9C%A0]%20' + encodeURIComponent(document.URL) + '%20-%20' + encodeURIComponent(document.title), 'twittersharedialog', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
  }
  const EndTime = new Date(props.proposal.expire_date);
  const LeftHour = Math.floor((EndTime.getTime() - Date.now()) / 3600000);
  const LeftMinute = Math.floor(((EndTime.getTime() - Date.now()) / 60000) - (LeftHour * 60));

  if (props.loading) return <p>Loading...</p>;
  if (props.error) return <p>Error!:</p>;
  let icon;
  if (props.proposal.status === "Approved") {
    icon = <DoneIcon />;
  } else if (props.proposal.status === "Voting") {
    icon = <VoteIcon />;
  } else {
    icon = <DisapproveIcon />;
  }
  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <Button
          variant="outlined"
          color="primary"
          onClick={props.back}
          style={{ width: "200px", float: "right" }}
          startIcon={<ArrowLeft />}
        >
          Back
        </Button>
      </Paper>

      <Paper className={classes.paper}>
        <Grid container className={classes.container}>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Chip
              icon={icon}
              size="small"
              label={props.proposal.status}
              color="primary"
              style={{ float: "left" }}
            />
            <br />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <div className={classes.right}>
              <div style={{ float: "left" }}>
                <Typography variant="h4" color="textPrimary" gutterBottom>
                  <b>
                    {props.proposal.id + ". " + props.proposal.subject}{" "}
                  </b>
                </Typography>
              </div>
              <div onClick={TwitterShare} style={{ float: "right" }}><img src={twitterImg} width="40" alt="트위터 공유하기" /></div>
              <div onClick={FacebookShare} style={{ float: "right" }}><img src={facebookImg} width="40" alt="페이스북 공유하기" /></div>
            </div>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="body1" color="textPrimary">
              Proposer : {props.PRep}
            </Typography>
            <Typography variant="body1" color="textPrimary">
              Ending Time : {EndTime.toString()} {LeftHour > 0 && "(" + LeftHour + " Hour " + LeftMinute + " Minute Left)"}
            </Typography>
            <Typography variant="body1" color="textPrimary">
              Transaction : <a href={"https://tracker.icon.foundation/transaction/0x" + props.proposal.transaction} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>{"0x" + props.proposal.transaction}</a>
            </Typography>
            {props.proposal.final !== "" &&
              <Typography variant="body1" color="textPrimary">
                Finalize Transaction : <a href={"https://tracker.icon.foundation/transaction/0x" + props.proposal.final} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>{"0x" + props.proposal.final}</a>
              </Typography>
            }
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <br />
            <Divider variant="fullWidth" />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="caption" color="textSecondary">
              VOTING PROGRESS
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={8} lg={8}>
            <BarChart width={600} height={70} data={[{ name: "Electoral Threshold", voted: props.voteData.voted, left: props.voteData.th, "100": 100 - props.voteData.voted - props.voteData.th }]} layout="vertical">
              <Bar dataKey="voted" stackId="a" fill="#82ca9d" />
              <Bar dataKey="left" stackId="a" fill="#888888" />
              <Bar dataKey="100" stackId="a" fill="#FFFFFF" />
              <BarTooltip cursor={false} />
              <ReferenceLine x={props.proposal.electoral_threshold} label={props.proposal.electoral_threshold} stroke="red" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis hide dataKey="name" type="category" />
            </BarChart>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={4} lg={4}>
            <table>
              <tbody>
                <tr>
                  <td style={{ float: "left" }}>
                    <Typography variant="body1" color="textPrimary">
                      {" "}Total # of delegate :
                    </Typography>
                  </td>
                  <td style={{ float: "right" }}>
                    <Typography variant="body1" color="textPrimary">
                      {props.voteData.totalDelegate.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " ICX"}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td style={{ float: "left" }}>
                    <Typography variant="body1" color="textPrimary">
                      {" "}Total # of votes :
                    </Typography>
                  </td>
                  <td style={{ float: "right" }}>
                    <Typography variant="body1" color="textPrimary">
                      {props.voteData.totalVoted.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " ICX"}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td style={{ float: "left" }}>
                    <Typography variant="body1" color="textPrimary">
                      {" "}Your # of votes :
                    </Typography>
                  </td>
                  <td style={{ float: "right" }}>
                    <Typography variant="body1" color="textPrimary">
                      {props.myVotingPower.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " ICX"}
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </table>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <br />
            <Divider variant="fullWidth" />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="caption" color="textSecondary">
              SELECT ITEMS
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="subtitle2" color="textSecondary">
              Winning Threshold : {props.proposal.winning_threshold} %
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <SelectList />
          </Grid>
          <Grid item className={clsx(classes.grid, classes.center)} xs={12} md={12} lg={12}>
            <br />
            <ActionButton />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <br />
            <Divider variant="fullWidth" />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="caption" color="textSecondary">
              DESCRIPTION
            </Typography>
          </Grid>
          <Grid item className={clsx(classes.paddingSide, classes.viewer)} xs={12} md={12} lg={12}>
            <TUIViewer
              initialValue={props.proposal.contents}
            />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <br />
            <Divider variant="fullWidth" />
            <br />
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Typography variant="caption" color="textSecondary">
              VOTES
            </Typography>
          </Grid>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Voter</TableCell>
                  <TableCell align="center">Transaction Hash</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {props.votes.map((item: any, idx: any) => {
                  return (
                    <TableRow key={idx}>
                      <TableCell align="center"><a href={"https://tracker.icon.foundation/address/" + item.voter} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>{item.voter}</a></TableCell>
                      <TableCell align="center"><a href={"https://tracker.icon.foundation/transaction/" + item.voteTxHash} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>{item.voteTxHash}</a></TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[10, 20, 30]}
                    colSpan={6}
                    count={props.votes.length}
                    rowsPerPage={props.rowsPerPage}
                    page={props.page}
                    SelectProps={{
                      inputProps: { 'aria-label': 'rows per page' },
                      native: true,
                    }}
                    onChangePage={props.handleChangePage}
                    onChangeRowsPerPage={props.handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </Grid>
        </Grid>
      </Paper>
    </Grid >
  );
}

export default Proposal;
