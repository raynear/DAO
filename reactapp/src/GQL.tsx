import gql from "graphql-tag";

export const GET_PROPOSAL = gql`
  query Proposal($id: Int!) {
    proposal(id: $id) {
      id
      prep{
        id
        username
        iconAddress
      }
      status
      subject
      contents
      published
      expireAt
      electoralTh
      winningTh
      prepPid
      selectitemmodelSet {
        id
        index
        contents
        votemodelSet{
          id
          select {
            id
          }
          voter {
            id
            username
            iconAddress
          }
        }
      }
    }
  }
`;

export const SET_PROPOSAL = gql`
  mutation SetProposal(
    $proposalId: Int
    $subject: String!
    $contents: String!
    $published: Boolean!
    $electoralTh: Int!
    $winningTh: Int!
    $expireAt: DateTime!
    $selectItemList: [SelectItemInput]
  ) {
    setProposal(
      proposalId: $proposalId
      subject: $subject
      contents: $contents
      published: $published
      electoralTh:$electoralTh
      winningTh:$winningTh
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
        id
        status
        subject
        contents
        published
        electoralTh
        winningTh
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
  mutation VoteProposal($proposer:String!, $proposalId: Int!, $selectItemIndex: Int!) {
    voteProposal(proposer:$proposer, proposalId: $proposalId, selectItemIndex: $selectItemIndex) {
      proposal {
        id
        status
        subject
        contents
        published
        electoralTh
        winningTh
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


export const TOKEN_AUTH = gql`
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
    }
  }
`;

export const GET_LOCAL_SNACK = gql`
  query {
    snack @client {
      message
      open
    }
  }
`;

export const GET_LOCAL_ADDRESS = gql`
  query {
    connected_address @client
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
      username
      iconAddress
    }
    viewer{
      username
      iconAddress
    }
  }
`;

export const GET_PROPOSAL4EDIT = gql`
  query Proposal4Edit($id: Int!) {
    proposal(id: $id) {
      id
      prep{
        id
        username
      }
      status
      subject
      contents
      published
      expireAt
      electoralTh
      winningTh
      selectitemmodelSet {
        id
        index
        contents
      }
    }
    viewer{
      username
      iconAddress
      isPrep
    }
  }
`;

export const GET_PROPOSALS = gql`
  query Proposals($selectedPRep:String, $first: Int, $end: Int) {
    proposals(prep:$selectedPRep, first: $first, end: $end) {
      id
      status
      subject
      prep{
        id
        username
      }
      prepPid
      contents
      selectitemmodelSet {
        contents
        votemodelSet{
          id
          select {
            id
          }
          voter {
            id
            username
          }
        }
      }
    }
  }
`;

export const NEW_PREP = gql`
  mutation SetPRep($Address: String!) {
    setPrep(iconAddress:$Address) {
      prep{
        id
        username
        iconAddress
        isPrep
      }
    }
  }
`;

export const ADD_ICON_ADDRESS = gql`
mutation AddIconAddress($IconAddress:String!){
  addIconAddress(iconAddress:$IconAddress){
    user{
      username
      iconAddress
    }
  }
}
`;

export const FINALIZE = gql`
mutation Finalize($Proposer:String!, $ProposalID:Int!){
  finalize(proposer:$Proposer, proposalId:$ProposalID){
    proposal{
      id
      status
      subject
    }
  }
}
`;

export const REFRESH_TOKEN = gql`
mutation RefreshToken($token:String!) {
  refreshToken(token:$token) {
    token
  }
}
`;

export const VIEWER = gql`
  query {
    viewer{
      username
      iconAddress
      isPrep
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