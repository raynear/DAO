import gql from "graphql-tag";

export const GET_PROPOSAL = gql`
  query Proposal($id: Int!, $selectedPRep: String!) {
    proposal(id: $id) {
      id
      prep {
        id
        username
        iconAddress
      }
      status
      isPublicVote
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
      }
    }
    get_prep_info_by_id(_proposer: $selectedPRep) @client {
      name
      website
      delegated
    }
  }
`;

export const SET_PROPOSAL = gql`
  mutation SetProposal(
    $proposalId: Int
    $isPublicVote: Boolean!
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
      isPublicVote: $isPublicVote
      subject: $subject
      contents: $contents
      published: $published
      electoralTh: $electoralTh
      winningTh: $winningTh
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
        }
      }
    }
  }
`;

export const SET_VOTE = gql`
  mutation VoteProposal(
    $proposer: String!
    $proposalId: Int!
    $selectItemIndex: Int!
  ) {
    voteProposal(
      proposer: $proposer
      proposalId: $proposalId
      selectItemIndex: $selectItemIndex
    ) {
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
        }
      }
    }
  }
`;

export const TOKEN_AUTH = gql`
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      refreshToken
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
    allPrep {
      id
      username
      iconAddress
    }
  }
`;

export const GET_PROPOSAL4EDIT = gql`
  query Proposal4Edit($id: Int!) {
    proposal(id: $id) {
      id
      prep {
        id
        username
      }
      status
      isPublicVote
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
    viewer {
      username
      iconAddress
      isPrep
    }
  }
`;

export const GET_PROPOSALS = gql`
  query Proposals($selectedPRep: String, $first: Int, $end: Int) {
    proposals(prep: $selectedPRep, first: $first, end: $end) {
      id
      status
      subject
      prep {
        id
        username
      }
      prepPid
      contents
      selectitemmodelSet {
        contents
      }
    }
    proposalCnt(prep: $selectedPRep) {
      aInt
    }
  }
`;

export const PROPOSALS = gql`
  query Proposals($proposer: String, $currPage: Int, $perPage: Int) {
    get_proposals(
      _proposer: $proposer
      _currPage: $currPage
      _perPage: $perPage
    ) @client {
      ID
      subject
      status
      winner
      select_item
    }
  }
`;

export const PROPOSAL = gql`
  query Proposal($proposer: String!, $proposal_id: Int!) {
    get_proposal(_proposer: $proposer, _proposal_id: $proposal_id) @client {
      ID
      address
      subject
      contents
      electoral_threshold
      winning_threshold
      status
      expire_date
      transaction
      final
      winner
      select_item
    }
  }
`;

export const VOTES = gql`
  query Votes($proposer: String!, $proposal_id: Int!) {
    get_votes(_proposer: $proposer, _proposal_id: $proposal_id) @client {
      voter
      selectItem
      voteTxHash
      delegateTxID
      delegateAmount
    }
  }
`;

export const PREP_INFO_BY_ID = gql`
  query PRepInfoByID($proposer: String!) {
    get_prep_info_by_id(_proposer: $proposer) @client {
      name
      website
      delegated
    }
  }
`;

export const LAST_PROPOSAL_ID = gql`
  query LastProposalId($proposer: String!) {
    get_last_proposal_id(_proposer: $proposer) @client
  }
`;

export const VOTING_POWER = gql`
  query VotingPower($proposer: String!, $user: String!) {
    get_voting_power(_proposer: $proposer, _user: $user) @client
  }
`;

export const MY_VOTING_POWER = gql`
  query MyVotingPower($proposer: String!) {
    get_my_voting_power(_proposer: $proposer) @client
  }
`;

export const VOTED_POWER_RATES = gql`
  query VotedPowerRates(
    $proposer: String!
    $proposal_id: Int!
    $user: String!
  ) {
    get_voted_power_rates(
      _proposer: $proposer
      _proposal_id: $proposal_id
      _user: $user
    ) @client
  }
`;

export const NEW_PREP = gql`
  mutation SetPRep($Address: String!) {
    setPrep(iconAddress: $Address) {
      prep {
        id
        username
        iconAddress
        isPrep
      }
    }
  }
`;

export const ADD_ICON_ADDRESS = gql`
  mutation AddIconAddress($IconAddress: String!) {
    addIconAddress(iconAddress: $IconAddress) {
      user {
        username
        iconAddress
      }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(token: $token) {
      token
    }
  }
`;

export const VIEWER = gql`
  query {
    viewer @client {
      username
      iconAddress
      isPrep
    }
  }
`;

export const GET_VIEWER = gql`
  query {
    viewer {
      username
      iconAddress
      isPrep
    }
  }
`;
