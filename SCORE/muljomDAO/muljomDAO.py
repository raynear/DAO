from iconservice import *

TAG = 'MulJomDaO'


class MulJomDaO(IconScoreBase):
    BLOCKHEIGHT = "blockheight"
    BLOCKHASH = "blockhash"
    ADDRESS = "address"
    ID = "ID"

    SUBJECT = "subject"
    CONTENTS = "contents"
    PROPOSER = "proposer"
    ELECTORALTH = "electoral_threshold"
    WINNINGTH = "winning_threshold"
    EXPIREDATE = "expire_date"
    SELECTITEM = "select_item"
    COUNT = "count"
    VOTE = "vote"
    VOTER = "voter"

    _OWNER = "owner"
    _READYTOOWNER = "ready_to_owner"

    _VERIFY_ID = "verify_id"
    _PROPOSAL = "proposal"

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)

        self._averify_id = DictDB(
            self._VERIFY_ID, db, value_type=Address, depth=2)
        self._iverify_id = DictDB(self._VERIFY_ID, db, value_type=int, depth=2)
        self._verify_id = DictDB(self._VERIFY_ID, db, value_type=str, depth=2)

        self._owner = VarDB(self._OWNER, db, value_type=Address)
        self._ready_to_owner = VarDB(
            self._READYTOOWNER, db, value_type=Address)

        self._proposal = DictDB(self._PROPOSAL, db, value_type=str, depth=3)
        self._iproposal = DictDB(self._PROPOSAL, db, value_type=int, depth=3)

        self._vote = DictDB(self.VOTE, db, value_type=str, depth=4)
        self._ivote = DictDB(self.VOTE, db, value_type=int, depth=4)

    def on_install(self) -> None:
        super().on_install()
        self._owner.set(self.owner)

    def on_update(self) -> None:
        super().on_update()

    @external(readonly=False)
    def TransferOwnership(self, _NewOwnerAddress: Address):
        if self._owner.get() == self.msg.sender or self.owner == self.msg.sender:
            self._ready_to_owner.set(_NewOwnerAddress)

    @external(readonly=False)
    def AcceptOwnership(self):
        if self._ready_to_owner.get() == self.msg.sender:
            self._owner.set(self._ready_to_owner.get())
            self._ready_to_owner.remove()

    @external(readonly=False)
    def Verify(self, _BlockHash: str, _ID: str):
        self._averify_id[_ID][self.ADDRESS] = self.msg.sender
        self._verify_id[str(self.msg.sender)][self.ID] = _ID
        self._verify_id[str(self.msg.sender)][self.BLOCKHASH] = _BlockHash
        self._verify_id[str(self.msg.sender)
                        ][self.BLOCKHEIGHT] = self.block_height

    @external(readonly=True)
    def GetVerifyInfoByAddress(self, _Address: Address) -> str:
        return_json = dict()
        return_json[self.ADDRESS] = str(_Address)
        return_json[self.ID] = self._verify_id[str(_Address)][self.ID]
        return_json[self.BLOCKHEIGHT] = self._iverify_id[str(
            _Address)][self.BLOCKHEIGHT]
        return_json[self.BLOCKHASH] = self._verify_id[str(
            _Address)][self.BLOCKHASH]

        return json_dumps(return_json)

    @external(readonly=True)
    def GetVerifyInfoByID(self, _ID: str) -> str:
        AddressByID = self._averify_id[_ID][self.ADDRESS]
        return_json = dict()
        return_json[self.ADDRESS] = str(AddressByID)
        return_json[self.ID] = self._verify_id[str(AddressByID)][self.ID]
        return_json[self.BLOCKHEIGHT] = self._iverify_id[str(
            AddressByID)][self.BLOCKHEIGHT]
        return_json[self.BLOCKHASH] = self._verify_id[str(
            AddressByID)][self.BLOCKHASH]

        return json_dumps(return_json)

    @external(readonly=False)
    def Vote(self, _Proposer: str, _ProposalID: int, _UserID: str, _VoteItem: int):
        if self._owner.get() == self.msg.sender:
            pid = str(_ProposalID)
            voter_address = str(self._averify_id[_UserID][self.ADDRESS])
            UserVoteIdx = self._ivote[_Proposer][pid][voter_address][self.COUNT]
            if self._vote[_Proposer][pid][str(UserVoteIdx)][self.VOTER] != "":
                self._ivote[_Proposer][pid][str(
                    UserVoteIdx)][self.SELECTITEM] = _VoteItem
            else:
                vote_idx = self._ivote[_Proposer][pid][self.COUNT][self.COUNT] + 1
                vid = str(vote_idx)
                self._vote[_Proposer][pid][vid][self.VOTER] = voter_address
                self._ivote[_Proposer][pid][vid][self.SELECTITEM] = _VoteItem
                self._ivote[_Proposer][pid][self.COUNT][self.COUNT] = vote_idx
                self._ivote[_Proposer][pid][voter_address][self.COUNT] = vote_idx

    @external(readonly=True)
    def GetVotes(self, _Proposer: str, _ProposalID: int) -> str:
        total_vote_cnt = self._ivote[_Proposer][str(
            _ProposalID)][self.COUNT][self.COUNT]
        pid = str(_ProposalID)

        return_json = dict()
        return_json['vote'] = []
        for i in range(total_vote_cnt):
            vid = str(i+1)
            return_json['vote'].append({
                "voter": self._vote[_Proposer][pid][vid][self.VOTER],
                "selectItem": self._ivote[_Proposer][pid][vid][self.SELECTITEM]})

        return json_dumps(return_json)

    @external(readonly=False)
    def SetProposal(self, _Proposer: str, _Subject: str, _Contents: str, _ElectoralTH: int, _WinningTH: int, _ExpireDate: str, _SelectItems: str):
        if self._owner.get() == self.msg.sender:
            if self._iproposal[_Proposer][self.ID][self.ID] > 0:
                p_id = self._iproposal[_Proposer][self.ID][self.ID] + 1
            else:
                p_id = 1
            pid = str(p_id)
            self._iproposal[_Proposer][self.ID][self.ID] = p_id
            self._proposal[_Proposer][pid][self.SUBJECT] = _Subject
            self._proposal[_Proposer][pid][self.CONTENTS] = _Contents
            self._iproposal[_Proposer][pid][self.ELECTORALTH] = _ElectoralTH
            self._iproposal[_Proposer][pid][self.WINNINGTH] = _WinningTH
            self._proposal[_Proposer][pid][self.EXPIREDATE] = _ExpireDate
            self._proposal[_Proposer][pid][self.SELECTITEM] = _SelectItems
            self._ivote[_Proposer][pid][self.COUNT][self.COUNT] = 0

    @external(readonly=True)
    def GetLastProposalID(self, _Proposer: str) -> str:
        return str(self._iproposal[_Proposer][self.ID][self.ID])

    @external(readonly=True)
    def GetProposal(self, _Proposer: str, _ProposalID: int) -> str:
        pid = str(_ProposalID)
        return_json = dict()
        return_json[self.SUBJECT] = self._proposal[_Proposer][pid][self.SUBJECT]
        return_json[self.CONTENTS] = self._proposal[_Proposer][pid][self.CONTENTS]
        return_json[self.ELECTORALTH] = str(
            self._iproposal[_Proposer][pid][self.ELECTORALTH])
        return_json[self.WINNINGTH] = str(
            self._iproposal[_Proposer][pid][self.WINNINGTH])
        return_json[self.EXPIREDATE] = self._proposal[_Proposer][pid][self.EXPIREDATE]
        return_json[self.SELECTITEM] = self._proposal[_Proposer][pid][self.SELECTITEM]

        return json_dumps(return_json)
