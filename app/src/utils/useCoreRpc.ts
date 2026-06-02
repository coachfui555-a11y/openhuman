import { useCallback } from 'react';
import { CORE_RPC_URL } from './config';

type RpcRequest = { jsonrpc: '2.0'; id: number | string; method: string; params?: any };
let rpcId = 1;

export function useCoreRpc() {
  const call = useCallback(async (method: string, params?: any) => {
    const payload: RpcRequest = { jsonrpc: '2.0', id: rpcId++, method, params };
    const res = await fetch(CORE_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error.message || 'RPC error');
    return json.result;
  }, []);
  return { call };
}
