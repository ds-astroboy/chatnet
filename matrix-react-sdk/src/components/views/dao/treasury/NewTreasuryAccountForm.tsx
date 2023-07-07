import BaseGovernanceForm, {
  BaseGovernanceFormFields,
} from "../AssetsList/BaseGovernanceForm";
import useRealm from "../../../../hooks/useRealm";
import { PROGRAM_VERSION_V1, RpcContext } from "@solana/spl-governance";
import { MintInfo } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { tryParseKey } from "../../../../tools/validators/pubkey";
import { debounce } from "../../../../utils/vote/debounce";
import { isFormValid } from "../../../../utils/vote/formValidation";
import { getGovernanceConfig } from "../../../../utils/vote/GovernanceTools";
import { notify } from "../../../../utils/vote/notifications";
import tokenService from "../../../../utils/vote/services/token";
import { TokenProgramAccount, tryGetMint } from "../../../../utils/vote/tokens";
import { createTreasuryAccount } from "../../../../actions/createTreasuryAccount";
import React, { useEffect, useState } from "react";
import useWalletStore from "../../../../stores/vote/useWalletStore";
import * as yup from "yup";
import {
  DEFAULT_NATIVE_SOL_MINT,
  DEFAULT_NFT_TREASURY_MINT,
} from "../instructions/tools";
import { MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY } from "../../../../tools/constants";
import { getProgramVersionForRealm } from "../../../../apis/registry/api";
import { TokenInfo } from "@solana/spl-token-registry";
import useVotePluginsClientStore from "../../../../stores/vote/useVotePluginsClientStore";
import { getMintDecimalAmount } from "../../../../tools/sdk/units";
import Field from "../../elements/Field";
import Dropdown from "../../elements/Dropdown";
import AccessibleButton from "../../elements/AccessibleButton";
import AccessibleTooltipButton from "../../elements/AccessibleTooltipButton";
import Spinner from "../../elements/Spinner";

interface NewTreasuryAccountForm extends BaseGovernanceFormFields {
  mintAddress: string;
}
const defaultFormValues = {
  mintAddress: "",
  minCommunityTokensToCreateProposal: MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY,
  minInstructionHoldUpTime: 0,
  maxVotingTime: 3,
  voteThreshold: 60,
};

const SOL = "SOL";
const OTHER = "OTHER";
const NFT = "NFT";

