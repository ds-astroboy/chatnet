import { getAccountName } from "../instructions/tools";
import useRealm from "../../../../hooks/useRealm";
import { AccountInfo } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import {
  //   getMintDecimalAmountFromNatural,
  getMintMinAmountAsDecimal,
  getMintNaturalAmountFromDecimalAsBN,
} from "../../../../tools/sdk/units";
import { tryParseKey } from "../../../../tools/validators/pubkey";
import { debounce } from "../../../../utils/vote/debounce";
import {
  abbreviateAddress,
  precision,
} from "../../../../utils/vote/formatting";
import {
  TokenProgramAccount,
  tryGetTokenAccount,
} from "../../../../utils/vote/tokens";
import {
  SendTokenCompactViewForm,
  UiInstruction,
} from "../../../../utils/vote/uiTypes/proposalCreationTypes";
import React, { FC, useEffect, useState } from "react";
import useTreasuryAccountStore from "../../../../stores/vote/useTreasuryAccountStore";
import useWalletStore from "../../../../stores/vote/useWalletStore";

import { getTokenTransferSchema } from "../../../../utils/vote/validations";
import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
  //   InformationCircleIcon,
} from "@heroicons/react/solid";
import tokenService from "../../../../utils/vote/services/token";
import BigNumber from "bignumber.js";
import { getInstructionDataFromBase64 } from "@solana/spl-governance";
import { Governance } from "@solana/spl-governance";
import { ProgramAccount } from "@solana/spl-governance";
import { notify } from "../../../../utils/vote/notifications";
// import { Popover } from '@headlessui/react'
import AccountLabel from "./AccountHeader";
import useGovernanceAssets from "../../../../hooks/useGovernanceAssets";
import {
  getSolTransferInstruction,
  getTransferInstruction,
  getTransferNftInstruction,
} from "../../../../utils/vote/instructionTools";
import VoteBySwitch from "../proposal/components/VoteBySwitch";
import NFTSelector from "../NFTS/NFTSelector";
import { NFTWithMint } from "../../../../utils/vote/uiTypes/nfts";
import useCreateProposal from "../../../../hooks/useCreateProposal";
import Field from "../../elements/Field";
import AccessibleButton from "../../elements/AccessibleButton";
import AccessibleTooltipButton from "../../elements/AccessibleTooltipButton";
import Spinner from "../../elements/Spinner";
import BaseDialog from "../../dialogs/BaseDialog";

interface IProps {
  onFinished(): void;
}

