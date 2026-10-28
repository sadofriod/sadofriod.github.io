---
title: 'x402 接入实践：在 HTTP 与 MCP 上为一次确定性判定付费'
date: '2026-10-28'
excerpt: '付费判定端点的线上格式：402 挑战里有什么、EIP-3009 授权怎么构造与签名、结算回执长什么样，以及对着线上服务实测的四条错误路径。'
description: '面向付费 HTTP/MCP 端点的 x402 v2 接入指南：PAYMENT-REQUIRED 挑战字段、用 viem 构造 PAYMENT-SIGNATURE 载荷、EIP-3009 的 nonce 与有效期、PAYMENT-RESPONSE 回执、MCP 上的 payment_required 结构，以及实测的错误码。'
tags: ['x402', 'MCP', 'TypeScript', 'payments', 'GraphRAG']
categories: GraphRAG
keywords: 'x402 接入, x402 v2, PAYMENT-SIGNATURE, PAYMENT-REQUIRED, EIP-3009, USDC Base, MCP 付费, 按次计费 API, x402-fetch'
lang: zh
translationKey: x402-integration
---

判定端点按次计费，传输层是 x402 v2，也就是说整个支付握手发生在 HTTP 头里：没有 API key、没有账号、
没有账单。这篇记录 `pay.ashesborn.cloud` 实际使用的线上格式，重点写客户端最容易做错的地方。

第 2、3、6、7 节都是在 2026-10-28 对着线上服务跑出来的。第 5 节的签名没有跑：那需要 Base 主网上一个
有余额的钱包，所以那一节是根据规范与本站挑战字段写的，文中会标出来。

## 1 付费的是什么，单位是什么

`GET https://pay.ashesborn.cloud/api/v1/datasets` 是唯一权威。三条记录，其中两条是判定：

| `dataset_id` | 工具 | 价格 | `amount`（原子单位） |
| --- | --- | --- | --- |
| `retraction-propagation` | `retraction_propagation` | $0.02 | `20000` |
| `retraction-evidence-audit` | `integrity_evidence_audit` | $0.10 | `100000` |
| `web3-security` | `query_graph` | 局部 $0.02 / 全局 $0.10 | `20000` / `100000` |

Base 上的 USDC 是 6 位小数，所以 `20000` 就是 0.02 USDC。协议里金额一律用原子单位；客户端如果在
签名前把它格式化成浮点数，授权里的 `value` 就会对不上，服务端只会返回 `value_mismatch`。

免费的论文状态路由（`GET /api/v1/judge/paper?doi=`）不属于这个流程，它根本没有支付要求。

## 2 第一次请求，以及它返回的挑战

不带支付头的请求返回 `402`，响应体为空，挑战在响应头里：

```bash
curl -sS -D - -o /dev/null \
  -X POST https://pay.ashesborn.cloud/api/v1/judge \
  -H 'Content-Type: application/json' \
  -d '{"dataset_id":"retraction-propagation","doi":"10.1016/S0140-6736(97)11096-0"}'
```

```
HTTP/2 402
payment-required: eyJ4NDAyVmVyc2lvbiI6MiwicmVzb3VyY2UiOnsidXJsIjoiaHR0cHM6Ly9wYXku…
access-control-expose-headers: PAYMENT-REQUIRED, PAYMENT-RESPONSE
```

这个头是 base64url 编码的 JSON。解码后，本站的挑战是：

```json
{
  "x402Version": 2,
  "resource": {
    "url": "https://pay.ashesborn.cloud/api/v1/judge",
    "description": "Deterministic analysis of retraction propagation through citations.",
    "mimeType": "application/json",
    "serviceName": "graphrag-ts",
    "tags": ["integrity", "retractions", "academic"]
  },
  "accepts": [
    {
      "scheme": "exact",
      "network": "eip155:8453",
      "amount": "20000",
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "payTo": "0x5d44…8e29",
      "maxTimeoutSeconds": 60,
      "extra": { "name": "USDC", "version": "2" }
    }
  ],
  "extensions": { "bazaar": { "…": "本端点的入参/出参示例与 JSON Schema" } }
}
```

