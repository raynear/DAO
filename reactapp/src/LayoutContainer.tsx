import React from "react";

import { useQuery, useApolloClient } from "@apollo/react-hooks";
import { VIEWER, GET_LOCAL_SNACK } from "./GQL";

import Layout from "./Layout";

function LayoutContainer(props: any) {
  // console.log("LayoutContainer props", props);
  const client = useApolloClient();

  const noSnack = { open: false, message: "" };
  const querySnack = useQuery(GET_LOCAL_SNACK);
  // console.log("querySnack", querySnack);

  const handleClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    client.writeData({
      data: { snack: { open: false, message: "", __typename: "snack" } }
    });
  };

  const queryVal = useQuery(VIEWER);
  // console.log("queryVal", queryVal);

  let snack = noSnack;
  if (!querySnack.loading && !querySnack.error && querySnack.data) {
    snack = querySnack.data.snack;
    if (snack.open) {
      queryVal.refetch();
    }
  }
  if (!queryVal.loading && !queryVal.error && queryVal.data) {
    client.writeData({ data: { viewer: queryVal.data.viewer } });
  }

  return <Layout {...queryVal} {...snack} handleClose={handleClose} />;
}

export default LayoutContainer;
