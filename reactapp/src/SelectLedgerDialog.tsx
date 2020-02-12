import React, { useState, useEffect } from "react";
import { useTheme } from "@material-ui/core/styles";
import { Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, Typography, TableFooter, IconButton } from "@material-ui/core";
import { FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage } from "@material-ui/icons";
// import clsx from "clsx";
import Transport from "@ledgerhq/hw-transport-u2f";
import Icx from "./Icx";
import { iconService, IconConverter } from "./IconConnect";
import useStyles from "./Style";


interface TablePaginationActionsProps {
  page: number;
  onChangePage: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const classes = useStyles();
  const theme = useTheme();
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
        {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
      </IconButton>
    </div>
  );
}

function LedgerDialog(props: any) {
  // console.log("LedgerDialog props", props);
  const classes = useStyles();

  const [page, setPage] = useState(0);
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    getAddresses(page);
  }, [page]);

  async function getAddressNBalance(idx: number) {
    const path = "44'/4801368'/0'/0'/" + idx.toString() + "'";
    const transport = await Transport.create();
    transport.setDebugMode(true);         // if you want to print log
    transport.setExchangeTimeout(60000);  // Set if you want to change U2F timeout. default: 30 sec

    const icx = new Icx(transport);
    // coin type: ICX(4801368), ICON testnet(1)
    let addressResult = await icx.getAddress(path, false, true);
    const address = addressResult.address.toString();
    // console.log("address", address);
    const balance = await iconService.getBalance(addressResult.address.toString()).execute();
    return { address, balance };
  }

  async function getAddresses(newPage: number) {
    setList([]);
    let tmpList = [];
    const start = newPage * 5;
    const end = newPage * 5 + 5
    for (let i = start; i < end; i++) {
      const result = await getAddressNBalance(i);
      tmpList.push({ index: i, address: result.address, balance: result.balance / 10 ** 18 })
    }
    setList(tmpList);
  }
  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleClose = () => {
    props.setOpen(false);
  };

  function selectAddress(item: any) {
    console.log(item);
    props.setOpen(false);
  }

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="lg"
      aria-labelledby="confirmation-dialog-title"
      open={props.open}
      onClose={handleClose}
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
              {list.map((item: any, idx: number) => (
                <TableRow key={idx} onClick={() => selectAddress(item)}>
                  <TableCell>
                    <Typography variant="subtitle2" color="textPrimary">{(page * 5) + idx + 1}</Typography>
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
                  page={page}
                  count={-1}
                  onChangePage={handleChangePage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}

export default LedgerDialog;