四个字段决定客户端签什么：`asset` 是 EIP-712 的 `verifyingContract`，`extra.name` 与
`extra.version` 是域里的 `name` 与 `version`，`network` 是 CAIP-2 形式，`eip155:8453` 对应
`chainId` 8453（Base 主网），`maxTimeoutSeconds` 限定授权有效期。这四个值都不要写死，从
`accepts[0]` 里读。

`bazaar` 扩展里带着本端点的入参示例和 JSON Schema，客户端不用看人类文档也能知道 body 长什么样。

## 3 请求体的契约

正常路径需要 `dataset_id` 加上恰好一个标识符：

```json
{ "dataset_id": "retraction-propagation", "doi": "10.1016/S0140-6736(97)11096-0" }
{ "dataset_id": "retraction-propagation", "paper_id": "W2117847125" }
```

端点会在要钱之前先校验 body，并且把期望字段写进错误里，而不是让客户端猜：

```json
{
  "error": "invalid_request_body",
  "expected": {
    "dataset_id": "string, see GET /api/v1/datasets",
    "target": "exactly one of doi or paper_id"
  },
  "docs": "/api/v1/openapi.json"
}
```

`GET /api/v1/openapi.json` 无需认证即可取到完整 schema。

## 4 支付载荷

`PAYMENT-SIGNATURE` 里放 base64url 编码的 `PaymentPayload`。在 EVM 的 `exact` 方案下，形状是：

```json
{
  "x402Version": 2,
  "resource": { "url": "…", "description": "…", "mimeType": "application/json" },
  "accepted": { "scheme": "exact", "network": "eip155:8453", "amount": "20000",
                "asset": "0x8335…2913", "payTo": "0x5d44…8e29",
                "maxTimeoutSeconds": 60, "extra": { "name": "USDC", "version": "2" } },
  "payload": {
    "signature": "0x…65 字节…",
    "authorization": {
      "from": "0x…", "to": "0x5d44…8e29", "value": "20000",
      "validAfter": "1793172000", "validBefore": "1793172060",
      "nonce": "0x…32 字节…"
    }
  }
}
```

`accepted` 是从挑战里原样回传的。自己重建这个对象、导致 `amount`/`asset`/`payTo` 对不上，验证时就只会
拿到一个收款方或金额不匹配，而不会得到有用的错误信息，所以复制挑战里的那份 requirement 对象。

授权是 EIP-3009 的 `TransferWithAuthorization`：签的是转账条款，不是交易。在服务端结算之前，链上什么
都不会发生，付款方的私钥也一直留在客户端。

## 5 怎么签名

```ts
import { toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const challenge = JSON.parse(Buffer.from(paymentRequiredHeader, 'base64url').toString());
const req = challenge.accepts[0];

const now = Math.floor(Date.now() / 1000);
const authorization = {
  from: account.address,
  to: req.payTo,
  value: req.amount,
  validAfter: String(now - 60),
  validBefore: String(now + req.maxTimeoutSeconds),
  nonce: toHex(crypto.getRandomValues(new Uint8Array(32))),
};

const signature = await account.signTypedData({
  domain: {
    name: req.extra.name,                       // "USDC"
    version: req.extra.version,                 // "2"
    chainId: 8453,                              // 来自 network eip155:8453
    verifyingContract: req.asset as `0x${string}`,
  },
  types: {
    TransferWithAuthorization: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
  },
  primaryType: 'TransferWithAuthorization',
  message: {
    ...authorization,
    value: BigInt(req.amount),
    validAfter: BigInt(authorization.validAfter),
    validBefore: BigInt(authorization.validBefore),
  },
});

const payment = {
  x402Version: 2,
  resource: challenge.resource,
  accepted: req,
  payload: { signature, authorization },
};
const header = Buffer.from(JSON.stringify(payment)).toString('base64url');
```

实践中三个容易踩的点：

- `value` 在载荷里是字符串，在 typed data 里必须是 `BigInt`。混着用会改变被签的哈希。
- `nonce` 是 32 字节随机数，按 `bytes32` 传。复用 nonce 就是重放，ERC-20 会在结算时拒绝，而那时资源
  已经执行完了。
