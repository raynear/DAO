from iconservice import *

TAG = 'MulJomDaO'


class MulJomDaO(IconScoreBase):
    # address => id
    # id => address
    # address => verify txid
    # proposal
    # selectitem
    # vote
    # selectitem => vote
    # vote => selectitem
    # proposal => selectitem
    BLOCKHEIGHT = "blockheight"
    BLOCKHASH = "blockhash"
    ID = "ID"
    CONFIRMED = "confirmed"

    SUBJECT = "subject"
    CONTENTS = "contents"

    _OWNER = "owner"
    _READYTOOWNER = "ready_to_owner"

    _VERIFY_ID = "verify_id"

    _PROPOSAL = "proposal"

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)
        self._verify_id = DictDB(self._VERIFY_ID, db, value_type=str, depth=2)
        self._owner = VarDB(self._OWNER, db, value_type=Address)
        self._readytoowner = VarDB(self._READYTOOWNER, db, value_type=Address)
        self._proposal = DictDB(self._PROPOSAL, db, value_type=str, depth=2)

    def on_install(self) -> None:
        super().on_install()
        self._owner = owner

    def on_update(self) -> None:
        super().on_update()

    @external(readonly=False)
    def TransferOwnership(self, _NewOwnerAddress: Address):
        if self._owner == self.msg.sender:
            self._readytoowner = _NewOwnerAddress

    @external(readonly=False)
    def AcceptOwnership(self):
        if self._readytoowner == self.msg.sender:
            self._owner.set(self._readytoowner)
#            self._readytoowner = 0x0

    @external(readonly=False)
    def Verify(self, _blockHeight: int, _blockHash: str, _id: str):
        if block_height > _blockHeight+30:
            revert("verifying time over")
        self._verify_id[self.msg.sender][ID] = _id
        self._verify_id[self.msg.sender][BLOCKHEIGHT] = _blockHeight
        self._verify_id[self.msg.sender][BLOCKHASH] = _blockHash
        self._verify_id[self.msg.sender][CONFIRMED] = False

    @external(readonly=False)
    def ConfirmVerify(self, _targetAddress: Address):
        if owner == self.msg.sender:
            self._verify_id[_targetAddress][CONFIRMED] = True

    @external(readonly=False)
    def SetProposal(self, _Subject: string, _Contents: string):
        self.

    @external(readonly=True)
    def hello(self) -> str:
        Logger.debug(f'Hello, world!', TAG)
        return "Hello"
