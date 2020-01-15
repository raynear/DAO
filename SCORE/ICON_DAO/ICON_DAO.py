from iconservice import *

TAG = 'ICON_DAO'


class ICON_DAO(IconScoreBase):
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
    WINNER = "winner"
    STATUS = "status"
    TX = "transaction"
    FINAL = "final"

    DELEGATETXID = "final_delegate_txid"
    DELEGATEAMOUNT = "final_delegate_amount"

    _OWNER = "owner"
    _READYTOOWNER = "ready_to_owner"

    _VERIFY_ID = "verify_id"
    _PROPOSAL = "proposal"

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)

        self._averify_id = DictDB(
            self._VERIFY_ID, db, value_type=Address, depth=2)
        self._verify_id = DictDB(self._VERIFY_ID, db, value_type=str, depth=2)

        self._owner = VarDB(self._OWNER, db, value_type=Address)
        self._ready_to_owner = VarDB(
            self._READYTOOWNER, db, value_type=Address)

        self._proposal = DictDB(self._PROPOSAL, db, value_type=str, depth=3)
        self._iproposal = DictDB(self._PROPOSAL, db, value_type=int, depth=3)

        self._vote = DictDB(self.VOTE, db, value_type=str, depth=4)
        self._ivote = DictDB(self.VOTE, db, value_type=int, depth=4)

        self._log = VarDB("log", db, value_type=str)

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

    @external(readonly=True)
    def GetVerifyInfoByAddress(self, _Address: Address) -> str:
        return_json = dict()
        return_json[self.ADDRESS] = str(_Address)
        return_json[self.ID] = self._verify_id[str(_Address)][self.ID]
        return_json[self.BLOCKHASH] = self._verify_id[str(
            _Address)][self.BLOCKHASH]

        return json_dumps(return_json)

    @external(readonly=True)
    def GetVerifyInfoByID(self, _ID: str) -> str:
        AddressByID = self._averify_id[_ID][self.ADDRESS]
        if _ID == self._verify_id[str(AddressByID)][self.ID]:
            return_json = dict()
            return_json[self.ADDRESS] = str(AddressByID)
            return_json[self.ID] = self._verify_id[str(AddressByID)][self.ID]
            return_json[self.BLOCKHASH] = self._verify_id[str(
                AddressByID)][self.BLOCKHASH]

            return json_dumps(return_json)
        else:
            return None

    @external(readonly=False)
    def Vote(self, _Proposer: str, _ProposalID: int, _UserID: str, _VoteItem: int):
        if self._owner.get() == self.msg.sender:
            pid = str(_ProposalID)
            voter_address = str(self._averify_id[_UserID][self.ADDRESS])
            if voter_address != None:
                UserVoteIdx = self._ivote[_Proposer][pid][voter_address][self.COUNT]
                if self._vote[_Proposer][pid][str(UserVoteIdx)][self.VOTER] != "":
                    self._vote[_Proposer][pid][vid][self.TX] = bytes.hex(
                        self.tx.hash)
                    self._ivote[_Proposer][pid][str(
                        UserVoteIdx)][self.SELECTITEM] = _VoteItem
                else:
                    vote_idx = self._ivote[_Proposer][pid][self.COUNT][self.COUNT] + 1
                    vid = str(vote_idx)
                    self._vote[_Proposer][pid][vid][self.VOTER] = voter_address
                    self._ivote[_Proposer][pid][vid][self.SELECTITEM] = _VoteItem
                    self._vote[_Proposer][pid][vid][self.TX] = bytes.hex(
                        self.tx.hash)
                    self._ivote[_Proposer][pid][self.COUNT][self.COUNT] = vote_idx
                    self._ivote[_Proposer][pid][voter_address][self.COUNT] = vote_idx

    @external(readonly=True)
    def GetVotes(self, _Proposer: str, _ProposalID: int) -> str:
        pid = str(_ProposalID)
        total_vote_cnt = self._ivote[_Proposer][pid][self.COUNT][self.COUNT]

        return_json = dict()
        return_json['vote'] = []
        for i in range(total_vote_cnt):
            vid = str(i+1)
            return_json['vote'].append({
                "voter": self._vote[_Proposer][pid][vid][self.VOTER],
                "selectItem": self._ivote[_Proposer][pid][vid][self.SELECTITEM],
                "voteTxHash": self._vote[_Proposer][pid][vid][self.TX],
                "delegateTxID": self._vote[_Proposer][pid][vid][self.DELEGATETXID],
                "delegateAmount": self._ivote[_Proposer][pid][vid][self.DELEGATEAMOUNT]
            })

        return json_dumps(return_json)

    @external(readonly=False)
    def Finalize(self, _Proposer: str, _ProposalID: int, _TotalDelegate: int, _FinalData: str):
        if self._owner.get() == self.msg.sender:
            votes = json_loads(_FinalData)

            self._log.set(self._log.get()+"|start|"+_FinalData)
            pid = str(_ProposalID)
            for aVote in votes:
                vid = str(self._ivote[_Proposer][pid]
                          [aVote['voter']][self.COUNT])
                self._vote[_Proposer][pid][vid][self.DELEGATETXID] = aVote['DelegateTxID']
                self._ivote[_Proposer][pid][vid][self.DELEGATEAMOUNT] = int(
                    aVote['DelegateAmount'], 0)
            self._log.set(self._log.get()+"|1!|\r\n")

            # amount를 각 select_item 별로 저장
            total_voting_power = 0
            result = dict()
            vote_cnt = self._ivote[_Proposer][pid][self.COUNT][self.COUNT]
            for i in range(vote_cnt):
                vid = str(i+1)
                select_item = self._ivote[_Proposer][pid][vid][self.SELECTITEM]
                amount = self._ivote[_Proposer][pid][vid][self.DELEGATEAMOUNT]
                self._log.set(self._log.get()+"|1-1!|" +
                              str(select_item)+"|"+str(amount)+"\r\n")
                total_voting_power = total_voting_power + amount
                if select_item in result:
                    result[select_item] = result[select_item] + amount
                else:
                    result[select_item] = amount
            self._log.set(self._log.get()+"|2!|"+str(vote_cnt)+"|"+str(total_voting_power) + "|" +
                          json_dumps(result)+"\r\n")

            # 최종 결과에서 electoral threshold 를 넘었는지 확인
            if (total_voting_power/_TotalDelegate)*100 < self._iproposal[_Proposer][pid][self.ELECTORALTH]:
                self._proposal[_Proposer][pid][self.STATUS] = "Electoral Rejected"
                return

            self._log.set(self._log.get()+"|3!|"+str(_TotalDelegate) +
                          "|3-1|"+str(total_voting_power)+"\r\n")
            # 가장 많이 투표받은 것 찾기
            most_voted_item = 0
            most_voted = 0
            for i in result:
                if result[i] > most_voted:
                    most_voted = result[i]
                    most_voted_item = i
            self._log.set(self._log.get()+"|4!|"+str(most_voted_item)+"\r\n")

            self._proposal[_Proposer][pid][self.FINAL] = bytes.hex(
                self.tx.hash)

            # 최종 결과에서 winning threshold 를 넘은 아이템이 있는지 확인
            if (most_voted/total_voting_power)*100 > self._iproposal[_Proposer][pid][self.WINNINGTH]:
                self._log.set(self._log.get()+"|5-1!|"+"\r\n")
                # winning th 넘음.
                self._iproposal[_Proposer][pid][self.WINNER] = most_voted_item
                # 결과에 따라 no result, result 결과 proposal에 저장.
                self._proposal[_Proposer][pid][self.STATUS] = "Approved"
            else:
                self._log.set(self._log.get()+"|5-2!|"+"\r\n")
                # 결과에 따라 no result, result 결과 proposal에 저장.
                self._proposal[_Proposer][pid][self.STATUS] = "Winning Rejected"

    @external(readonly=True)
    def Log(self) -> str:
        return self._log.get()

    @external(readonly=False)
    def SetProposal(self, _Proposer: str, _Subject: str, _Contents: str, _ElectoralTH: int, _WinningTH: int, _ExpireDate: str, _SelectItems: str):
        if self._owner.get() == self.msg.sender:
            if self._averify_id[_Proposer][self.ADDRESS] == None:
                revert()
            if self._iproposal[_Proposer][self.ID][self.ID] > 0:
                p_id = self._iproposal[_Proposer][self.ID][self.ID] + 1
            else:
                p_id = 1
            pid = str(p_id)
            self._iproposal[_Proposer][self.ID][self.ID] = p_id
            self._proposal[_Proposer][pid][self.ADDRESS] = str(
                self._averify_id[_Proposer][self.ADDRESS])
            self._proposal[_Proposer][pid][self.SUBJECT] = _Subject
            self._proposal[_Proposer][pid][self.CONTENTS] = _Contents
            self._iproposal[_Proposer][pid][self.ELECTORALTH] = _ElectoralTH
            self._iproposal[_Proposer][pid][self.WINNINGTH] = _WinningTH
            self._proposal[_Proposer][pid][self.STATUS] = "Voting"
            self._proposal[_Proposer][pid][self.EXPIREDATE] = _ExpireDate
            self._proposal[_Proposer][pid][self.SELECTITEM] = _SelectItems
            self._proposal[_Proposer][pid][self.TX] = bytes.hex(self.tx.hash)
            self._ivote[_Proposer][pid][self.COUNT][self.COUNT] = 0

    @external(readonly=True)
    def GetLastProposalID(self, _Proposer: str) -> str:
        return str(self._iproposal[_Proposer][self.ID][self.ID])

    @external(readonly=True)
    def GetProposal(self, _Proposer: str, _ProposalID: int) -> str:
        if self._iproposal[_Proposer][self.ID][self.ID] < _ProposalID:
            return
        pid = str(_ProposalID)
        return_json = dict()
        return_json[self.ID] = pid
        return_json[self.ADDRESS] = self._proposal[_Proposer][pid][self.ADDRESS]
        return_json[self.SUBJECT] = self._proposal[_Proposer][pid][self.SUBJECT]
        return_json[self.CONTENTS] = self._proposal[_Proposer][pid][self.CONTENTS]
        return_json[self.ELECTORALTH] = str(
            self._iproposal[_Proposer][pid][self.ELECTORALTH])
        return_json[self.WINNINGTH] = str(
            self._iproposal[_Proposer][pid][self.WINNINGTH])
        return_json[self.STATUS] = self._proposal[_Proposer][pid][self.STATUS]
        return_json[self.EXPIREDATE] = self._proposal[_Proposer][pid][self.EXPIREDATE]
        return_json[self.SELECTITEM] = self._proposal[_Proposer][pid][self.SELECTITEM]
        return_json[self.TX] = self._proposal[_Proposer][pid][self.TX]
        return_json[self.FINAL] = self._proposal[_Proposer][pid][self.FINAL]
        return_json[self.WINNER] = self._proposal[_Proposer][pid][self.WINNER]

        return json_dumps(return_json)

    @external(readonly=True)
    def GetProposals(self, _Proposer: str, _StartProposalID: int, _EndProposalID: int) -> str:
        End = -1
        lastProposalID = self._iproposal[_Proposer][self.ID][self.ID]
        if lastProposalID == 0 or lastProposalID < _StartProposalID:
            return
        if lastProposalID+1 < _EndProposalID:
            End = lastProposalID+1
        else:
            End = _EndProposalID

        return_json = []
        for i in range(_StartProposalID, End):
            pid = str(i)
            json = dict()
            json[self.ID] = pid
            json[self.SUBJECT] = self._proposal[_Proposer][pid][self.SUBJECT]
            json[self.CONTENTS] = self._proposal[_Proposer][pid][self.CONTENTS]
            json[self.ELECTORALTH] = str(
                self._iproposal[_Proposer][pid][self.ELECTORALTH])
            json[self.WINNINGTH] = str(
                self._iproposal[_Proposer][pid][self.WINNINGTH])
            json[self.STATUS] = self._proposal[_Proposer][pid][self.STATUS]
            json[self.EXPIREDATE] = self._proposal[_Proposer][pid][self.EXPIREDATE]
            json[self.SELECTITEM] = self._proposal[_Proposer][pid][self.SELECTITEM]
            json[self.TX] = self._proposal[_Proposer][pid][self.TX]
            json[self.FINAL] = self._proposal[_Proposer][pid][self.FINAL]
            json[self.WINNER] = self._proposal[_Proposer][pid][self.WINNER]

            return_json.append(json)

        return json_dumps(return_json)
