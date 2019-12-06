import gql from "graphql-tag";

export const GET_PROPOSAL = gql`
  query Proposal($id: Int!) {
    proposal(id: $id) {
      prep{
        id
      }
      subject
      author{
        id
        username
      }
      contents
      published
      expireAt
      quorumRate
      tokenRate
      selectitemmodelSet {
        id
        index
        contents
      }
    }
    allPrep{
      id
      name
    }
  }
`;

export const SET_PROPOSAL = gql`
  mutation SetProposal(
    $proposalId: Int
    $subject: String!
    $contents: String!
    $prepId: Int!
    $published: Boolean!
    $quorumRate: Int!
    $tokenRate: Int!
    $expireAt: DateTime!
    $selectItemList: [SelectItemInput]
  ) {
    setProposal(
      proposalId: $proposalId
      subject: $subject
      contents: $contents
      prepId: $prepId
      published: $published
      quorumRate: $quorumRate
      tokenRate: $tokenRate
      expireAt: $expireAt
      selectItemList: $selectItemList
    ) {
      proposal {
        id
        selectitemmodelSet {
          id
        }
      }
    }
  }
`;

export const SET_PUBLISH = gql`
  mutation PublishProposal($proposalId: Int!) {
    publishProposal(proposalId: $proposalId) {
      proposal {
        author {
          username
        }
        subject
        contents
        published
        quorumRate
        tokenRate
        expireAt
        selectitemmodelSet {
          index
          contents
          votemodelSet {
            voter {
              username
            }
          }
        }
      }
    }
  }
`;

export const SET_VOTE = gql`
  mutation VoteProposal($proposalId: Int!, $selectItemIndex: Int!) {
    voteProposal(proposalId: $proposalId, selectItemIndex: $selectItemIndex) {
      proposal {
        author {
          username
        }
        subject
        contents
        published
        quorumRate
        tokenRate
        expireAt
        selectitemmodelSet {
          index
          contents
          votemodelSet {
            voter {
              username
            }
          }
        }
      }
    }
  }
`;


export const GET_ME = gql`
  query {
    me {
      username
      email
      socialAuth {
        edges {
          node {
            extraData
          }
        }
      }
    }
  }
`;

export const TOKEN_AUTH = gql`
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
    }
  }
`;

export const GET_LOCAL_ME = gql`
  query {
    username @client
  }
`;

export const GET_LOCAL_ADDRESS = gql`
  query {
    icon_address @client
  }
`;

export const SET_USER = gql`
  mutation SetUser($username: String!, $password: String!) {
    setUser(username: $username, password: $password) {
      user {
        username
        email
      }
    }
  }
`;

export const LOG_OUT = gql`
  mutation Logout {
    logout {
      noop
    }
  }
`;

export const GET_PREPS = gql`
  query {
    allPrep{
      id
      name
      prepAddress
      description
    }
  }
`;

export const GET_PREP = gql`
query PRep($UserID:String!){
  prep(userId:$UserID){
    id
    name
    prepAddress
    description
  }
}
`;


export const GET_PROPOSAL_N_PREP = gql`
  query ProposalNPRep($id: Int!, $UserID:String!) {
    proposal(id: $id) {
      id
      prep{
        id
      }
      subject
      author{
        id
      }
      contents
      published
      expireAt
      quorumRate
      tokenRate
      selectitemmodelSet {
        id
        index
        contents
      }
    }
    allPrep{
      id
      name
    }
  prep(userId:$UserID){
    id
    name
    prepAddress
    description
  }

  }
`;

export const GET_PROPOSALS = gql`
  query Proposals($selectedPRep:String, $search: String, $first: Int, $skip: Int) {
    proposals(prep:$selectedPRep, search: $search, first: $first, skip: $skip) {
      id
      author {
        id
        username
        email
      }
      subject
      contents
      selectitemmodelSet {
        contents
      }
    }
  }
`;

export const VERIFY_TOKEN = gql`
  mutation VerifyToken($token: String!) {
    verifyToken(token:$token) {
      payload
    }
  }
`;

export function selectWallet() {
  window.dispatchEvent(new CustomEvent('ICONEX_RELAY_REQUEST', {
    detail: {
      type: 'REQUEST_ADDRESS'
    }
  }));
}