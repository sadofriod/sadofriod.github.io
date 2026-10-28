---
title: 'x402 Integration over HTTP and MCP: Paying for a Deterministic Judgment'
date: '2026-10-28'
excerpt: 'The wire format of the paid judgment endpoint: what the 402 challenge contains, how the EIP-3009 authorization is built and signed, what the settlement receipt looks like, and the four error paths measured against the live service.'
description: 'A step-by-step x402 v2 integration guide for a paid HTTP/MCP endpoint: PAYMENT-REQUIRED challenge fields, PAYMENT-SIGNATURE payload construction with viem, EIP-3009 nonce and validity window, PAYMENT-RESPONSE receipt, MCP payment_required shape, and the measured error codes.'
tags: ['x402', 'MCP', 'TypeScript', 'payments', 'GraphRAG']
categories: GraphRAG
keywords: 'x402 integration, x402 v2, PAYMENT-SIGNATURE, PAYMENT-REQUIRED, EIP-3009, USDC Base, MCP payments, pay per call API, x402-fetch'
lang: en
translationKey: x402-integration
---

The judgment endpoints charge per call. The transport is x402 v2, which means the entire payment
handshake happens inside HTTP headers: no API key, no account, no invoice. This post documents the
concrete wire format as served by `pay.ashesborn.cloud`, including the parts that are easy to get
wrong when writing a client.

Everything in sections 2, 3, 6 and 7 was executed against the live service on 2026-10-28. The signing
step in section 5 was not: it needs a funded wallet on Base mainnet, so that section is written from
the specification and the challenge fields, and flagged as such.

## 1. What is paid, and in what units

`GET https://pay.ashesborn.cloud/api/v1/datasets` is the authority. Three entries, two of them
judgments:

| `dataset_id` | Tool | Price | `amount` (atomic) |
| --- | --- | --- | --- |
| `retraction-propagation` | `retraction_propagation` | $0.02 | `20000` |
| `retraction-evidence-audit` | `integrity_evidence_audit` | $0.10 | `100000` |
| `web3-security` | `query_graph` | $0.02 local / $0.10 global | `20000` / `100000` |

USDC on Base has six decimals, so `20000` is 0.02 USDC. Prices are quoted in atomic units
everywhere in the protocol; a client that formats them as floats before signing produces an
authorization with the wrong `value` and gets `value_mismatch` back.

The free paper-status route (`GET /api/v1/judge/paper?doi=`) is not part of this flow. It has no
payment requirement at all.

## 2. The first request, and the challenge it returns

A request with no payment header returns `402` with an empty body. The challenge is in a header:

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

