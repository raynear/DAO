import React, { useState } from "react";

import { useQuery } from "@apollo/react-hooks";
import { VIEWER } from "./GQL";
import { json_rpc_call, governance_call } from "./IconConnect";
// import axios from "axios";

import Proposals from "./Proposals";

function ProposalsContainer(props: any) {
  // console.log("ProposalsContainer props", props);
  const selectedPRep = props.match.params.PRep;

  const [values, setValues] = useState({
    first: 0,
    end: 10,
    total: 0,
    page: 12,
    currPage: 0
  });
  const [filterValues, setFilterValues] = useState({
    first: 0,
    end: 10,
    total: 0,
    page: 12,
    currPage: 0
  });

  const [pRepInfo, setPRepInfo] = useState({
    logo: "",
    website: "",
    name: "",
    totalDelegation: 0,
    myVotingPower: 0
  })

  const itemCount = 1;
  const perPage = 12;
  const [activePage, setActivePage] = useState(1);

  const [proposals, setProposals] = useState([]);
  const [flag, setFlag] = useState(false);

  const handleChange = (name: any) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilterValues({ ...filterValues, [name]: event.target.value });
  };

  function queryFilters() {
    setValues(filterValues);
  }

  const handlePageChange = (data: any) => {
    console.log(data);
    setActivePage(data);
  }

  async function getPRepInfo(PRepName: string) {
    const getPRepAddressResp = await json_rpc_call("GetVerifyInfoByID", { _ID: PRepName });
    const getPRepAddress = JSON.parse(getPRepAddressResp);
    console.log("getPRepAddress", getPRepAddress);

    const getPRepResp = await governance_call("getPRep", { address: getPRepAddress.address });
    console.log("getPRepResp", getPRepResp);

    // TODO : real server로 바뀌면 삭제
    // const detail = await axios.get(getPRepResp.details);
    const detail = {
      "representative": {
        "logo": {
          "logo_256": "https://www.theuc.xyz/ubikprep/ubik256x256.png",
          "logo_1024": "https://www.theuc.xyz/ubikprep/ubik1024x1024.png",
          "logo_svg": "https://www.theuc.xyz/ubikprep/ubik1024x1024.svg"
        },
        "media": {
          "steemit": "https://steemitwallet.com/@ubikcapital",
          "twitter": "https://twitter.com/ubikcapital",
          "youtube": "https://www.youtube.com/channel/UCS9knn2BSqwEZ_WqjPFOFrA?view_as=subscriber",
          "facebook": "",
          "github": "https://github.com/ubikcapital",
          "reddit": "https://www.reddit.com/user/UbikCapital",
          "keybase": "https://keybase.io/ubikcosmos",
          "telegram": "https://t.me/ubikcapital",
          "wechat": ""
        }
      },
      "server": {
        "location": {
          "country": "USA",
          "city": "Detroit"
        },
        "server_type": "cloud",
        "api_endpoint": "13.58.103.19:9000"
      }
    };

    let myVotingPower = 0;
    if (queryVal.data && queryVal.data.hasOwnProperty("viewer")) {
      myVotingPower = await MyVotingPower(PRepName, queryVal.data.viewer.iconAddress);
    }

    setPRepInfo({ name: getPRepResp.name, logo: detail.representative.logo.logo_1024, website: getPRepResp.website, totalDelegation: (parseInt(getPRepResp.delegated, 16) / 10 ** 18), myVotingPower: myVotingPower });
    // console.log("detail", detail.representative.logo.logo_1024);
  }

  async function MyVotingPower(PRepName: string, address: string) {
    // console.log(PRepName, address);
    const getPRepAddressResp = await json_rpc_call("GetVerifyInfoByID", { _ID: PRepName });
    // console.log(getPRepAddressResp);
    const getPRepAddress = JSON.parse(getPRepAddressResp);
    // console.log(getPRepAddress);
    const delegateResp = await governance_call("getDelegation", { "address": address })
    // console.log(delegateResp);
    let delegateList;
    try {
      delegateList = delegateResp.delegations;
    }
    catch {
      delegateList = [];
    }
    for (let i = 0; i < delegateList.length; i++) {
      if (delegateList[i].address === getPRepAddress.address) {
        let myVotingPower = parseInt(delegateList[i].value, 16);
        myVotingPower = (myVotingPower / 1000000000000000000);
        return myVotingPower;
      }
    }
    return 0;
  }

  if (flag === false) {
    if (proposals.length === 0) {
      json_rpc_call("GetProposals", { "_Proposer": selectedPRep, "_StartProposalID": (values.first).toString(), "_EndProposalID": (values.end).toString() }).then((result) => {
        // console.log("GetProposals");
        // console.log(result);
        if (result) {
          let Proposals = JSON.parse(result);
          if (Proposals.length > 0) {
            let tmpProposals: any = [];
            for (let i = 0; i < Proposals.length; i++) {
              let aProposal: any = {};
              if (Proposals[i].subject === "") {
                continue;
              }
              aProposal['id'] = Proposals[i].ID;
              aProposal['subject'] = Proposals[i].subject;
              aProposal['status'] = Proposals[i].status;
              aProposal['winner'] = Proposals[i].winner;
              let items = JSON.parse(Proposals[i].select_item)
              aProposal['select_item'] = items;

              tmpProposals.push(aProposal);
            }
            setProposals(tmpProposals);
          }
        }
      });
    }

    if (values.total === 0) {
      json_rpc_call("GetLastProposalID", { "_Proposer": selectedPRep }).then((result) => {
        // console.log("GetLastProposalID");
        // console.log(result);
        setValues({ ...values, total: parseInt(result) })
      });
    }
    setFlag(true);
  }

  const queryVal = useQuery(VIEWER);

  if (queryVal.loading) {
    return <p>Loading...</p>;
  }

  if (pRepInfo.name === "") {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    getPRepInfo(selectedPRep);
  }
  // console.log("Viewer", queryVal);

  return (
    <Proposals
      proposals={proposals}
      PRep={selectedPRep}
      PRepInfo={pRepInfo}
      values={values}
      filterValues={filterValues}
      queryFilters={queryFilters}
      handleChange={handleChange}
      activePage={activePage}
      itemPerPage={perPage}
      itemCount={itemCount}
      handlePageChange={handlePageChange}
    />
  );
}

export default ProposalsContainer;
