import React from "react";

import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import { LOG_OUT, GET_LOCAL_ME } from "./GQL";

import UserInfo from "./UserInfo";

function UserInfoContainer(props: any) {
  //const [badgeCnt, setBadgeCnt] = React.useState(0);
  const badgeCnt = 0;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const [mutateLogout] = useMutation(LOG_OUT);
  const client = useApolloClient();

  const handleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuLogout = () => {
    mutateLogout();
    setAnchorEl(null);
    client.writeData({ data: { username: "" } });
    window.location.reload();
  };

  function nyamnyam() {
    client.writeData({ data: { snack: { open: true, message: "chitos", __typename: "snack" } } });
  }

  const queryVal = useQuery(GET_LOCAL_ME);

  return (<UserInfo
    {...queryVal}
    anchorEl={anchorEl}
    setAnchorEl={setAnchorEl}
    badgeCnt={badgeCnt}
    handleMenu={handleMenu}
    handleMenuClose={handleMenuClose}
    handleMenuLogout={handleMenuLogout}
    nyamnyam={nyamnyam}
  />);

}

export default UserInfoContainer;
