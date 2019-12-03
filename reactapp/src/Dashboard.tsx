import React, { Fragment /*, useEffect */ } from "react";
import { withRouter } from 'react-router-dom';

import Proposals from "./Proposals";
//import EditProposal from "./EditProposal";
import GQLEditProposal from "./GQLEditProposal";

function Dashboard(props: any) {
  console.log("Dashboard props", props);
  return (
    <Fragment>
      <Proposals />
      <GQLEditProposal />
    </Fragment>
  );
}

export default withRouter(Dashboard);
