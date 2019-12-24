import React from "react";

import { useQuery, useApolloClient } from "@apollo/react-hooks";
import { VIEWER, GET_LOCAL_SNACK } from "./GQL";

import Layout from "./Layout";

function LayoutContainer(props: any) {
  console.log("LayoutContainer props", props);
  const client = useApolloClient();

  const noSnack = { open: false, message: "" };
  const querySnack = useQuery(GET_LOCAL_SNACK);

  const handleClose = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    client.writeData({ data: { snack: { open: false, message: "", __typename: "snack" } } });
  };

  const queryVal = useQuery(VIEWER);

  let snack = noSnack;
  if (querySnack && querySnack.data && queryVal) {
    snack = querySnack.data.snack;
    if (snack.open) {
      queryVal.refetch();
    }
  }

  return (
    <Layout {...queryVal} {...snack} handleClose={handleClose} />
  );
}

export default LayoutContainer;
