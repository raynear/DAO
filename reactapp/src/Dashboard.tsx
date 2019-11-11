import React, { Fragment /*, useEffect */ } from "react";

import Proposals from "./Proposals";
//import EditProposal from "./EditProposal";
import GQLEditProposal from "./GQLEditProposal";

function Dashboard() {
  return (
    <Fragment>
      <Proposals />
      <GQLEditProposal />
    </Fragment>
  );
}

export default Dashboard;
