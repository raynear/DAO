import React, { useState, useEffect } from "react";
// import clsx from "clsx";
import Transport from "@ledgerhq/hw-transport-u2f";
import Icx from "./Icx";
import {
  iconService,
  IconBuilder,
  IconConverter,
  IconUtil,
} from "./IconConnect";
import { VIEWER } from "./GQL";
import { useApolloClient } from "@apollo/react-hooks";
import { contractAddress } from "./Config";

import LedgerDialog from "./LedgerDialog";

function LedgerDialogContainer(props: any) {
  // console.log("LedgerDialog props", props);

  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(-1);
  const [list, setList] = useState<any[]>([]);

  const client = useApolloClient();

  useEffect(() => {
    getAddresses(page);
  }, [page]);

  async function getAddressNBalance(idx: number) {
    const path = "44'/4801368'/0'/0'/" + idx.toString() + "'";
    const transport = await Transport.create();
    transport.setDebugMode(false); // if you want to print log
    transport.setExchangeTimeout(60000); // Set if you want to change U2F timeout. default: 30 sec

    const icx = new Icx(transport);
    // coin type: ICX(4801368), ICON testnet(1)
    let addressResult: any;
    let address: any;
    let balance: any;
    try {
      addressResult = await icx.getAddress(path, false, true);
      address = addressResult.address.toString();
      balance = await iconService
        .getBalance(addressResult.address.toString())
        .execute();
    } catch (e) {
      setPage(-1);
      setOpen(false);
      throw new Error("Ledger Not Connected");
    }
    return { address, balance };
  }

  async function getAddresses(newPage: number) {
    if (newPage === -1) {
      return;
    }
    setList([]);
    let tmpList = [];
    const start = newPage * 5;
    const end = newPage * 5 + 5;
    try {
      for (let i = start; i < end; i++) {
        const result = await getAddressNBalance(i);
        tmpList.push({
          index: i,
          address: result.address,
          balance: result.balance / 10 ** 18,
        });
      }
      setList(tmpList);
    } catch (e) {
      alert("Please Connect Ledger");
    }
  }
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleClose = () => {
    setOpen(false);
  };

  function selectAddress(item: any) {
    setOpen(false);
    sendVerifyLedger(item.index);
    alert("Please Sign Transaction on Your Ledger");
    props.selectNotice(1);
  }

  async function sendVerifyLedger(addressIdx: number) {
    client.query({ query: VIEWER }).then(async (result) => {
      const path = "44'/4801368'/0'/0'/" + addressIdx.toString() + "'";
      const transport = await Transport.create();
      transport.setDebugMode(true); // if you want to print log
      transport.setExchangeTimeout(60000); // Set if you want to change U2F timeout. default: 30 sec

      const icx = new Icx(transport);
      // coin type: ICX(4801368), ICON testnet(1)
      let addressResult = await icx.getAddress(path, false, true);
      const address = addressResult.address.toString();
      // console.log("address", address);
      // console.log("balance", await iconService.getBalance(addressResult.address.toString()).execute());
      let timestamp = new Date();
      var txBuilder = new IconBuilder.CallTransactionBuilder();
      const methodName = "verify";
      const lastBlock = await iconService.getBlock("latest").execute();
      const params = {
        _block_hash: lastBlock.blockHash,
        _id: result.data.viewer.username,
      };
      var txObj = txBuilder
        .from(address)
        .to(contractAddress)
        .nid(IconConverter.toBigNumber("1"))
        .version(IconConverter.toBigNumber("3"))
        .stepLimit(IconConverter.toBigNumber("10000000"))
        .timestamp(timestamp.valueOf() * 1000)
        .method(methodName)
        .params(params)
        .build();
      const rawTransaction = IconConverter.toRawTransaction(txObj);
      const hashKey = IconUtil.generateHashKey(rawTransaction);

      let { signedRawTxBase64 } = await icx.signTransaction(path, hashKey);
      rawTransaction.signature = signedRawTxBase64;

      iconService
        .sendTransaction({
          getProperties: () => rawTransaction,
          getSignature: () => signedRawTxBase64,
        })
        .execute();
      props.waitResult(10, 3);
    });
  }

  return (
    <LedgerDialog
      open={open}
      setOpen={setOpen}
      list={list}
      page={page}
      setPage={setPage}
      handleClose={handleClose}
      selectAddress={selectAddress}
      handleChangePage={handleChangePage}
    />
  );
}

export default LedgerDialogContainer;
