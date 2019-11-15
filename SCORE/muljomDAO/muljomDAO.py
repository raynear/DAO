from iconservice import *

TAG = 'MulJomDaO'


class MulJomDaO(IconScoreBase):
    BLOCKHEIGHT = "blockheight"
    BLOCKHASH = "blockhash"
    ADDRESS = "address"
    ID = "ID"
    CONFIRMED = "confirmed"

    SUBJECT = "subject"
    CONTENTS = "contents"
    PROPOSER = "proposer"
    SELECTITEM = "select_item"
    COUNT = "count"
    VOTE = "vote"

    _OWNER = "owner"
    _READYTOOWNER = "ready_to_owner"

    _VERIFY_ID = "verify_id"

    _PROPOSAL = "proposal"
    _SELECTITEM = "select_item"

    _PROPOSAL_IDX = "proposal_idx"

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)

        self._averify_id = DictDB(
            self._VERIFY_ID, db, value_type=Address, depth=2)
        self._verify_id = DictDB(self._VERIFY_ID, db, value_type=str, depth=2)
        self._iverify_id = DictDB(self._VERIFY_ID, db, value_type=int, depth=2)
        self._bverify_id = DictDB(
            self._VERIFY_ID, db, value_type=bool, depth=2)

        self._owner = VarDB(self._OWNER, db, value_type=Address)
        self._ready_to_owner = VarDB(
            self._READYTOOWNER, db, value_type=Address)

        self._proposal_idx = VarDB(self._PROPOSAL_IDX, db, value_type=int)
        self._proposal = DictDB(self._PROPOSAL, db, value_type=str, depth=2)
        self._select_item = DictDB(
            self._SELECTITEM, db, value_type=str, depth=2)

        self._vote = DictDB(self.VOTE, db, value_type=str, depth=3)
        self._ivote = DictDB(self.VOTE, db, value_type=int, depth=3)

    def on_install(self) -> None:
        super().on_install()
        self._owner.set(self.owner)
        self._proposal_idx.set(0)

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

#
#
# ID 중복체크, unverify추가
#
#
    @external(readonly=False)
    def Verify(self, _BlockHeight: int, _BlockHash: str, _ID: str):
        if self.block_height > _BlockHeight+30:
            revert("verifying time over")

        self._averify_id[_ID][self.ADDRESS] = self.msg.sender
        self._verify_id[str(self.msg.sender)][self.ID] = _ID
        self._iverify_id[str(self.msg.sender)][self.BLOCKHEIGHT] = _BlockHeight
        self._verify_id[str(self.msg.sender)][self.BLOCKHASH] = _BlockHash
        self._bverify_id[str(self.msg.sender)][self.CONFIRMED] = False

    @external(readonly=False)
    def ConfirmVerify(self, _TargetAddress: Address) -> bool:
        if self._owner.get() == self.msg.sender:
            self._bverify_id[str(_TargetAddress)][self.CONFIRMED] = True
            return True
        return False

    @external(readonly=True)
    def GetVerifyInfoByAddress(self, _Address: Address) -> str:
        return_json = dict()
        return_json[self.ADDRESS] = str(_Address)
        return_json[self.ID] = self._verify_id[str(_Address)][self.ID]
        return_json[self.BLOCKHEIGHT] = self._iverify_id[str(
            _Address)][self.BLOCKHEIGHT]
        return_json[self.BLOCKHASH] = self._verify_id[str(
            _Address)][self.BLOCKHASH]
        return_json[self.CONFIRMED] = self._bverify_id[str(
            _Address)][self.CONFIRMED]

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
        return_json[self.CONFIRMED] = self._bverify_id[str(
            AddressByID)][self.CONFIRMED]

        return json_dumps(return_json)

    @external(readonly=False)
    def Vote(self, _ProposalID: str, _UserID: str, _VoteItem: int):
        if self._owner.get() == self.msg.sender:
            voter_address = self._averify_id[_UserID][self.ADDRESS]
            if self._bverify_id[str(voter_address)][self.CONFIRMED]:
                vote_idx = self._ivote[_ProposalID][self.COUNT][self.COUNT]+1
                self._vote[_ProposalID][str(vote_idx)][self.VOTER] = _UserID
                self._ivote[_ProposalID][str(
                    vote_idx)][self.SELECTITEM] = _VoteItem
                self._ivote[_ProposalID][self.COUNT][self.COUNT] = vote_idx

    @external(readonly=True)
    def GetVotes(self, _ProposalID: str) -> str:
        total_vote_cnt = self._ivote[_ProposalID][self.COUNT][self.COUNT]

        return_json = dict()
        return_json['vote'] = []
        for i in range(total_vote_cnt+1):
            return_json['vote'].append({
                "voter": self._vote[_ProposalID][str(i)][self.VOTER],
                "selectItem": self._vote[_ProposalID][str(i)][self.SELECTITEM]})

        return json_dumps(return_json)

    @external(readonly=False)
    def SetProposal(self, _Subject: str, _Contents: str, _Proposer: str, _SelectItems: str):
        if self._owner.get() == self.msg.sender:
            self._proposal_idx.set(self._proposal_idx.get()+1)
            pid = str(self._proposal_idx.get())
            self._proposal[pid][self.SUBJECT] = _Subject
            self._proposal[pid][self.CONTENTS] = _Contents
            self._proposal[pid][self.PROPOSER] = _Proposer
            self._vote[pid][self.COUNT] = str(0)

            select_items = json_loads(_SelectItems)
            self._select_item[pid][self.COUNT] = str(len(select_items))
            for idx, val in enumerate(select_items):
                self._select_item[pid][str(idx)] = val

    @external(readonly=True)
    def GetProposal(self, _ProposalID: str) -> str:
        return_json = dict()
        return_json[self.SUBJECT] = self._proposal[_ProposalID][self.SUBJECT]
        return_json[self.CONTENTS] = self._proposal[_ProposalID][self.CONTENTS]
        return_json[self.PROPOSER] = self._proposal[_ProposalID][self.PROPOSER]

        return_json[self.SELECTITEM] = []
        for i in range(int(self._select_item[_ProposalID][self.COUNT])):
            return_json[self.SELECTITEM].append(
                self._select_item[_ProposalID][str(i)])

        return json_dumps(return_json)
