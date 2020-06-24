from iconservice import *

TAG = 'ICON_DAO'


def is_none(par):
    if not par:
        return True
    else:
        return False


def is_not_none(par):
    if par:
        return True
    else:
        return False


def only_owner(func):
    @wraps(func)
    def __wrapper(self: object, *args, **kwargs):
        if self.msg.sender != self.owner and self.msg.sender != self._owner.get():
            revert("Not owner")

        return func(self, *args, **kwargs)
    return __wrapper


def catch_error(func):
    @wraps(func)
    def __wrapper(self: object, *args, **kwargs):
        try:
            return func(self, *args, **kwargs)
        except Exception as e:
            revert(repr(e))

    return __wrapper


class VoteStatus:
    VOTING = "Voting"
    REJECTED = "Rejected"
    APPROVED = "Approved"
    CANCELED = "Canceled"
    REMOVED = "Removed"


class Status:
    DISABLE = -1


class IconDAO(IconScoreBase):
    BLOCK_HASH = "block_hash"
    ADDRESS = "address"
    ID = "ID"

    SUBJECT = "subject"
    CONTENTS = "contents"
    PROPOSER = "proposer"
    ELECTORAL_TH = "electoral_threshold"
    WINNING_TH = "winning_threshold"
    EXPIRE_TIMESTAMP = "expire_timestamp"
    SELECT_ITEM = "select_item"
    COUNT = "count"
    IS_VOTED = "is_voted"
    VOTER = "voter"
    WINNER = "winner"
    STATUS = "status"
    TX = "transaction"
    FINAL = "final"
    TYPE = "type"

    DELEGATE_TX_ID = "final_delegate_tx_id"
    DELEGATE_AMOUNT = "final_delegate_amount"

    _OWNER = "owner"
    _READY_TO_OWNER = "ready_to_owner"

    _VOTE = "vote"
    _VERIFY_ID = "verify_id"
    _PREPS = "preps"
    _PAGE = "page"
    _PROPOSAL = "proposal"
    _RECENT_PROPOSAL = "recent_proposal"
    _COMMUNITY_PROPOSAL = "community_proposal"

    TARGET_MY_VOTER = "MyVoter"

    @eventlog
    def logging(self, msg: str):
        pass

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)

        self._a_verify_id = DictDB(self._VERIFY_ID, db, value_type=Address, depth=2)
        self._verify_id = DictDB(self._VERIFY_ID, db, value_type=str, depth=2)
        self._i_verify_id = DictDB(self._VERIFY_ID, db, value_type=int, depth=2)

        self._preps = DictDB(self._PREPS, db, value_type=str, depth=1)
        self._i_preps = DictDB(self._PREPS, db, value_type=int, depth=1)

        self._page = DictDB(self._PAGE, db, value_type=str, depth=1)
        self._i_page = DictDB(self._PAGE, db, value_type=int, depth=1)

        self._recent_proposal = DictDB(self._RECENT_PROPOSAL, db, value_type=str, depth=1)
        self._i_recent_proposal = DictDB(self._RECENT_PROPOSAL, db, value_type=int, depth=1)
        self._community_proposal = DictDB(self._COMMUNITY_PROPOSAL, db, value_type=str, depth=3)
        self._i_community_proposal = DictDB(self._COMMUNITY_PROPOSAL, db, value_type=int, depth=3)
        self._owner = VarDB(self._OWNER, db, value_type=Address)
        self._ready_to_owner = VarDB(self._READY_TO_OWNER, db, value_type=Address)

        self._proposal = DictDB(self._PROPOSAL, db, value_type=str, depth=3)
        self._i_proposal = DictDB(self._PROPOSAL, db, value_type=int, depth=3)

        self._vote = DictDB(self._VOTE, db, value_type=str, depth=4)
        self._i_vote = DictDB(self._VOTE, db, value_type=int, depth=4)
        self._b_vote = DictDB(self._VOTE, db, value_type=bool, depth=4)

    def on_install(self) -> None:
        super().on_install()
        self._owner.set(self.owner)
        self._i_preps[self.COUNT] = 0
        self._i_page[self.COUNT] = 0
        self._i_recent_proposal[self.COUNT] = 0
        self._i_verify_id[self.COUNT][self.COUNT] = 0

    def on_update(self) -> None:
        super().on_update()
        self._i_community_proposal["Community"][self.COUNT][self.COUNT] = 0

    @external(readonly=True)
    def get_user_count(self) -> int:
        return self._i_verify_id[self.COUNT][self.COUNT]

    @only_owner
    @external(readonly=False)
    @catch_error
    def transfer_ownership(self, _new_owner_address: Address):
        self._ready_to_owner.set(_new_owner_address)

    @only_owner
    @external(readonly=False)
    @catch_error
    def accept_ownership(self):
        self._owner.set(self._ready_to_owner.get())
        self._ready_to_owner.remove()

    @external(readonly=False)
    @catch_error
    def verify(self, _block_hash: str, _id: str):
        if self._verify_id[str(self.msg.sender)][self.ID] == _id and self._a_verify_id[_id][self.ADDRESS] == self.msg.sender:
            revert("Already Verified by given Information")

        if is_none(self._verify_id[str(self._a_verify_id[_id][self.ADDRESS])][self.ID]):
            self._i_verify_id[self.COUNT][self.COUNT] = self._i_verify_id[self.COUNT][self.COUNT] + 1
        self._a_verify_id[_id][self.ADDRESS] = self.msg.sender
        self._verify_id[str(self.msg.sender)][self.ID] = _id
        self._verify_id[str(self.msg.sender)][self.BLOCK_HASH] = _block_hash

    @external(readonly=True)
    def get_verify_info_by_address(self, _address: str) -> str:
        id_by_address = self._verify_id[_address][self.ID]
        if is_none(id_by_address) or self._a_verify_id[id_by_address][self.ADDRESS] != Address.from_string(_address):
            return _address + " is not verified"

        return_json = dict()
        return_json[self.ADDRESS] = str(self._a_verify_id[id_by_address][self.ADDRESS])
        return_json[self.ID] = self._verify_id[_address][self.ID]
        return_json[self.BLOCK_HASH] = self._verify_id[_address][self.BLOCK_HASH]
        return_json[self.COUNT] = self._i_verify_id[id_by_address][self.COUNT]

        return json_dumps(return_json)

    @external(readonly=True)
    def get_verify_info_by_id(self, _id: str) -> str:
        address_by_id = str(self._a_verify_id[_id][self.ADDRESS])
        if is_none(address_by_id) or self._verify_id[address_by_id][self.ID] != _id:
            return _id + " is not verified"

        return_json = dict()
        return_json[self.ADDRESS] = address_by_id
        return_json[self.ID] = self._verify_id[address_by_id][self.ID]
        return_json[self.BLOCK_HASH] = self._verify_id[address_by_id][self.BLOCK_HASH]
        return_json[self.COUNT] = self._i_verify_id[_id][self.COUNT]

        return json_dumps(return_json)

    def _add_page(self, _page_id: str):
        if is_not_none(self._page[_page_id]):
            revert("Already registered")

        self._i_page[self.COUNT] = self._i_page[self.COUNT] + 1

        self._i_page[_page_id] = self._i_page[self.COUNT]
        self._page[str(self._i_page[self.COUNT])] = _page_id

        self._i_community_proposal[_page_id][self.COUNT][self.COUNT] = 0

    @only_owner
    @external(readonly=False)
    @catch_error
    def add_page(self, _page_id: str):
        self._add_page(_page_id)

    @only_owner
    @external(readonly=False)
    @catch_error
    def toggle_page_status(self, _page_id: str):
        if is_not_none(self._page[_page_id]):
            if self._i_page[_page_id] == Status.DISABLE:
                for page in range(self._i_page[self.COUNT]):
                    if _page_id == self._page[str(page+1)]:
                        self._i_page[_page_id] = page+1
            else:
                self._i_page[_page_id] = Status.DISABLE
        else:
            revert("There is no PRep name " + _page_id)

    @only_owner
    @external(readonly=False)
    def set_page_cnt(self, _page_cnt: int):
        self._i_page[self.COUNT] = _page_cnt

    @external(readonly=True)
    def get_page_cnt(self) -> int:
        return self._i_page[self.COUNT]

    @external(readonly=True)
    def get_page_by_cnt(self, _cnt: int) -> str:
        if is_not_none(self._page[str(_cnt)]) and self._i_page[self._page[str(_cnt)]] != Status.DISABLE:
            return self._page[str(_cnt)]
        else:
            return "No Page on " + str(_cnt)

    def _is_page(self, _id: str) -> bool:
        if is_not_none(self._page[_id]):
            return True
        else:
            return False

    @external(readonly=True)
    def is_page(self, _id: str) -> bool:
        return self._is_page(_id)

    @external(readonly=True)
    def is_page_disabled(self, _id: str) -> bool:
        if self._i_page[_id] != Status.DISABLE:
            return True
        else:
            return False

    @external(readonly=True)
    def get_pages(self) -> list:
        return_json = []
        for i in range(1, self._i_page[self.COUNT]+1):
            if self._i_page[self._page[str(i)]] != Status.DISABLE:
                return_json.append(self._page[str(i)])
        return return_json

    @only_owner
    @external(readonly=False)
    def add_prep(self, _prep_id: str):
        if is_not_none(self._preps[_prep_id]):
            revert("Already registered")

        self.logging(_prep_id + ':' + str(self._preps[_prep_id]))

        self._i_preps[self.COUNT] = self._i_preps[self.COUNT] + 1

        self._i_preps[_prep_id] = self._i_preps[self.COUNT]
        self._preps[str(self._i_preps[self.COUNT])] = _prep_id

    @only_owner
    @external(readonly=False)
    def toggle_prep_status(self, _prep_id: str):
        if is_not_none(self._preps[_prep_id]):
            if self._i_preps[_prep_id] == Status.DISABLE:
                for prep in range(self._i_preps[self.COUNT]):
                    if _prep_id == self._preps[str(prep+1)]:
                        self._i_preps[_prep_id] = prep+1
            else:
                self._i_preps[_prep_id] = Status.DISABLE
        else:
            revert("There is no PRep name " + _prep_id)

    @only_owner
    @external(readonly=False)
    def set_prep_cnt(self, _prep_cnt: int):
        self._i_preps[self.COUNT] = _prep_cnt

    @external(readonly=True)
    def get_prep_cnt(self) -> int:
        return self._i_preps[self.COUNT]

    @external(readonly=True)
    def get_prep_by_cnt(self, _cnt: int) -> str:
        if is_not_none(self._preps[str(_cnt)]) and self._i_preps[self._preps[str(_cnt)]] != Status.DISABLE:
            return self._preps[str(_cnt)]
        else:
            return "No PRep on " + str(_cnt)

    @external(readonly=True)
    def is_prep(self, _id: str) -> bool:
        if is_not_none(self._preps[_id]):
            return True
        else:
            return False

    @external(readonly=True)
    def is_prep_disabled(self, _id: str) -> bool:
        if self._i_preps[_id] != Status.DISABLE:
            return True
        else:
            return False

    @external(readonly=True)
    def get_preps(self) -> list:
        return_json = []
        for i in range(1, self._i_preps[self.COUNT]+1):
            if self._i_preps[self._preps[str(i)]] != Status.DISABLE:
                _id = self._preps[str(i)]
                a_prep = dict()
                a_prep['username'] = _id
                a_prep['address'] = str(self._a_verify_id[_id][self.ADDRESS])
                return_json.append(a_prep)
        return return_json

    @only_owner
    @external(readonly=False)
    def vote(self, _proposer: str, _proposal_id: int, _voter_address: str, _vote_item: int):
        pid = str(_proposal_id)
        if is_none(self._verify_id[_voter_address][self.ID]):
            revert("Voter Not Verified")
        if is_none(self._proposal[_proposer][pid][self.SUBJECT]):
            revert("No Proposal")
        if self._proposal[_proposer][pid][self.STATUS] != VoteStatus.VOTING:
            revert("Proposal is Not Voting")

        expire_timestamp = self._i_proposal[_proposer][pid][self.EXPIRE_TIMESTAMP]
        if expire_timestamp > self.now():
            revert(_proposer + "'s " + pid + " proposal is expired")

        user_vote_idx = self._i_vote[_proposer][pid][_voter_address][self.COUNT]
        if self._b_vote[_proposer][pid][_voter_address][self.IS_VOTED]:
            vid = str(user_vote_idx)
            self._vote[_proposer][pid][vid][self.TX] = self.tx.hash.hex()
            self._i_vote[_proposer][pid][vid][self.SELECT_ITEM] = _vote_item
        else:
            vote_idx = self._i_vote[_proposer][pid][self.COUNT][self.COUNT] + 1
            vid = str(vote_idx)
            self._vote[_proposer][pid][vid][self.VOTER] = _voter_address
            self._i_vote[_proposer][pid][vid][self.SELECT_ITEM] = _vote_item
            self._vote[_proposer][pid][vid][self.TX] = self.tx.hash.hex()
            self._i_vote[_proposer][pid][self.COUNT][self.COUNT] = vote_idx
            self._i_vote[_proposer][pid][_voter_address][self.COUNT] = vote_idx
            self._b_vote[_proposer][pid][_voter_address][self.IS_VOTED] = True

            vote_cnt = self._i_vote[_voter_address][self.COUNT][self.COUNT][self.COUNT]
            vcnt = str(vote_cnt)
            self._vote[_voter_address][vcnt][self.PROPOSER][self.PROPOSER] = _proposer
            self._i_vote[_voter_address][vcnt][self.ID][self.ID] = _proposal_id
            self._i_vote[_voter_address][self.COUNT][self.COUNT][self.COUNT] = vote_cnt + 1

    @external(readonly=True)
    def get_user_votes(self, _voter_address: str) -> str:
        return_json = dict()
        return_json['votes'] = []
        for i in range(self._i_vote[_voter_address][self.COUNT][self.COUNT][self.COUNT]):
            vote_cnt = str(i)
            _proposer = self._vote[_voter_address][vote_cnt][self.PROPOSER][self.PROPOSER]
            pid = str(self._i_vote[_voter_address][vote_cnt][self.ID][self.ID])
            vid = str(self._i_vote[_proposer][pid][_voter_address][self.COUNT])
            return_json['votes'].append({
                "vote_id": vote_cnt,
                "proposer": _proposer,
                "proposal_id": pid,
                "selectItem": self._i_vote[_proposer][pid][vid][self.SELECT_ITEM],
                "voteTxHash": self._vote[_proposer][pid][vid][self.TX],
                "delegateTxID": self._vote[_proposer][pid][vid][self.DELEGATE_TX_ID],
                "delegateAmount": self._i_vote[_proposer][pid][vid][self.DELEGATE_AMOUNT],
                "subject": self._proposal[_proposer][pid][self.SUBJECT]
            })

        return json_dumps(return_json)

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

    @external(readonly=True)
    def get_vote(self, _proposer: str, _proposal_id: int, _address: str) -> str:
        pid = str(_proposal_id)
        total_vote_cnt = self._i_vote[_proposer][pid][self.COUNT][self.COUNT]

        for i in range(total_vote_cnt):
            vid = str(i+1)
            if self._vote[_proposer][pid][vid][self.VOTER] == _address:
                return json_dumps({
                    "voter": self._vote[_proposer][pid][vid][self.VOTER],
                    "selectItem": self._i_vote[_proposer][pid][vid][self.SELECT_ITEM],
                    "voteTxHash": self._vote[_proposer][pid][vid][self.TX],
                    "delegateTxID": self._vote[_proposer][pid][vid][self.DELEGATE_TX_ID],
                    "delegateAmount": self._i_vote[_proposer][pid][vid][self.DELEGATE_AMOUNT]
                })

        return json_dumps({})

    @only_owner
    @external(readonly=False)
    @catch_error
    def cancel_proposal(self, _proposer: str, _proposal_id: int):
        self._proposal[_proposer][str(_proposal_id)][self.STATUS] = VoteStatus.CANCELED

    @only_owner
    @external(readonly=False)
    @catch_error
    def remove_proposal(self, _proposer: str, _proposal_id: int):
        self._proposal[_proposer][str(_proposal_id)][self.STATUS] = VoteStatus.REMOVED

    @only_owner
    @external(readonly=False)
    @catch_error
    def finalize(self, _proposer: str, _proposal_id: int, _total_delegate: int, _final_data: str):
        pid = str(_proposal_id)
        if is_none(self._proposal[_proposer][pid][self.SUBJECT]):
            revert("No Proposal")

        expire_timestamp = self._i_proposal[_proposer][pid][self.EXPIRE_TIMESTAMP]
        if expire_timestamp > self.now():
            revert(_proposer + "'s " + str(_proposal_id) + " proposal is not expired")

        self._proposal[_proposer][pid][self.FINAL] = bytes.hex(self.tx.hash)

        votes = json_loads(_final_data)
        for aVote in votes:
            vid = str(self._i_vote[_proposer][pid][aVote['voter']][self.COUNT])
            self._vote[_proposer][pid][vid][self.DELEGATE_TX_ID] = aVote[self.DELEGATE_TX_ID]
            self._i_vote[_proposer][pid][vid][self.DELEGATE_AMOUNT] = int(aVote[self.DELEGATE_AMOUNT], 0)

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

        if _total_delegate != 0 and (
                total_voting_power / _total_delegate) * 100 < self._i_proposal[_proposer][pid][
                self.ELECTORAL_TH]:
            self._proposal[_proposer][pid][self.STATUS] = VoteStatus.REJECTED
            return

        most_voted_item = 0
        most_voted = 0
        for i in result:
            if result[i] > most_voted:
                most_voted = result[i]
                most_voted_item = i

        if total_voting_power != 0 and (
                most_voted / total_voting_power) * 100 > self._i_proposal[_proposer][pid][
                self.WINNING_TH]:
            self._i_proposal[_proposer][pid][self.WINNER] = most_voted_item
            self._proposal[_proposer][pid][self.STATUS] = VoteStatus.APPROVED
        else:
            self._proposal[_proposer][pid][self.STATUS] = VoteStatus.REJECTED

    @only_owner
    @external(readonly=False)
    @catch_error
    def set_proposal(self, _proposer: str, _subject: str, _contents: str, _electoral_th: int, _winning_th: int,
                     _expire_timestamp: int, _select_items: str, _vote_page: str):
        if is_none(self._a_verify_id[_proposer][self.ADDRESS]):
            revert("Proposer is not Verified")
        if is_none(self._preps[_proposer]):
            revert("Proposer is not PRep")

        self._i_proposal[_proposer][self.ID][self.ID] += 1

        p_id = self._i_proposal[_proposer][self.ID][self.ID]

        if _vote_page != self.TARGET_MY_VOTER:
            if not self._is_page(_vote_page):
                self._add_page(_vote_page)

        page_cnt = self._i_community_proposal[_vote_page][self.COUNT][self.COUNT] + 1
        self._i_community_proposal[_vote_page][self.COUNT][self.COUNT] = page_cnt
        self._community_proposal[_vote_page][str(page_cnt)][self.PROPOSER] = _proposer
        self._i_community_proposal[_vote_page][str(page_cnt)][self.ID] = p_id

        self._i_recent_proposal[self.COUNT] = self._i_recent_proposal[self.COUNT] + 1
        self._recent_proposal[str(self._i_recent_proposal[self.COUNT])
                              ] = json_dumps({"proposer": _proposer, "pid": p_id})

        self.logging("page:"+_vote_page+":prep:"+_proposer + ":title:"+_subject+":pid:"+str(p_id))

        pid = str(p_id)
        self._proposal[_proposer][pid][self.ADDRESS] = str(self._a_verify_id[_proposer][self.ADDRESS])
        self._proposal[_proposer][pid][self.PROPOSER] = _proposer
        self._proposal[_proposer][pid][self.SUBJECT] = _subject
        self._proposal[_proposer][pid][self.CONTENTS] = _contents
        self._i_proposal[_proposer][pid][self.ELECTORAL_TH] = _electoral_th
        self._i_proposal[_proposer][pid][self.WINNING_TH] = _winning_th
        self._proposal[_proposer][pid][self.STATUS] = VoteStatus.VOTING
        self._i_proposal[_proposer][pid][self.EXPIRE_TIMESTAMP] = _expire_timestamp
        self._proposal[_proposer][pid][self.SELECT_ITEM] = _select_items
        self._proposal[_proposer][pid][self.TYPE] = _vote_page
        self._proposal[_proposer][pid][self.TX] = bytes.hex(self.tx.hash)
        self._i_vote[_proposer][pid][self.COUNT][self.COUNT] = 0

    @external(readonly=True)
    def get_recent_proposals(self, _count: int) -> list:
        proposal_count = self._i_recent_proposal[self.COUNT]
        ret = []
        for i in range(proposal_count, proposal_count - _count if (proposal_count - _count) > 0 else 0, -1):
            a_proposal = json_loads(self._recent_proposal[str(i)])
            a_proposal[self.SUBJECT] = self._proposal[a_proposal["proposer"]][a_proposal["pid"]][self.SUBJECT]
            ret.append(a_proposal)

        return ret

    @external(readonly=True)
    def get_last_proposal_id(self, _proposer: str) -> str:
        return str(self._i_proposal[_proposer][self.ID][self.ID])

    @external(readonly=True)
    def get_proposals_status(self, _proposer: str) -> str:
        Voting = 0
        Rejected = 0
        Approved = 0
        Canceled = 0
        Removed = 0

        pid = self._i_proposal[_proposer][self.ID][self.ID]

        for i in range(1, pid+1):
            status = self._proposal[_proposer][str(i)][self.STATUS]
            if status == VoteStatus.VOTING:
                Voting += 1
            if status == VoteStatus.REJECTED:
                Rejected += 1
            if status == VoteStatus.APPROVED:
                Approved += 1
            if status == VoteStatus.CANCELED:
                Canceled += 1
            if status == VoteStatus.REMOVED:
                Removed += 1

        return json_dumps({
            VoteStatus.VOTING: str(Voting),
            VoteStatus.REJECTED: str(Rejected),
            VoteStatus.APPROVED: str(Approved),
            VoteStatus.CANCELED: str(Canceled),
            VoteStatus.REMOVED: str(Removed)
        })

    def _get_proposal(self, _proposer: str, _proposal_id: int) -> dict:
        pid = str(_proposal_id)
        return_json = dict()

        if self._i_proposal[_proposer][self.ID][self.ID] < _proposal_id:
            return return_json
        if self._proposal[_proposer][pid][self.STATUS] == VoteStatus.REMOVED:
            return return_json

        return_json[self.ID] = pid
        return_json[self.ADDRESS] = self._proposal[_proposer][pid][self.ADDRESS]
        return_json[self.PROPOSER] = self._proposal[_proposer][pid][self.PROPOSER]
        return_json[self.SUBJECT] = self._proposal[_proposer][pid][self.SUBJECT]
        return_json[self.CONTENTS] = self._proposal[_proposer][pid][self.CONTENTS]
        return_json[self.ELECTORAL_TH] = str(self._i_proposal[_proposer][pid][self.ELECTORAL_TH])
        return_json[self.WINNING_TH] = str(self._i_proposal[_proposer][pid][self.WINNING_TH])
        return_json[self.STATUS] = self._proposal[_proposer][pid][self.STATUS]
        return_json[self.EXPIRE_TIMESTAMP] = self._i_proposal[_proposer][pid][self.EXPIRE_TIMESTAMP]
        return_json[self.SELECT_ITEM] = self._proposal[_proposer][pid][self.SELECT_ITEM]
        return_json[self.TX] = self._proposal[_proposer][pid][self.TX]
        return_json[self.TYPE] = self._proposal[_proposer][pid][self.TYPE]
        return_json[self.FINAL] = self._proposal[_proposer][pid][self.FINAL]
        return_json[self.WINNER] = self._i_proposal[_proposer][pid][self.WINNER]

        return return_json

    @external(readonly=True)
    def get_proposal(self, _proposer: str, _proposal_id: int) -> str:
        return_json = self._get_proposal(_proposer, _proposal_id)
        if return_json == dict():
            return "No Proposal: " + _proposer + " " + str(_proposal_id)
        return json_dumps(return_json)

    @external(readonly=True)
    def get_proposals(self, _proposer: str, _start_proposal_id: int, _end_proposal_id: int) -> str:
        last_proposal_id = self._i_proposal[_proposer][self.ID][self.ID]

        if _end_proposal_id > last_proposal_id:
            end = last_proposal_id
        else:
            end = _end_proposal_id

        return_json = []
        for i in range(_start_proposal_id, end+1):
            json = self._get_proposal(_proposer, i)
            if json == dict():
                continue
            else:
                return_json.append(json)

        return json_dumps(return_json)
