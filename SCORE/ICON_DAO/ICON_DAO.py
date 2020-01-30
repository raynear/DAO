from iconservice import *

TAG = 'ICON_DAO'


class IconDAO(IconScoreBase):
    BLOCK_HASH = "block_hash"
    ADDRESS = "address"
    ID = "ID"

    SUBJECT = "subject"
    CONTENTS = "contents"
    PROPOSER = "proposer"
    ELECTORAL_TH = "electoral_threshold"
    WINNING_TH = "winning_threshold"
    EXPIRE_DATE = "expire_date"
    SELECT_ITEM = "select_item"
    COUNT = "count"
    VOTER = "voter"
    WINNER = "winner"
    STATUS = "status"
    TX = "transaction"
    FINAL = "final"

    DELEGATE_TX_ID = "final_delegate_tx_id"
    DELEGATE_AMOUNT = "final_delegate_amount"

    _OWNER = "owner"
    _READY_TO_OWNER = "ready_to_owner"

    _VOTE = "vote"
    _VERIFY_ID = "verify_id"
    _PROPOSAL = "proposal"

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)

        self._a_verify_id = DictDB(
            self._VERIFY_ID, db, value_type=Address, depth=2)
        self._verify_id = DictDB(self._VERIFY_ID, db, value_type=str, depth=2)

        self._owner = VarDB(self._OWNER, db, value_type=Address)
        self._ready_to_owner = VarDB(
            self._READY_TO_OWNER, db, value_type=Address)

        self._proposal = DictDB(self._PROPOSAL, db, value_type=str, depth=3)
        self._i_proposal = DictDB(self._PROPOSAL, db, value_type=int, depth=3)

        self._vote = DictDB(self._VOTE, db, value_type=str, depth=4)
        self._i_vote = DictDB(self._VOTE, db, value_type=int, depth=4)

    def on_install(self) -> None:
        super().on_install()
        self._owner.set(self.owner)

    def on_update(self) -> None:
        super().on_update()

    @external(readonly=False)
    def transfer_ownership(self, _new_owner_address: Address):
        if self._owner.get() == self.msg.sender or self.owner == self.msg.sender:
            self._ready_to_owner.set(_new_owner_address)

    @external(readonly=False)
    def accept_ownership(self):
        if self._ready_to_owner.get() == self.msg.sender:
            self._owner.set(self._ready_to_owner.get())
            self._ready_to_owner.remove()

    @external(readonly=False)
    def verify(self, _block_hash: str, _id: str):
        self._a_verify_id[_id][self.ADDRESS] = self.msg.sender
        self._verify_id[str(self.msg.sender)][self.ID] = _id
        self._verify_id[str(self.msg.sender)][self.BLOCK_HASH] = _block_hash

    @external(readonly=True)
    def get_verify_info_by_address(self, _address: Address) -> str:
        return_json = dict()
        return_json[self.ADDRESS] = str(_address)
        return_json[self.ID] = self._verify_id[str(_address)][self.ID]
        return_json[self.BLOCK_HASH] = self._verify_id[str(
            _address)][self.BLOCK_HASH]

        return json_dumps(return_json)

    @external(readonly=True)
    def get_verify_info_by_id(self, _id: str) -> str:
        address_by_id = self._a_verify_id[_id][self.ADDRESS]
        if _id == self._verify_id[str(address_by_id)][self.ID]:
            return_json = dict()
            return_json[self.ADDRESS] = str(address_by_id)
            return_json[self.ID] = self._verify_id[str(address_by_id)][self.ID]
            return_json[self.BLOCK_HASH] = self._verify_id[str(
                address_by_id)][self.BLOCK_HASH]

            return json_dumps(return_json)
        else:
            return json_dumps(dict())

    @external(readonly=False)
    def vote(self, _proposer: str, _proposal_id: int, _user_id: str, _vote_item: int):
        if self._owner.get() == self.msg.sender:
            pid = str(_proposal_id)
            voter_address = str(self._a_verify_id[_user_id][self.ADDRESS])
            if voter_address is not None:
                user_vote_idx = self._i_vote[_proposer][pid][voter_address][self.COUNT]
                if user_vote_idx != 0:
                    self._vote[_proposer][pid][str(
                        user_vote_idx)][self.TX] = bytes.hex(self.tx.hash)
                    self._i_vote[_proposer][pid][str(
                        user_vote_idx)][self.SELECT_ITEM] = _vote_item
                else:
                    vote_idx = self._i_vote[_proposer][pid][self.COUNT][self.COUNT] + 1
                    vid = str(vote_idx)
                    self._vote[_proposer][pid][vid][self.VOTER] = voter_address
                    self._i_vote[_proposer][pid][vid][self.SELECT_ITEM] = _vote_item
                    self._vote[_proposer][pid][vid][self.TX] = bytes.hex(
                        self.tx.hash)
                    self._i_vote[_proposer][pid][self.COUNT][self.COUNT] = vote_idx
                    self._i_vote[_proposer][pid][voter_address][self.COUNT] = vote_idx

    @external(readonly=True)
    def get_votes(self, _proposer: str, _proposal_id: int) -> str:
        pid = str(_proposal_id)
        total_vote_cnt = self._i_vote[_proposer][pid][self.COUNT][self.COUNT]

        return_json = dict()
        return_json['vote'] = []
        for i in range(total_vote_cnt):
            vid = str(i+1)
            return_json['vote'].append({
                "voter": self._vote[_proposer][pid][vid][self.VOTER],
                "selectItem": self._i_vote[_proposer][pid][vid][self.SELECT_ITEM],
                "voteTxHash": self._vote[_proposer][pid][vid][self.TX],
                "delegateTxID": self._vote[_proposer][pid][vid][self.DELEGATE_TX_ID],
                "delegateAmount": self._i_vote[_proposer][pid][vid][self.DELEGATE_AMOUNT]
            })

        return json_dumps(return_json)

    @external(readonly=False)
    def finalize(self, _proposer: str, _proposal_id: int, _total_delegate: int, _final_data: str):
        if self._owner.get() == self.msg.sender:
            votes = json_loads(_final_data)

            pid = str(_proposal_id)
            for aVote in votes:
                vid = str(self._i_vote[_proposer][pid]
                          [aVote['voter']][self.COUNT])
                self._vote[_proposer][pid][vid][self.DELEGATE_TX_ID] = aVote[self.DELEGATE_TX_ID]
                self._i_vote[_proposer][pid][vid][self.DELEGATE_AMOUNT] = int(
                    aVote[self.DELEGATE_AMOUNT], 0)

            total_voting_power = 0
            result = dict()
            vote_cnt = self._i_vote[_proposer][pid][self.COUNT][self.COUNT]
            for i in range(vote_cnt):
                vid = str(i+1)
                select_item = self._i_vote[_proposer][pid][vid][self.SELECT_ITEM]
                amount = self._i_vote[_proposer][pid][vid][self.DELEGATE_AMOUNT]
                total_voting_power = total_voting_power + amount
                if select_item in result:
                    result[select_item] = result[select_item] + amount
                else:
                    result[select_item] = amount

            if _total_delegate != 0 and (total_voting_power/_total_delegate)*100 < self._i_proposal[_proposer][pid][self.ELECTORAL_TH]:
                self._proposal[_proposer][pid][self.STATUS] = "Rejected"
                return

            most_voted_item = 0
            most_voted = 0
            for i in result:
                if result[i] > most_voted:
                    most_voted = result[i]
                    most_voted_item = i

            self._proposal[_proposer][pid][self.FINAL] = bytes.hex(
                self.tx.hash)

            if total_voting_power != 0 and (most_voted/total_voting_power)*100 > self._i_proposal[_proposer][pid][self.WINNING_TH]:
                self._i_proposal[_proposer][pid][self.WINNER] = most_voted_item
                self._proposal[_proposer][pid][self.STATUS] = "Approved"
            else:
                self._proposal[_proposer][pid][self.STATUS] = "Rejected"

    @external(readonly=False)
    def set_proposal(self, _proposer: str, _subject: str, _contents: str, _electoral_th: int, _winning_th: int,
                     _expire_date: str, _select_items: str):
        if self._owner.get() == self.msg.sender:
            if self._a_verify_id[_proposer][self.ADDRESS] is None:
                revert()
            if self._i_proposal[_proposer][self.ID][self.ID] > 0:
                p_id = self._i_proposal[_proposer][self.ID][self.ID] + 1
            else:
                p_id = 1
            pid = str(p_id)
            self._i_proposal[_proposer][self.ID][self.ID] = p_id
            self._proposal[_proposer][pid][self.ADDRESS] = str(
                self._a_verify_id[_proposer][self.ADDRESS])
            self._proposal[_proposer][pid][self.SUBJECT] = _subject
            self._proposal[_proposer][pid][self.CONTENTS] = _contents
            self._i_proposal[_proposer][pid][self.ELECTORAL_TH] = _electoral_th
            self._i_proposal[_proposer][pid][self.WINNING_TH] = _winning_th
            self._proposal[_proposer][pid][self.STATUS] = "Voting"
            self._proposal[_proposer][pid][self.EXPIRE_DATE] = _expire_date
            self._proposal[_proposer][pid][self.SELECT_ITEM] = _select_items
            self._proposal[_proposer][pid][self.TX] = bytes.hex(self.tx.hash)
            self._i_vote[_proposer][pid][self.COUNT][self.COUNT] = 0

    @external(readonly=True)
    def get_last_proposal_id(self, _proposer: str) -> str:
        return str(self._i_proposal[_proposer][self.ID][self.ID])

    @external(readonly=True)
    def get_proposal(self, _proposer: str, _proposal_id: int) -> str:
        if self._i_proposal[_proposer][self.ID][self.ID] < _proposal_id:
            return ""
        pid = str(_proposal_id)
        return_json = dict()
        return_json[self.ID] = pid
        return_json[self.ADDRESS] = self._proposal[_proposer][pid][self.ADDRESS]
        return_json[self.SUBJECT] = self._proposal[_proposer][pid][self.SUBJECT]
        return_json[self.CONTENTS] = self._proposal[_proposer][pid][self.CONTENTS]
        return_json[self.ELECTORAL_TH] = str(
            self._i_proposal[_proposer][pid][self.ELECTORAL_TH])
        return_json[self.WINNING_TH] = str(
            self._i_proposal[_proposer][pid][self.WINNING_TH])
        return_json[self.STATUS] = self._proposal[_proposer][pid][self.STATUS]
        return_json[self.EXPIRE_DATE] = self._proposal[_proposer][pid][self.EXPIRE_DATE]
        return_json[self.SELECT_ITEM] = self._proposal[_proposer][pid][self.SELECT_ITEM]
        return_json[self.TX] = self._proposal[_proposer][pid][self.TX]
        return_json[self.FINAL] = self._proposal[_proposer][pid][self.FINAL]
        return_json[self.WINNER] = self._proposal[_proposer][pid][self.WINNER]

        return json_dumps(return_json)

    @external(readonly=True)
    def get_proposals(self, _proposer: str, _start_proposal_id: int, _end_proposal_id: int) -> str:
        last_proposal_id = self._i_proposal[_proposer][self.ID][self.ID]
        if last_proposal_id == 0 or last_proposal_id < _start_proposal_id:
            return ""
        if last_proposal_id+1 < _end_proposal_id:
            end = last_proposal_id + 1
        else:
            end = _end_proposal_id

        return_json = []
        for i in range(_start_proposal_id, end):
            pid = str(i)
            json = dict()
            json[self.ID] = pid
            json[self.SUBJECT] = self._proposal[_proposer][pid][self.SUBJECT]
            json[self.CONTENTS] = self._proposal[_proposer][pid][self.CONTENTS]
            json[self.ELECTORAL_TH] = str(
                self._i_proposal[_proposer][pid][self.ELECTORAL_TH])
            json[self.WINNING_TH] = str(
                self._i_proposal[_proposer][pid][self.WINNING_TH])
            json[self.STATUS] = self._proposal[_proposer][pid][self.STATUS]
            json[self.EXPIRE_DATE] = self._proposal[_proposer][pid][self.EXPIRE_DATE]
            json[self.SELECT_ITEM] = self._proposal[_proposer][pid][self.SELECT_ITEM]
            json[self.TX] = self._proposal[_proposer][pid][self.TX]
            json[self.FINAL] = self._proposal[_proposer][pid][self.FINAL]
            json[self.WINNER] = self._proposal[_proposer][pid][self.WINNER]

            return_json.append(json)

        return json_dumps(return_json)
