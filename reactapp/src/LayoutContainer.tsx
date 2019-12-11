import React from "react";

import { useQuery } from "@apollo/react-hooks";
import { VIEWER } from "./GQL";

import Layout from "./Layout";

function LayoutContainer(props: any) {
  console.log("LayoutContainer props", props);
  const queryVal = useQuery(VIEWER);

  return (
    <Layout {...queryVal} />
  );
}

export default LayoutContainer;
