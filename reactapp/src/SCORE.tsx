import IconService from 'icon-sdk-js';

const MAIN_NET = "https://ctz.solidwallet.io/api/v3";
const TEST_NET = "https://bicon.net.solidwallet.io/api/v3"
const LOCAL_NET = "http://localhost:9000/api/v3";
const TO_CONTRACT = "cx0c7201f0f3a5974613044cbb2d911efc852d73d9";
const provider = new IconService.HttpProvider(TEST_NET);
export const icon_service = new IconService(provider);
export const IconBuilder = IconService.IconBuilder;
// const IconConverter = IconService.IconConverter;

export async function json_rpc_call(method_name: string, params: any) {
  console.log("params", params);
  var callBuilder = new IconBuilder.CallBuilder();
  var callObj = callBuilder
    .to(TO_CONTRACT)
    .method(method_name)
    .params(params)
    .build();

  console.log(callObj);
  return await icon_service.call(callObj).execute();
}
