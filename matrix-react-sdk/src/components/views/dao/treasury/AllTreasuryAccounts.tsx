import useGovernanceAssets from "../../../../hooks/useGovernanceAssets";
import { useTotalTreasuryPrice } from "../../../../hooks/useTotalTreasuryPrice";
import { GovernedTokenAccount } from "../../../../utils/vote/tokens";
import React, { useEffect, useState } from "react";
import useTreasuryAccountStore from "../../../../stores/vote/useTreasuryAccountStore";
import AccountsTabs from "../TreasuryAccount/AccountsTabs";
import AccountOverview from "../TreasuryAccount/AccountOverview";
import useWalletStore from "../../../../stores/vote/useWalletStore";
import useRealm from "../../../../hooks/useRealm";
import { CurrencyDollarIcon, PlusCircleIcon } from "@heroicons/react/outline";
import tokenService from "../../../../utils/vote/services/token";
import useStrategiesStore from "../../../../Strategies/store/useStrategiesStore";
import { getTreasuryAccountItemInfo } from "../../../../utils/vote/treasuryTools";
import AccessibleButton from "../../elements/AccessibleButton";
import Dropdown from "../../elements/Dropdown";

export const NEW_TREASURY_ROUTE = `/treasury/new`;

const AllTreasucyAccounts = () => {
  const { getStrategies } = useStrategiesStore();
  const { governedTokenAccounts } = useGovernanceAssets();
  const { setCurrentAccount } = useTreasuryAccountStore();
  const connection = useWalletStore((s) => s.connection);
  const {
    ownVoterWeight,
    symbol,
    realm,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm();
  const connected = useWalletStore((s) => s.connected);
  const governanceNfts = useTreasuryAccountStore((s) => s.governanceNfts);
  const [treasuryAccounts, setTreasuryAccounts] = useState<
    GovernedTokenAccount[]
  >([]);
  const [activeAccount, setActiveAccount] =
    useState<GovernedTokenAccount | null>(null);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const { realmInfo } = useRealm();
  useEffect(() => {
    if (
      tokenService._tokenList.length &&
      governedTokenAccounts.filter((x) => x.mint).length
    ) {
      getStrategies(connection);
    }
  }, [
    tokenService._tokenList.length,
    governedTokenAccounts.filter((x) => x.mint).length,
  ]);
  useEffect(() => {
    async function prepTreasuryAccounts() {
      if (governedTokenAccounts.every((x) => x.transferAddress)) {
        setTreasuryAccounts(governedTokenAccounts);
      }
    }
    prepTreasuryAccounts();
  }, [JSON.stringify(governedTokenAccounts)]);

  useEffect(() => {
    if (treasuryAccounts.length > 0 && treasuryAccounts[0].mint) {
      setActiveAccount(treasuryAccounts[0]);
      setCurrentAccount(treasuryAccounts[0], connection);
    }
  }, [JSON.stringify(treasuryAccounts)]);

  const { totalPriceFormatted } = useTotalTreasuryPrice();

  const handleChangeAccountTab = (acc) => {
    if (acc) {
      setActiveAccount(acc);
      setCurrentAccount(acc, connection);
    }
  };

  const goToNewAccountForm = () => {
    // router.push(fmtUrlWithCluster(`/dao/${symbol}${NEW_TREASURY_ROUTE}`))
  };

  const canCreateGovernance = realm
    ? ownVoterWeight.canCreateGovernance(realm)
    : null;
  const isConnectedWithGovernanceCreationPermission =
    connected &&
    canCreateGovernance &&
    !toManyCommunityOutstandingProposalsForUser &&
    !toManyCouncilOutstandingProposalsForUse;

  useEffect(() => {
    if (activeAccount) {
      const info = getTreasuryAccountItemInfo(activeAccount, governanceNfts);
      setAccountInfo(info);
    }
  }, [activeAccount]);

  return (
    <div className="mx_AllTreasucyAccounts">
      <div className="mx_AllTreasucyAccounts_header">
        <div className="mx_AllTreasucyAccounts_info">
            {realmInfo?.ogImage ? (
            <div className="mx_AllTreasucyAccounts_logo">
                <img src={realmInfo?.ogImage} />
            </div>
            ) : null}
            <div className="mx_AllTreasucyAccounts_title">
            {   realmInfo?.displayName}
            </div>
        </div>
        {totalPriceFormatted && (
          <div className="mx_AllTreasucyAccounts_totalValue">
            <CurrencyDollarIcon className="mx_AllTreasucyAccounts_totalValue_icon" />
            <div className="mx_AllTreasucyAccounts_totalValue_info">
                <div className="mx_AllTreasucyAccounts_totalValue_title">
                Treasury Value
                </div>
                <div className="mx_AllTreasucyAccounts_totalValue_price">
                ${totalPriceFormatted}
                </div>
            </div>
          </div>
        )}
      </div>
      <div className="mx_AllTreasucyAccounts_body">
        <div className="mx_AllTreasucyAccounts_accountsSection">
          <div className="mx_AllTreasucyAccounts_accountsSection_header">
            <div className="mx_AllTreasucyAccounts_accountsSection_title">Treasury Accounts</div>
            <AccessibleButton
              className="mx_AllTreasucyAccounts_accountsSection_button"
              disabled={!isConnectedWithGovernanceCreationPermission}
              onClick={goToNewAccountForm}
            >
              <PlusCircleIcon className="mx_AllTreasucyAccounts_accountsSection_button_icon" />
              <div className="mx_AllTreasucyAccounts_accountsSection_button_content">
                New Account
              </div>
            </AccessibleButton>
          </div>
          <div className="mx_AllTreasucyAccounts_accountsTabs">
            <AccountsTabs
              activeTab={activeAccount}
              onChange={(t) => handleChangeAccountTab(t)}
              tabs={treasuryAccounts}
            />
          </div>
        </div>
        <div className="mx_AllTreasucyAccounts_accountOverview">
          <AccountOverview />
        </div>
      </div>
    </div>
  );
};

export default AllTreasucyAccounts;
