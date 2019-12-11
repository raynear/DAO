import React from "react";

import { useQuery, useApolloClient } from "@apollo/react-hooks";
import { VIEWER, GET_LOCAL_SNACK } from "./GQL";

import Layout from "./Layout";

function LayoutContainer(props: any) {
  console.log("LayoutContainer props", props);
  const client = useApolloClient();
  const noSnack = { open: false, message: "" };
  const querySnack = useQuery(GET_LOCAL_SNACK);

  let snack = noSnack;
  if (querySnack && querySnack.data) {
    snack = querySnack.data.snack;
  }

  const queryVal = useQuery(VIEWER);

  return (
    <Layout {...queryVal} {...snack} />
  );
}

export default LayoutContainer;