- `validAfter` 往前放一分钟没有问题；`validBefore` 超过 `maxTimeoutSeconds` 不行，服务端会按挑战里
  声明的时间窗校验。

不想手写的话，`x402-fetch` 与 `x402-axios`（npm 上都是 1.2.x）把同一套流程包成了客户端，把账号作为
付款方传进去即可。

## 6 返回什么，以及错误路径

成功时资源先执行、再结算，回执放在第二个头里：

```
HTTP/2 200
payment-response: eyJzdWNjZXNzIjp0cnVlLCJ0cmFuc2FjdGlvbiI6IjB4…
```

解码是 `{ "success": true, "transaction": "0x…", "network": "eip155:8453", "payer": "0x…" }`。

对着线上端点实测的错误路径：

| 情况 | 状态 | 响应体 |
| --- | --- | --- |
| 没有支付头 | 402 | `{}`（挑战在 `PAYMENT-REQUIRED` 里） |
| body 缺 `dataset_id` | 400 | `{"error":"invalid_request_body","expected":{…}}` |
| `dataset_id` 不在目录里 | 404 | `{"error":"Unknown judgment dataset."}` |
| `PAYMENT-SIGNATURE` 不是 base64 | 400 | `{"error":"Payment header is not valid base64."}` |
| 载荷能解码但授权不合法 | 400 | `{"error":"Payment payload is invalid."}` |

最后一行是规划时要考虑的那个。规范定义了具体原因（`invalid_exact_evm_payload_signature`、
`insufficient_funds`、`invalid_exact_evm_payload_authorization_valid_before` 等），并期望服务端在
`invalidReason` 里给出。本站目前把它们合并成一条消息，所以客户端无法区分"你的时钟不对"和"你的钱包没
钱"。在支付路径上遇到 400，应先在本地复核授权，再决定是否重试。

幂等的顺序问题：`Idempotency-Key` 是被接受的（它在 CORS 允许头列表里），所以同一次重试复用同一个 key
时，即使第一次响应丢了也不会重复扣费。

## 7 MCP 上的同一套流程

`mcp.ashesborn.cloud/mcp` 上有三个诚信工具。它对 `initialize` 与 `tools/list` 匿名开放，客户端可以先
连上、看清单，再决定是否付钱：

| 工具 | 匿名行为 |
| --- | --- |
| `integrity_paper_status` | 200，返回状态载荷 |
| `retraction_propagation` | 工具结果，`isError: true` |
| `integrity_evidence_audit` | 工具结果，`isError: true` |

付费拒绝是一条正常的 JSON-RPC 结果，不是传输层错误。把工具错误当成"模型做错了什么"的客户端会把它藏
起来。内容是可机读的：

```json
{
  "error": "payment_required",
  "product": "retraction-propagation",
  "price": { "usd": "$0.02", "atomic": "20000" },
  "scheme": "x402",
  "network": "base",
  "pay_endpoint": "https://pay.ashesborn.cloud/api/v1/judge",
  "docs": "https://blog.ashesborn.cloud/datasets"
}
```

MCP 传输层不承载 HTTP 的支付握手。工具错误里给出了产品、价格与 `pay_endpoint`，支付本身走第 2 到第 5
节的 HTTP 流程，换回来的凭证（目前以 key 的形式发放）由已认证会话带去调用付费工具。这个交接目前没有
公开文档，这是把 Agent 接到这个表面上时实际会卡住的地方：不付费的客户端仍然能拿到免费的状态工具，也
就足以回答"这篇论文撤了吗"，不需要钱包。

## 8 这篇没覆盖什么

- **结算没有在这里执行。** 我解码了挑战、构造了载荷、跑了每一条错误路径，但没有广播转账：那需要
  Base 上一个有余额的钱包。第 5 节的签名示例是按照规范的字段集与本站挑战值写的，没有端到端跑通。
- **只有一个网络。** 目前只提供 `eip155:8453` 上的 USDC。客户端应当遍历 `accepts`、跳过付不了的那
  条，而不是假定只有一条。
- **没有订阅。** 每次调用都是一次独立授权。预算属于客户端，服务端只约束单次金额与时间窗。
