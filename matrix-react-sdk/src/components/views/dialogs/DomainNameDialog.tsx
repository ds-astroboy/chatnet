import React, { useState, useEffect, FunctionComponent, useMemo } from "react";

import { _t } from "../../../languageHandler";
import BaseDialog from "./BaseDialog";
import AccessibleButton from "../elements/AccessibleButton";
import { PublicKey } from "@solana/web3.js";
import {
  NAME_PROGRAM_ID,
  performReverseLookup,
} from "@bonfida/spl-name-service";
import LoadingScreen from "../rooms/LoadingScreen";
import loadingLottie from "../../../../res/img/cafeteria-loading-regular.json";
import { EvmChain } from "@moralisweb3/evm-utils";
import Moralis from "moralis";
import { DOMAINNAMEPROVIDERS, ENSDOMAINCONTRACTADDRESS } from "../../../@variables/common";
import { useLocalStorageState } from "../../../hooks/useLocalStorageState";
import { ethers } from "ethers";
import { request, gql } from 'graphql-request'; 
const BigNumber = ethers.BigNumber;

interface IProps {
  onFinished(proceed: boolean, domainName?: string): void;
  wallet: any;
  domainProvider: string;
}

const DomainNameDialog: FunctionComponent<IProps> = ({ onFinished, wallet, domainProvider }) => {
  const [availableDomainNames, setAvailableDomainNames] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [provider, ] = useLocalStorageState("provider", null);

  const ethProvider = useMemo(() => { 
      return wallet?.active ? new ethers.providers.Web3Provider(wallet.library.provider) : null;
  }, [wallet?.active]);
  
  const findOwnedNameAccountsForUser = async (): Promise<PublicKey[]> => {
    const filters = [
      {
        memcmp: {
          offset: 32,
          bytes: wallet.publicKey.toBase58(),
        },
      },
    ];
    try {
      const accounts = await wallet.connection.getProgramAccounts(NAME_PROGRAM_ID, {
        filters,
      });
      return accounts.map((a) => a.pubkey);
    }
    catch (e) {
      setIsLoading(false);
      console.error(e);
      return [];
    }
  };

  const fetchEnsName = async(token) => {
    const tokenId = token.tokenId;
    const labelHash = BigNumber.from(tokenId).toHexString()

    const url = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens'
    const GET_LABEL_NAME = gql`
      query{
        domains(first:1, where:{labelhash:"${labelHash}"}){
          labelName
        }
      }`;
    const response = await request(url, GET_LABEL_NAME);
    if(response?.domains[0]) {
      return response.domains[0].labelName;
    }
    return "";
  }

  const fetchEnsDomainNames = async (address) => {
    setIsLoading(true);
    const chain = EvmChain.ETHEREUM;

    await Moralis.start({
      apiKey: 'pUgcpsAH4jAR8Jq5Fkx9pjHLTxf1MwD6gn7qQmkyRUqZD70hxyksgajX2EZJ0kP3',
    });

    try {
      let response = await Moralis.EvmApi.nft.getWalletNFTs({
        address,
        chain,
      });
      let ensTokenData = response.toJSON();
      
      console.log({ensTokenData})
      let ensDomainNames = [];
      if (ensTokenData.length) {
        for (let i = 0; i < ensTokenData.length; i ++) {
          if (ensTokenData[i].tokenAddress === ENSDOMAINCONTRACTADDRESS) {
            let name = await fetchEnsName(ensTokenData[i]);
            if(name) {
              ensDomainNames.push(`${name}.eth`);
            }
          }
        }
      }
      setAvailableDomainNames(ensDomainNames);
    }
    catch(e) {
      console.error(e);
    }
    setIsLoading(false);
  }

  const getDomainNames = async (): Promise<void> => {
    setIsLoading(true);
    const domainKeys = await findOwnedNameAccountsForUser();
    if (domainKeys.length) {
      let domainNames = [];
      for (let i = 0; i < domainKeys.length; i++) {
        try {
          const domainName = await performReverseLookup(
            wallet.connection,
            domainKeys[i]
          );
          domainNames.push(`${domainName}᎐sol`);
        } catch (e) {
          console.warn(e);
        }
      }
      setAvailableDomainNames(domainNames);
    }
    setIsLoading(false);
  };

  const DomainNameCard = ({ domainName }) => {
    return (
      <div className="mx_DomainNameDialog_DomainName_Card">
        <div className="mx_DomainNameDialog_DomainName_Card_Detail">
          <div className="mx_DomainNameDialog_DomainName_Card_Detail_img">
            {domainProvider === DOMAINNAMEPROVIDERS.Ens ?
              <img src={require("../../../../res/img/ens-domain.jpg")} />
              :
              <img src={require("../../../../res/img/bonfida.png")} />
            }
          </div>
          <div className="mx_DomainNameDialog_DomainName_Card_Detail_name">
            {domainName}
          </div>
        </div>
        <AccessibleButton
          className="mx_DomainNameDialog_DomainName_Card_button"
          onClick={() => onFinished(true, domainName)}
        >
          <div>Use</div>
        </AccessibleButton>
      </div>
    );
  };

  const renderDomainNames = () => {
    let domainBody;
    if (availableDomainNames.length) {
      domainBody = availableDomainNames.map((domainName) => {
        return <DomainNameCard domainName={domainName} key={domainName} />;
      });
    } else {
      domainBody = (domainProvider === DOMAINNAMEPROVIDERS.Ens) ?
        (
          <div className="mx_DomainNameDialog_Statement">
            No .eth domain Names found. If you'd like to purchase one please go to{" "}
            <a href="https://app.ens.domains" target="_blank">
              ENS Domain Name
            </a>
          </div>
        )
        :
        (
          <div className="mx_DomainNameDialog_Statement">
            No ᎐sol domain Names found. If you'd like to purchase one please go to{" "}
            <a href="https://naming.bonfida.org/#/auctions" target="_blank">
              Bonfida Domain Name
            </a>
          </div>
        )
        ;
    }
    return <div className="mx_DomainNameDialog_wrap">{domainBody}</div>;
  };

  const renderFooter = () => {
    return (
      <div className="mx_DomainNameDialog_footer">
        {(domainProvider === DOMAINNAMEPROVIDERS.Ens) ?
          <img src={require("../../../../res/img/ens-power.png")} />
          :
          <img src={require("../../../../res/img/bonfida-power.png")} />
        }
      </div>
    );
  };

  useEffect(() => {
    switch(domainProvider) {
      case DOMAINNAMEPROVIDERS.Bonfida:
        getDomainNames();
        break;
      case DOMAINNAMEPROVIDERS.Ens:
        fetchEnsDomainNames(wallet.account);
        break;
    }
  }, []);

  let title = (domainProvider === DOMAINNAMEPROVIDERS.Ens) ? "Select your ᎐sol domain" : "Select your .ens domain"

  return (
    <BaseDialog
      className="mx_DomainNameDialog"
      title={title}
      onFinished={onFinished}
    >
      {renderDomainNames()}
      {renderFooter()}
      {isLoading ? (
        <LoadingScreen
          label="Loading your ᎐sol domain names..."
          loadingLottie={loadingLottie}
        />
      ) : (
        false
      )}
    </BaseDialog>
  );
};
export default DomainNameDialog;
