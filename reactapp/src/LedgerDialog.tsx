import React from "react";
import { useTheme } from "@material-ui/core/styles";
import { Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, Typography, TableFooter, IconButton, Grid, Button } from "@material-ui/core";
import { FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage } from "@material-ui/icons";
// import clsx from "clsx";
import useStyles from "./Style";


interface TablePaginationActionsProps {
  page: number;
  onChangePage: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const classes = useStyles();
  const { page, onChangePage } = props;

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
    onChangePage(event, page + 5);
  };


  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        <FirstPage />
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        aria-label="next page"
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        aria-label="last page"
      >
        <LastPage />
      </IconButton>
    </div>
  );
}

function LedgerDialog(props: any) {
  // console.log("LedgerDialog props", props);
  const classes = useStyles();

  return (
    <>
      <Grid container className={classes.container}>
        <Grid item className={classes.item} xs={12} md={12} lg={12}>
          <Button fullWidth onClick={() => { props.setPage(0); props.setOpen(true) }}>Ledger</Button>
        </Grid>
      </Grid>

      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="lg"
        aria-labelledby="confirmation-dialog-title"
        open={props.open}
        onClose={props.handleClose}
      >
        <DialogTitle id="confirmation-dialog-title">Select Ledger Address</DialogTitle>
        <DialogContent dividers>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" color="textPrimary">#</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" color="textPrimary">Address</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" color="textPrimary">Balance</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {props.list.map((item: any, idx: number) => (
                  <TableRow key={idx} onClick={() => props.selectAddress(item)}>
                    <TableCell>
                      <Typography variant="subtitle2" color="textPrimary">{(props.page * 5) + idx + 1}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" color="textPrimary">{item.address}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" color="textSecondary">{item.balance}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    colSpan={2}
                    rowsPerPage={5}
                    rowsPerPageOptions={[5]}
                    page={props.page}
                    count={-1}
                    onChangePage={props.handleChangePage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default LedgerDialog;