from iconsdk.icon_service import IconService
from iconsdk.providers.http_provider import HTTPProvider
from iconsdk.builder.transaction_builder import CallTransactionBuilder
from iconsdk.builder.call_builder import CallBuilder
from iconsdk.signed_transaction import SignedTransaction
from iconsdk.wallet.wallet import KeyWallet

icon_service = IconService(HTTPProvider("http://localhost:9000", 3))
call = CallBuilder()\
  .to("cx0000000000000000000000000000000000000000")\
  .method("getPRep")\
  .params({"address": "hxe7af5fcfd8dfc67530a01a0e403882687528dfcb"})\
  .build()

print("b", call)
result = icon_service.call(call)
print("result", result)