The header is base64url JSON. Decoded, our challenge is:

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
  "extensions": { "bazaar": { "…": "input/output examples and a JSON Schema" } }
}
```

Four fields decide what the client signs: `asset` is the EIP-712 `verifyingContract`, `extra.name`
and `extra.version` are the domain `name` and `version`, `network` in CAIP-2 form gives `chainId`
(`eip155:8453` is Base mainnet), and `maxTimeoutSeconds` bounds the authorization window. A client
must not hardcode any of them; read them out of `accepts[0]`.

The `bazaar` extension carries an example request and a JSON Schema for this endpoint, which is how a
client can learn the body shape without human documentation.

## 3. The request body contract

The happy path requires `dataset_id` plus exactly one identifier:

```json
{ "dataset_id": "retraction-propagation", "doi": "10.1016/S0140-6736(97)11096-0" }
{ "dataset_id": "retraction-propagation", "paper_id": "W2117847125" }
```

The endpoint rejects a body it cannot use before it asks for money, and the error names the expected
fields instead of leaving the client to guess:

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

`GET /api/v1/openapi.json` returns the full schema without authentication.

## 4. The payment payload

`PAYMENT-SIGNATURE` carries base64url JSON of the `PaymentPayload` object. For the `exact` scheme on
EVM the shape is:

```json
{
  "x402Version": 2,
  "resource": { "url": "…", "description": "…", "mimeType": "application/json" },
  "accepted": { "scheme": "exact", "network": "eip155:8453", "amount": "20000",
                "asset": "0x8335…2913", "payTo": "0x5d44…8e29",
                "maxTimeoutSeconds": 60, "extra": { "name": "USDC", "version": "2" } },
  "payload": {
    "signature": "0x…65 bytes…",
    "authorization": {
      "from": "0x…", "to": "0x5d44…8e29", "value": "20000",
      "validAfter": "1793172000", "validBefore": "1793172060",
      "nonce": "0x…32 bytes…"
    }
  }
}
```

`accepted` is echoed from the challenge; a mismatched `amount`, `asset` or `payTo` produces a
recipient or value mismatch at verification time rather than a useful error, so copy the requirement
object rather than rebuilding it.

The authorization is an EIP-3009 `TransferWithAuthorization`: a signature over the transfer terms, not
a transaction. Nothing is broadcast until the server settles, and the payer's key never leaves the
client.

## 5. Signing it

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
    chainId: 8453,                              // from network eip155:8453
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

Three details that break clients in practice:

- `value` must be a string in the payload and a `BigInt` in the typed data. Mixing them changes the
  signed hash.
- `nonce` is 32 random bytes presented as `bytes32`. Reusing one is a replay, and the ERC-20 rejects
  it at settlement, after the resource has already run.
- `validAfter` a minute in the past is fine; `validBefore` beyond `maxTimeoutSeconds` is not, because
  the server enforces the advertised window.

If you would rather not hand-roll this, `x402-fetch` and `x402-axios` (both 1.2.x on npm) wrap a
client with the same flow, taking the account as the payer.

## 6. What comes back, and the failure modes

On success the resource executes, settlement runs, and the receipt arrives in a second header:

```
HTTP/2 200
payment-response: eyJzdWNjZXNzIjp0cnVlLCJ0cmFuc2FjdGlvbiI6IjB4…
```

which decodes to `{ "success": true, "transaction": "0x…", "network": "eip155:8453", "payer": "0x…" }`.

The error paths, measured against the live endpoint:

| Case | Status | Body |
| --- | --- | --- |
| No payment header | 402 | `{}` (challenge in `PAYMENT-REQUIRED`) |
| Body missing `dataset_id` | 400 | `{"error":"invalid_request_body","expected":{…}}` |
| `dataset_id` not in the catalogue | 404 | `{"error":"Unknown judgment dataset."}` |
| `PAYMENT-SIGNATURE` not base64 | 400 | `{"error":"Payment header is not valid base64."}` |
| Payload decodes but the authorization is bad | 400 | `{"error":"Payment payload is invalid."}` |

The last row is the one to plan around. The specification defines specific reasons
(`invalid_exact_evm_payload_signature`, `insufficient_funds`,
`invalid_exact_evm_payload_authorization_valid_before`, and others) and a server is expected to
surface them in `invalidReason`. This deployment currently collapses all of them into one message, so a
client cannot tell "your clock is wrong" from "your wallet is empty" without probing. Treat a 400 on
the payment path as retryable only after checking the authorization locally.

Ordering matters for idempotency: `Idempotency-Key` is accepted (it is in the CORS allow-list), so a
retry that reuses the key does not double-charge if the first response was lost.

## 7. The same flow over MCP

The MCP server at `mcp.ashesborn.cloud/mcp` exposes three integrity tools. It answers `initialize` and
`tools/list` anonymously, so a client can connect and inspect the inventory before any payment:

| Tool | Anonymous behaviour |
| --- | --- |
| `integrity_paper_status` | 200 with the status payload |
| `retraction_propagation` | tool result with `isError: true` |
| `integrity_evidence_audit` | tool result with `isError: true` |

The paid refusal is a normal JSON-RPC result, not a transport error, so a client that treats tool
errors as "the model did something wrong" will hide it. The content is machine-readable:

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

The MCP transport does not carry the HTTP payment handshake. The tool error names the product, the price
and the `pay_endpoint`; the payment itself happens over HTTP with the flow in sections 2 to 5, and the
resulting credential (issued as a key today) is what an authenticated session presents to call the
paid tool. That handoff is not documented publicly yet, which is the practical gap for anyone wiring
an agent to this surface: a client that never pays still gets the free status tool, and that is enough
to answer "is this paper retracted" without a wallet.

## 8. What this does not cover

- **Settlement was not executed here.** I decoded the challenge, built the payload and measured every
  error path, but did not broadcast a transfer: that needs a funded Base wallet. The signed-payload
  example follows the specification's field set and this deployment's challenge values; it has not
  been run end to end.
- **One network.** Only `eip155:8453` with USDC is offered. A client must read `accepts` and skip
  entries it cannot pay rather than assuming this one.
- **No subscription.** Every call is a separate authorization. Budgets belong in the client; the
  server enforces only the per-request amount and window.
