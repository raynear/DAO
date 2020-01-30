import React, { useState } from "react";

import { useQuery } from "@apollo/react-hooks";
import { VIEWER } from "./GQL";
import { jsonRpcCall, governanceCall } from "./IconConnect";
import axios from "axios";

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
    // console.log(data);
    setActivePage(data);
  }

  async function getPRepInfo(pRepName: string) {
    const getPRepAddressResp = await jsonRpcCall("get_verify_info_by_id", { _id: "ICXstation"/*pRepName*/ });
    const getPRepAddress = JSON.parse(getPRepAddressResp);
    // console.log("getPRepAddress", getPRepAddress);

    const getPRepResp = await governanceCall("getPRep", { address: getPRepAddress.address });
    console.log("getPRepResp", getPRepResp);

    let url = getPRepResp.details;
    if (url.search("http://") === 0) {
      url = "http://" + url.substr(7).split("/")[0];
    }
    if (url.search("https://") === 0) {
      url = "https://" + url.substr(8).split("/")[0];
    }
    console.log(url);

    const detail = await axios.get(getPRepResp.details);
    console.log("detail", detail);
    // TODO : real server로 바뀌면 삭제
    // const detail = {
    //   "representative": {
    //     "logo": {
    //       "logo_256": "https://www.theuc.xyz/ubikprep/ubik256x256.png",
    //       "logo_1024": "https://www.theuc.xyz/ubikprep/ubik1024x1024.png",
    //       "logo_svg": "https://www.theuc.xyz/ubikprep/ubik1024x1024.svg"
    //     },
    //     "media": {
    //       "steemit": "https://steemitwallet.com/@ubikcapital",
    //       "twitter": "https://twitter.com/ubikcapital",
    //       "youtube": "https://www.youtube.com/channel/UCS9knn2BSqwEZ_WqjPFOFrA?view_as=subscriber",
    //       "facebook": "",
    //       "github": "https://github.com/ubikcapital",
    //       "reddit": "https://www.reddit.com/user/UbikCapital",
    //       "keybase": "https://keybase.io/ubikcosmos",
    //       "telegram": "https://t.me/ubikcapital",
    //       "wechat": ""
    //     }
    //   },
    //   "server": {
    //     "location": {
    //       "country": "USA",
    //       "city": "Detroit"
    //     },
    //     "server_type": "cloud",
    //     "api_endpoint": "13.58.103.19:9000"
    //   }
    // };

    let votingPower = 0;
    if (queryVal.data && queryVal.data.viewer && queryVal.data.viewer.iconAddress) {
      // console.log("iconAddress", queryVal.data.viewer);
      votingPower = await myVotingPower(pRepName, queryVal.data.viewer.iconAddress);
    }
    let logo = "https://www.theuc.xyz/ubikprep/ubik1024x1024.png";

    if (detail.data && detail.data.representative && detail.data.representative.logo && detail.data.representative.logo.logo_1024) {
      logo = detail.data.representative.logo.logo_1024;
    }

    setPRepInfo({ name: getPRepResp.name, logo: logo, website: getPRepResp.website, totalDelegation: (parseInt(getPRepResp.delegated, 16) / 10 ** 18), myVotingPower: votingPower });
    // console.log("detail", detail.representative.logo.logo_1024);
  }

  async function myVotingPower(pRepName: string, address: string) {
    // console.log(PRepName, address);
    const getPRepAddressResp = await jsonRpcCall("get_verify_info_by_id", { _id: pRepName });
    // console.log(getPRepAddressResp);
    const getPRepAddress = JSON.parse(getPRepAddressResp);
    // console.log(getPRepAddress);
    const delegateResp = await governanceCall("getDelegation", { "address": address })
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
      jsonRpcCall("get_proposals", { "_proposer": selectedPRep, "_start_proposal_id": (values.first).toString(), "_end_proposal_id": (values.end).toString() }).then((result) => {
        // console.log("GetProposals", result);
        if (result) {
          let proposals = JSON.parse(result);
          if (proposals.length > 0) {
            let tmpProposals: any = [];
            for (let i = 0; i < proposals.length; i++) {
              // console.log("proposals[" + i + "]", proposals[i]);
              let aProposal: any = {};
              if (proposals[i].subject === "") {
                continue;
              }
              aProposal['id'] = proposals[i].ID;
              aProposal['subject'] = proposals[i].subject;
              aProposal['status'] = proposals[i].status;
              aProposal['winner'] = proposals[i].winner;
              let items = JSON.parse(proposals[i].select_item)
              aProposal['select_item'] = items;

              tmpProposals.push(aProposal);
            }
            // console.log("proposals", tmpProposals);
            setProposals(tmpProposals);
          }
        }
      });
    }

    if (values.total === 0) {
      jsonRpcCall("get_last_proposal_id", { "_proposer": selectedPRep }).then((result) => {
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
    // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    getPRepInfo(selectedPRep);
  }
  // console.log("Viewer", queryVal);

  return (
    <Proposals
      proposals={proposals}
      pRep={selectedPRep}
      pRepInfo={pRepInfo}
      values={values}
      filterValues={filterValues}
      queryFilters={queryFilters}
      handleChange={handleChange}
      activePage={activePage}
      itemPerPage={perPage}
      itemCount={values.total}
      handlePageChange={handlePageChange}
    />
  );
}

export default ProposalsContainer;
