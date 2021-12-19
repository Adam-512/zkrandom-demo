import { BigNumber } from "ethers";
export function withDecimal(val, decimal) {
  return BigNumber.from(val).mul(10 ** decimal)
}

export function removeDecimal(val, decimal) {
  return BigNumber.from(val).div(10 ** decimal)
}
