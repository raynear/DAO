import React from "react";
import { BrowserRouter } from "react-router-dom";

import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";

import { GET_VIEWER } from "./GQL";

import Cookies from "js-cookie";

import { jsonRpcCall, governanceCall } from "./IconConnect";
import LayoutContainer from "./LayoutContainer";
import { graphqlURL, csrfURL } from "./Config";

const queryResolver = {
  get_proposals: async (obj: any, args: any, context: any, info: any) => {
    console.log("get_proposals", context);
    let jsonResult;
    try {
      const result = await jsonRpcCall("get_proposals", {
        _proposer: args._proposer,
        _start_proposal_id: args._start_proposal_id.toString(),
        _end_proposal_id: args._end_proposal_id.toString()
      });
      jsonResult = JSON.parse(result);
    } catch {
      jsonResult = [];
    }
    let ret = [];
    for (let i = 0; i < jsonResult.length; i++) {
      jsonResult[i]["__typename"] = "proposal";
      const select_item = JSON.parse(jsonResult[i].select_item);
      jsonResult[i].select_item = select_item;
      ret.push(jsonResult[i]);
    }
    ret = await ret.reverse();
    return ret;
  },
  get_proposal: async (obj: any, args: any, context: any, info: any) => {
    console.log("get_proposal");
    const result = await jsonRpcCall("get_proposal", {
      _proposer: args._proposer,
      _proposal_id: args._proposal_id
    });
    const jsonResult = JSON.parse(result);
    jsonResult["__typename"] = "proposal";
    const select_item = JSON.parse(jsonResult.select_item);
    jsonResult.select_item = select_item;
    return jsonResult;
  },
  get_verify_info_by_id: async (obj: any, args: any, context: any, info: any) => {
    console.log("get_verify_info_by_id");
    const result = await jsonRpcCall("get_verify_info_by_id", {
      _id: args._id
    });
    result["__typename"] = "PRep";
    return result;
  },
  get_last_proposal_id: async (obj: any, args: any, context: any, info: any) => {
    console.log("get_last_proposal_id");
    const result = await jsonRpcCall("get_last_proposal_id", {
      _proposer: args._proposer
    });
    return parseInt(result);
  },
  get_votes: async (obj: any, args: any, context: any, info: any) => {
    console.log("get_votes");
    const result = await jsonRpcCall("get_votes", {
      _proposer: args._proposer,
      _proposal_id: args._proposal_id
    });
    const votes = JSON.parse(result).vote;
    votes["__typename"] = "votes";
    let ret = [];
    for (let i = 0; i < votes.length; i++) {
      votes[i]["__typename"] = "vote";
      ret.push(votes[i]);
    }
    return ret;
  },
  get_prep_info_by_id: async (obj: any, args: any, context: any, info: any) => {
    console.log("get_prep_info_by_id");
    const verifyInfoResult = await jsonRpcCall("get_verify_info_by_id", {
      _id: args._proposer
    });
    console.log("verifyInfoResult", verifyInfoResult);
    const verifyInfoJson = JSON.parse(verifyInfoResult);
    console.log("verifyInfoJson", verifyInfoJson);
    const result = await governanceCall("getPRep", {
      address: verifyInfoJson.address
    });
    result["__typename"] = "PRep";
    return result;
  },
  get_prep_info_by_address: async (obj: any, args: any, context: any, info: any) => {
    console.log("get_prep_info_by_address");
    const result = await governanceCall("getPRep", {
      address: args._address
    });
    result["__typename"] = "PRep";
    return result;
  },
  get_delegation: async (obj: any, args: any, context: any, info: any) => {
    console.log("get_delegation");
    const delegateResp = await governanceCall("getDelegation", {
      address: args._address
    });
    return delegateResp;
  },
  get_voted_power_rates: async (obj: any, args: any, context: any, info: any) => {
    console.log("get_voted_power_rates");
    const votes = await queryResolver.get_votes(obj, args, context, info);
    const proposal = await queryResolver.get_proposal(obj, args, context, info);

    let totalVotedPower = 0;

    let votedPowerRate = [];
    let votedPowers = [];
    for (let i = 0; i < proposal.select_item.length; i++) {
      votedPowerRate[i] = [];
      votedPowers[i] = 0;
    }

    for (let i = 0; i < votes.length; i++) {
      const aVote = votes[i];

      if (votedPowerRate[aVote.selectItem]) {
        votedPowerRate[aVote.selectItem].push(aVote);
      } else {
        votedPowerRate[aVote.selectItem] = [aVote];
      }
    }

    for (let i = 0; i < votedPowerRate.length; i++) {
      let votingPower = 0;
      for (let j = 0; j < votedPowerRate[i].length; j++) {
        if (proposal.status === "Voting") {
          votingPower += await queryResolver.get_voting_power(
            obj,
            { _proposer: args._proposer, _user: votedPowerRate[i][j].voter },
            context,
            info
          );
        }
        else {
          votingPower += votedPowerRate[i][j].delegateAmount;
        }
      }

      votedPowers[i] = votingPower;
      totalVotedPower += votingPower;
    }

    console.log("VotedPowerRate!!!!", votedPowerRate, votedPowers, totalVotedPower);
    return {
      votedPowerRate: votedPowerRate,
      votedPowers: votedPowers,
      totalVotedPower: totalVotedPower
    };
  },
  get_delegation_by_id: async (obj: any, args: any, context: any, info: any) => {
    console.log("get_delegation_by_id");
    const verifyInfoResult = await jsonRpcCall("get_verify_info_by_id", {
      _id: args._id
    });
    const verifyInfoJson = JSON.parse(verifyInfoResult);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("verify info ", verifyInfoJson);
    const delegateResp = await governanceCall("getDelegation", {
      address: verifyInfoJson.address
    });
    return delegateResp;
  },
  get_voting_power: async (obj: any, args: any, context: any, info: any) => {
    const verifyInfoResult = await jsonRpcCall("get_verify_info_by_id", {
      _id: args._proposer
    });
    const verifyInfoJson = JSON.parse(verifyInfoResult);

    let delegateList;
    try {
      const delegateResp = await governanceCall("getDelegation", {
        address: args._user
      });
      delegateList = delegateResp.delegations;
    } catch {
      delegateList = [];
    }
    for (let i = 0; i < delegateList.length; i++) {
      if (delegateList[i].address === verifyInfoJson.address) {
        let myVotingPower = parseInt(delegateList[i].value, 16);
        myVotingPower = myVotingPower / 1000000000000000000;
        return myVotingPower;
      }
    }
    return 0;
  },
  get_my_voting_power: async (obj: any, args: any, context: any, info: any) => {
    console.log("get_my_voting_power", args);
    const viewer = await context.client.query({ query: GET_VIEWER });
    console.log(viewer);

    let delegateList;
    try {
      const delegateResp = await governanceCall("getDelegation", {
        address: viewer.data.viewer.iconAddress
      });
      delegateList = delegateResp.delegations;
    } catch {
      delegateList = [];
    }

    try {
      const verifyInfoResult = await jsonRpcCall("get_verify_info_by_id", {
        _id: args._proposer
      });
      console.log(verifyInfoResult);
      const verifyInfoJson = JSON.parse(verifyInfoResult);
      console.log(verifyInfoJson);

      for (let i = 0; i < delegateList.length; i++) {
        if (delegateList[i].address === verifyInfoJson.address) {
          let myVotingPower = parseInt(delegateList[i].value, 16);
          myVotingPower = myVotingPower / 1000000000000000000;
          return myVotingPower;
        }
      }
    } catch {
      let totalVotingPower = 0;
      for (let i = 0; i < delegateList.length; i++) {
        let votingPower = parseInt(delegateList[i].value, 16);
        totalVotingPower += votingPower / 1000000000000000000;
      }
      return totalVotingPower;
    }
  },
  get_preps: async (obj: any, args: any, context: any, info: any) => {
    console.log("get_preps", args);

    const registeredPReps = await jsonRpcCall("get_preps", {});
    const pReps = await governanceCall("getPReps", {});

    for (let i = 0; i < registeredPReps.length; i++) {
      registeredPReps[i]['__typename'] = "PRepInfo";
      registeredPReps[i]['pRepName'] = registeredPReps[i].username;
      for (let j = 0; j < pReps.preps.length; j++) {
        if (registeredPReps[i].address === pReps.preps[j].address) {
          registeredPReps[i]['pRepName'] = pReps.preps[j].name;
          break;
        }
      }
    }
    return registeredPReps;
  },
  get_pages: async (obj: any, args: any, context: any, info: any) => {
    console.log("get_pages", args);

    const registeredPages = await jsonRpcCall("get_pages", {});

    return registeredPages;
  }
};