const SendTokens: FC<IProps> = ({ onFinished }) => {
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount);
  const connection = useWalletStore((s) => s.connection);
  const { realmInfo, symbol, realm, canChooseWhoVote } = useRealm();
  const { handleCreateProposal } = useCreateProposal();
  const { canUseTransferInstruction } = useGovernanceAssets();
  const tokenInfo = useTreasuryAccountStore((s) => s.tokenInfo);
  const isNFT = currentAccount?.isNft;
  const isSol = currentAccount?.isSol;
  const wallet = useWalletStore((s) => s.current);
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions);
  const programId: PublicKey | undefined = realmInfo?.programId;
  const [form, setForm] = useState<SendTokenCompactViewForm>({
    destinationAccount: "",
    amount: isNFT ? 1 : undefined,
    governedTokenAccount: undefined,
    programId: programId?.toString(),
    mintInfo: undefined,
    title: "",
    description: "",
  });
  const [selectedNfts, setSelectedNfts] = useState<NFTWithMint[]>([]);
  const [voteByCouncil, setVoteByCouncil] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [destinationAccount, setDestinationAccount] =
    useState<TokenProgramAccount<AccountInfo> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address);
  const mintMinAmount = form.governedTokenAccount?.mint
    ? getMintMinAmountAsDecimal(form.governedTokenAccount.mint.account)
    : 1;
  const currentPrecision = precision(mintMinAmount);

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({});
    setForm({ ...form, [propertyName]: value });
  };
  const setAmount = (event) => {
    const value = event.target.value;
    handleSetForm({
      value: value,
      propertyName: "amount",
    });
  };
  const validateAmountOnBlur = () => {
    const value = form.amount;

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
        ).toFixed(currentPrecision)
      ),
      propertyName: "amount",
    });
  };
  //   const setMaxAmount = () => {
  //     const amount =
  //       currentAccount && currentAccount.mint?.account
  //         ? getMintDecimalAmountFromNatural(
  //             currentAccount.mint?.account,
  //             new BN(currentAccount.token!.account.amount)
  //           ).toNumber()
  //         : 0
  //     handleSetForm({
  //       value: amount,
  //       propertyName: 'amount',
  //     })
  //   }
  const calcTransactionDolarAmount = (amount) => {
    const price = tokenService.getUSDTokenPrice(
      currentAccount!.mint!.publicKey.toBase58()
    );
    const totalPrice = amount * price;
    const totalPriceFormatted =
      amount && price ? new BigNumber(totalPrice).toFormat(2) : "";
    return totalPriceFormatted;
  };

  async function getInstruction(): Promise<UiInstruction> {
    const selectedNftMint = selectedNfts[0]?.mint;
    const defaultProps = {
      schema,
      form,
      programId,
      connection,
      wallet,
      currentAccount,
      setFormErrors,
    };
    if (isNFT) {
      return getTransferNftInstruction({
        ...defaultProps,
        nftMint: selectedNftMint,
      });
    }
    if (isSol) {
      return getSolTransferInstruction(defaultProps);
    }
    return getTransferInstruction(defaultProps);
  }
  const handlePropose = async () => {
    setIsLoading(true);
    const instruction: UiInstruction = await getInstruction();
    if (instruction.isValid) {
      const governance = currentAccount?.governance;
      let proposalAddress: PublicKey | null = null;
      if (!realm) {
        setIsLoading(false);
        throw "No realm selected";
      }
      const instructionData = {
        data: instruction.serializedInstruction
          ? getInstructionDataFromBase64(instruction.serializedInstruction)
          : null,
        holdUpTime: governance?.account?.config.minInstructionHoldUpTime,
        prerequisiteInstructions: instruction.prerequisiteInstructions || [],
      };
      try {
        // Fetch governance to get up to date proposalCount
        const selectedGovernance = (await fetchRealmGovernance(
          governance?.pubkey
        )) as ProgramAccount<Governance>;
        proposalAddress = await handleCreateProposal({
          title: form.title ? form.title : proposalTitle,
          description: form.description ? form.description : "",
          voteByCouncil,
          instructionsData: [instructionData],
          governance: selectedGovernance!,
        });
        // const url = fmtUrlWithCluster(
        //   `/dao/${symbol}/proposal/${proposalAddress}`
        // )
        // router.push(url)
      } catch (ex) {
        notify({ type: "error", message: `${ex}` });
      }
    }
    setIsLoading(false);
  };
  const IsAmountNotHigherThenBalance = () => {
    const mintValue = getMintNaturalAmountFromDecimalAsBN(
      form.amount!,
      form.governedTokenAccount!.mint!.account.decimals
    );
    let gte: boolean | undefined = false;
    try {
      gte = form.governedTokenAccount?.token?.account?.amount?.gte(mintValue);
    } catch (e) {
      //silent fail
    }
    return form.governedTokenAccount?.token?.publicKey && gte;
  };

  useEffect(() => {
    if (currentAccount) {
      handleSetForm({
        value: currentAccount,
        propertyName: "governedTokenAccount",
      });
    }
  }, [currentAccount]);
  useEffect(() => {
    if (form.destinationAccount) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.destinationAccount);
        if (pubKey) {
          const account = await tryGetTokenAccount(connection.current, pubKey);
          setDestinationAccount(account ? account : null);
        } else {
          setDestinationAccount(null);
        }
      });
    } else {
      setDestinationAccount(null);
    }
  }, [form.destinationAccount]);

  const schema = getTokenTransferSchema({ form, connection });
  const transactionDolarAmount = calcTransactionDolarAmount(form.amount);
  const nftName = selectedNfts[0]?.val?.name;
  const nftTitle = `Send ${nftName ? nftName : "NFT"} to ${
    form.destinationAccount
  }`;
  const proposalTitle = isNFT
    ? nftTitle
    : `Pay ${form.amount}${tokenInfo ? ` ${tokenInfo?.symbol} ` : " "}to ${
        tryParseKey(form.destinationAccount)
          ? abbreviateAddress(new PublicKey(form.destinationAccount))
          : ""
      }`;

  if (!currentAccount) {
    return null;
  }

  let Button: React.ComponentType<
    React.ComponentProps<typeof AccessibleButton>
  > = AccessibleButton;
  if (!canUseTransferInstruction || (isNFT && !selectedNfts.length)) {
    Button = AccessibleTooltipButton;
  }
  return (
    <BaseDialog
      className="mx_SendTokens"
      title={`Send ${tokenInfo && tokenInfo?.symbol} ${isNFT && "NFT"}`}
      onFinished={onFinished}
    >
      <AccountLabel></AccountLabel>
      <div className="mx_SendTokens_container">
        <Field
          className="mx_SendTokens_field"
          label="Destination account"
          value={form.destinationAccount}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: "destinationAccount",
            })
          }
        />
        {destinationAccount && (
          <div className="mx_SendTokens_accountOwner">
            <div className="mx_SendTokens_accountOwner_title">
              Account owner
            </div>
            <div className="mx_SendTokens_accountOwner_address">
              {destinationAccount.account.owner.toString()}
            </div>
          </div>
        )}
        {destinationAccountName && (
          <div className="mx_SendTokens_accountInfo">
            <div className="mx_SendTokens_accountInfo_title">Account name</div>
            <div className="mx_SendTokens_accountInfo_name">
              {destinationAccountName}
            </div>
          </div>
        )}
        {isNFT ? (
          <NFTSelector
            onNftSelect={(nfts) => setSelectedNfts(nfts)}
            ownerPk={currentAccount.governance!.pubkey}
          ></NFTSelector>
        ) : (
          <Field
            className="mx_SendTokens_field"
            min={mintMinAmount}
            label={`Amount ${tokenInfo ? tokenInfo?.symbol : ""}`}
            value={form.amount}
            type="number"
            onChange={setAmount}
            step={mintMinAmount}
            onBlur={validateAmountOnBlur}
          />
        )}
        <div className="mx_SendTokens_warning">
          {transactionDolarAmount
            ? IsAmountNotHigherThenBalance()
              ? `~$${transactionDolarAmount}`
              : "Insufficient balance"
            : null}
        </div>
        <div
          className={"mx_SendTokens_optionButton"}
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? (
            <ArrowCircleUpIcon className="mx_SendTokens_optionButton_icon" />
          ) : (
            <ArrowCircleDownIcon className="mx_SendTokens_optionButton_icon" />
          )}
          <div className="mx_SendTokens_optionButton_content">Options</div>
          {/* popover with description maybe will be needed later */}
          {/* <Popover className="relative ml-auto border-none flex">
            <Popover.Button className="focus:outline-none">
              <InformationCircleIcon className="h-4 w-4 mr-1 text-primary-light hover:cursor-pointer" />
            </Popover.Button>

            <Popover.Panel className="absolute z-10 right-4 top-4 w-80">
              <div className="bg-bkg-1 px-4 py-2 rounded-md text-xs">
                {`In case of empty fields of advanced options, title and description will be
                combination of amount token symbol and destination account e.g
                "Pay 10 sol to PF295R1YJ8n1..."`}
              </div>
            </Popover.Panel>
          </Popover> */}
        </div>
        {showOptions && (
          <>
            <Field
              className="mx_SendTokens_field"
              label="Title"
              placeholder={
                form.amount && form.destinationAccount
                  ? proposalTitle
                  : "Title of your proposal"
              }
              value={form.title}
              type="text"
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: "title",
                })
              }
            />
            <Field
              className="mx_SendTokens_field"
              element="textarea"
              label="Description"
              placeholder={
                "Description of your proposal or use a github gist link (optional)"
              }
              value={form.description}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: "description",
                })
              }
            />
            {canChooseWhoVote && (
              <VoteBySwitch
                checked={voteByCouncil}
                onChange={() => {
                  setVoteByCouncil(!voteByCouncil);
                }}
              ></VoteBySwitch>
            )}
          </>
        )}
      </div>
      <div className="mx_SendTokens_buttonGroup">
        <Button
          disabled={
            !canUseTransferInstruction ||
            isLoading ||
            (isNFT && !selectedNfts.length)
          }
          className="mx_SendTokens_button"
          onClick={handlePropose}
          title={
            !canUseTransferInstruction
              ? "You need to have connected wallet with ability to create token transfer proposals"
              : isNFT && !selectedNfts.length
              ? "Please select nft"
              : ""
          }
        >
          {isLoading ? <Spinner /> : <div>Propose</div>}
        </Button>
      </div>
    </BaseDialog>
  );
};

export default SendTokens;
