import React from "react";

import { useQuery, useApolloClient } from "@apollo/react-hooks";
import { VIEWER, GET_LOCAL_SNACK } from "./GQL";

// import useForceUpdate from "./useForceUpdate";

import Layout from "./Layout";

function LayoutContainer(props: any) {
  console.log("LayoutContainer props", props);
  const client = useApolloClient();

  //  const forceUpdate = useForceUpdate();

  const noSnack = { open: false, message: "" };
  const querySnack = useQuery(GET_LOCAL_SNACK);

  let snack = noSnack;
  if (querySnack && querySnack.data) {
    snack = querySnack.data.snack;
  }

  const handleClose = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    //    forceUpdate();
    client.writeData({ data: { snack: { open: false, message: "", __typename: "snack" } } });
  };

  const queryVal = useQuery(VIEWER);

  return (
    <Layout {...queryVal} {...snack} handleClose={handleClose} />
  );
}

export default LayoutContainer;