const client = new ApolloClient({
  uri: graphqlURL,
  // tell apollo to include credentials for csrf token protection
  credentials: "include",
  // async operation with fetch to get csrf token
  request: async operation => {
    let csrf = Cookies.get("csrftoken");
    if (csrf === undefined) {
      let csrftoken = await fetch(csrfURL)
        .then(response => response.json())
        .then(data => data.csrfToken);
      // set the cookie 'csrftoken'
      Cookies.set("csrftoken", csrftoken);
      csrf = csrftoken;
    }
    operation.setContext({
      // set the 'X-CSRFToken' header to the csrftoken
      headers: {
        "X-CSRFToken": csrf
      }
    });
  },
  cache: new InMemoryCache(),
  clientState: {
    defaults: {
      data: {
        username: "",
        email: "",
        photo: "",
        icon_address: "",
        snack: { open: false, message: "", __typename: "snack" },
        __typename: "user"
      }
    },
    resolvers: {
      Query: queryResolver
    },
    typeDefs: `
      type proposal {
        ID: String!
        address:String
        subject: String!
        contents:String!
        electoral_threshold:String
        winning_threshold:String
        status: String!
        expire_date:String!
        select_item: String!
        transaction:String
        final:String
        winner: String
      }

      type vote {
        voter: String
        selectItem: Int
        voteTxHash: String
        delegateTxID: String
        delegateAmount: Int
      }

      type PRep {
        address: String
        status: String
        penalty: String
        grade: String
        name: String
        country: String
        city: String
        stake: String
        delegated: String
        totalBlocks: String
        validatedBlocks: String
        unvalidatedSequenceBlocks: String
        irep: String
        irepUpdateBlockHeight: String
        lastGenerateBlockHeight: String
        blockHeight: String
        txIndex: String
        email: String
        website: String
        details: String
        p2pEndpoint: String
      }

      type pRepInfo {
        id: String
        address: String
      }

      type Query {
        get_proposals(proposer:String!, currPage:Int!, perPage:Int!): [proposal]
        get_proposal(proposer:String!, proposal_id:Int!): proposal
        get_votes(proposer:String!, proposal_id:Int!): [vote]
        get_verify_info_by_id(id:String!):String
        get_prep_info_by_id(id:String!):PRep
        get_prep_info_by_address(address:String!):PRep
        get_voting_power(proposer:String!, address:String!):Int
        get_preps():[pRepInfo]
      }
    `
  }
});

function App(props: any) {
  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <LayoutContainer />
      </ApolloProvider>
    </BrowserRouter>
  );
}

export default App;
