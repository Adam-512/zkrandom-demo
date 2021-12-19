export * from "./decimal";

export function handlerReceipt(receipt) {
  console.log("source receipt", receipt);
  return receipt.events.slice(-1)[0].args;
}
