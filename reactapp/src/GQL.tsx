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
  mutation VoteProposal($proposalId: Int!, $selectItemIndex: Int!) {
    voteProposal(proposalId: $proposalId, selectItemIndex: $selectItemIndex) {
      proposal {
        id
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

export const GET_LOCAL_ME = gql`
  query {
    username @client
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
      username
      iconAddress
    }
  }
`;

export const GET_PREP = gql`
query PRep($PRepName:String!){
  prep(prepName:$PRepName){
    id
    username
    iconAddress
  }
}
`;


export const GET_PROPOSAL_N_PREP = gql`
  query ProposalNPRep($id: Int!, $PRepName:String!) {
    proposal(id: $id) {
      id
      prep{
        id
      }
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
    allPrep{
      id
      username
    }
  prep(prepName:$PRepName){
    id
    username
    iconAddress
  }

  }
`;

export const GET_PROPOSALS = gql`
  query Proposals($selectedPRep:String, $search: String, $first: Int, $skip: Int) {
    proposals(prep:$selectedPRep, search: $search, first: $first, skip: $skip) {
      id
      subject
      prep{
        id
        username
      }
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