const NewTreasuryAccountForm = () => {
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  );
  const isCurrentVersionHigherThenV1 = () => {
    return (
      realmInfo?.programVersion && realmInfo.programVersion > PROGRAM_VERSION_V1
    );
  };
  const {
    realmInfo,
    realm,
    mint: realmMint,
    symbol,
    ownVoterWeight,
  } = useRealm();

  const types = [
    {
      name: "SOL Account",
      value: SOL,
      defaultMint: DEFAULT_NATIVE_SOL_MINT,
      hide: !isCurrentVersionHigherThenV1(),
    },
    { name: "NFT Account", value: NFT, defaultMint: DEFAULT_NFT_TREASURY_MINT },
    { name: "Token Account", value: OTHER, defaultMint: "" },
  ];
  const wallet = useWalletStore((s) => s.current);
  const connection = useWalletStore((s) => s.connection);
  const connected = useWalletStore((s) => s.connected);
  const { fetchRealm } = useWalletStore((s) => s.actions);
  const [form, setForm] = useState<NewTreasuryAccountForm>({
    ...defaultFormValues,
  });
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | undefined>(undefined);
  const [mint, setMint] = useState<TokenProgramAccount<MintInfo> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [treasuryType, setTreasuryType] = useState(types[2]);
  const tokenOwnerRecord =
    ownVoterWeight.canCreateGovernanceUsingCouncilTokens()
      ? ownVoterWeight.councilTokenRecord
      : realm && ownVoterWeight.canCreateGovernanceUsingCommunityTokens(realm)
      ? ownVoterWeight.communityTokenRecord
      : undefined;

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({});
    setForm({ ...form, [propertyName]: value });
  };
  const handleCreate = async () => {
    try {
      if (!realm) {
        throw "No realm selected";
      }
      if (!connected) {
        throw "Please connect your wallet";
      }
      if (!tokenOwnerRecord) {
        throw "You don't have enough governance power to create a new treasury account";
      }
      const { isValid, validationErrors } = await isFormValid(schema, form);
      setFormErrors(validationErrors);
      if (isValid && realmMint) {
        setIsLoading(true);

        const rpcContext = new RpcContext(
          new PublicKey(realm.owner.toString()),
          getProgramVersionForRealm(realmInfo!),
          wallet!,
          connection.current,
          connection.endpoint
        );

        const governanceConfigValues = {
          minTokensToCreateProposal: form.minCommunityTokensToCreateProposal,
          minInstructionHoldUpTime: form.minInstructionHoldUpTime,
          maxVotingTime: form.maxVotingTime,
          voteThresholdPercentage: form.voteThreshold,
          mintDecimals: realmMint.decimals,
        };

        const governanceConfig = getGovernanceConfig(governanceConfigValues);

        await createTreasuryAccount(
          rpcContext,
          realm,
          new PublicKey(form.mintAddress),
          governanceConfig,
          tokenOwnerRecord!.pubkey,
          client
        );
        setIsLoading(false);
        fetchRealm(realmInfo!.programId, realmInfo!.realmId);
        // router.push(fmtUrlWithCluster(`/dao/${symbol}/`));
      }
    } catch (e) {
      console.error("Create Treasury", e);
      //TODO how do we present errors maybe something more generic ?
      notify({
        type: "error",
        message: `Can't create governance`,
        description: `Transaction error ${e}`,
      });
      setIsLoading(false);
    }
  };
  const handleSetDefaultMintError = () => {
    const mintError = { mintAddress: "Invalid mint address" };
    setFormErrors(mintError);
    setMint(null);
    setTokenInfo(undefined);
  };

  const schema = yup.object().shape({
    mintAddress: yup
      .string()
      .test(
        "mintAddressTest",
        "Mint address validation error",
        async function (val: string) {
          if (val) {
            try {
              const pubKey = tryParseKey(val);
              if (!pubKey) {
                return this.createError({
                  message: `Invalid mint address`,
                });
              }

              const accountData = await connection.current.getAccountInfo(
                pubKey
              );
              if (!accountData) {
                return this.createError({
                  message: `Account not found`,
                });
              }
              const mint = tryGetMint(connection.current, pubKey);
              if (!mint) {
                return this.createError({
                  message: `Account is not a valid mint`,
                });
              }
              return true;
            } catch (e) {
              return this.createError({
                message: `Invalid mint address`,
              });
            }
          } else {
            return this.createError({
              message: `Mint address is required`,
            });
          }
        }
      ),
  });
  useEffect(() => {
    if (form.mintAddress) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.mintAddress);
        if (pubKey) {
          const mintAccount = await tryGetMint(connection.current, pubKey);
          if (mintAccount) {
            setMint(mintAccount);
            const info = tokenService.getTokenInfo(form.mintAddress);
            setTokenInfo(info);
          } else {
            handleSetDefaultMintError();
          }
        } else {
          handleSetDefaultMintError();
        }
      });
    } else {
      setMint(null);
      setTokenInfo(undefined);
    }
  }, [form.mintAddress]);

  useEffect(() => {
    handleSetForm({
      value: treasuryType.defaultMint,
      propertyName: "mintAddress",
    });
  }, [treasuryType]);
  useEffect(() => {
    setForm({
      ...form,
      minCommunityTokensToCreateProposal: realmMint?.supply.isZero()
        ? MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY
        : realmMint
        ? getMintDecimalAmount(realmMint!, realmMint!.supply).toNumber() * 0.01
        : 0,
    });
  }, [JSON.stringify(realmMint)]);
  let Button: React.ComponentType<
    React.ComponentProps<typeof AccessibleButton>
  > = AccessibleButton;
  if (!connected) {
    Button = AccessibleTooltipButton;
  }
  return (
    <div className="mx_NewTreasuryAccountFrom">
      <Dropdown
        className="mx_NewTreasuryAccountFrom_dropdown"
        label={"Type"}
        onOptionChange={(value) => {
          let selectedType = types.find(type => type.value === value);
          setTreasuryType(selectedType);
        }}
        placeholder="Please select..."
        value={treasuryType.value}
      >
        {types
          .filter((x) => !x.hide)
          .map((x) => {
            return <div key={x.value}>{x.name}</div>;
          })}
      </Dropdown>
      {treasuryType.value === OTHER && (
        <>
          <Field
            className="mx_NewTreasuryAccountFrom_Field"
            label="Mint address"
            value={form.mintAddress}
            type="text"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: "mintAddress",
              })
            }
          />
          {tokenInfo ? (
            <div className="mx_NewTreasuryAccountFrom_tokenInfo">
              {tokenInfo?.logoURI && (
                <img
                  className="mx_NewTreasuryAccountFrom_tokenInfo_logo"
                  src={tokenInfo.logoURI}
                />
              )}
              <div className="mx_NewTreasuryAccountFrom_tokenInfo_name">
                {tokenInfo.name}
                <div className="mx_NewTreasuryAccountFrom_tokenInfo_symbol">
                  {tokenInfo?.symbol}
                </div>
              </div>
            </div>
          ) : mint ? (
            <div className="mx_NewTreasuryAccountFrom_tokenInfo">
              Mint found
            </div>
          ) : null}
        </>
      )}
      <BaseGovernanceForm
        formErrors={formErrors}
        form={form}
        setForm={setForm}
        setFormErrors={setFormErrors}
      ></BaseGovernanceForm>
      <div className="mx_NewTreasuryAccountFrom_buttonGroup">
        <Button
          className="mx_NewTreasuryAccountFrom_button"
          title={!connected ? "Please connect your wallet" : ""}
          disabled={!connected || isLoading}
          onClick={handleCreate}
        >
          {isLoading ? <Spinner /> : "Create"}
        </Button>
      </div>
    </div>
  );
};

export default NewTreasuryAccountForm;
