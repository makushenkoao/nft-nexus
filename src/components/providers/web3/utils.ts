import { MetaMaskInpageProvider } from '@metamask/providers';
import { Contract, ethers, providers } from 'ethers';

import { setupHooks, Web3Hooks } from '@/components/hooks/web3/setupHooks';
import { Web3Dependencies } from '@/types/hooks';

declare global {
    interface Window {
        ethereum: MetaMaskInpageProvider;
    }
}

export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

export type Web3State = {
    loading: boolean;
    hooks: Web3Hooks;
} & Nullable<Web3Dependencies>;

export const createDefaultState = () => {
    return {
        ethereum: null,
        provider: null,
        contract: null,
        loading: true,
        hooks: setupHooks({} as any),
    };
};

export const createWeb3State = (
    args: Web3Dependencies & { loading: boolean },
) => {
    const { loading, provider, contract, ethereum } = args;

    const hooks = setupHooks({ ethereum, provider, contract });

    return {
        ethereum,
        provider,
        contract,
        loading,
        hooks,
    };
};

const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID;

export const loadContact = async (
    name: string,
    provider: providers.Web3Provider,
): Promise<Contract> => {
    if (!NETWORK_ID) {
        return Promise.reject('Network ID is not defined!');
    }

    const res = await fetch(`/contracts/${name}.json`);
    const Artifact = await res.json();

    if (Artifact.networks[NETWORK_ID].address) {
        return new ethers.Contract(
            Artifact.networks[NETWORK_ID].address,
            Artifact.abi,
            provider,
        );
    }

    return Promise.reject(`Contract [${name}] cannot be loaded!`);
};
