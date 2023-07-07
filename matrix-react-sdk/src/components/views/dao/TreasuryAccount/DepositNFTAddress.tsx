import React, { useEffect, useState } from "react";
import useTreasuryAccountStore from "../../../../stores/vote/useTreasuryAccountStore";
import { tryParseKey } from "../../../../tools/validators/pubkey";
import { debounce } from "../../../../utils/vote/debounce";
import useWalletStore from "../../../../stores/vote/useWalletStore";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import axios from "axios";
import { notify } from "../../../../utils/vote/notifications";
import { PublicKey } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { tryGetAta } from "../../../../utils/vote/validations";
import useRealm from "../../../../hooks/useRealm";
import { createATA } from "../../../../utils/vote/ataTools";
import { abbreviateAddress } from "../../../../utils/vote/formatting";
import { DuplicateIcon, ExclamationIcon } from "@heroicons/react/outline";
import useGovernanceAssets from "../../../../hooks/useGovernanceAssets";
import DepositLabel from "./DepositLabel";
import NFTAccountSelect from "./NFTAccountSelect";
import ImgWithLoader from "../ImgWithLoader";
import Field from "../../elements/Field";
import AccessibleButton from "../../elements/AccessibleButton";
import AccessibleTooltipButton from "../../elements/AccessibleTooltipButton";
import Spinner from "../../elements/Spinner";
const DepositNFTAddress = ({ additionalBtns }: { additionalBtns?: any }) => {
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount);

  const wallet = useWalletStore((s) => s.current);
  const { realm } = useRealm();
  const connected = useWalletStore((s) => s.connected);
  const [form, setForm] = useState({
    mint: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [nftMetaData, setNftMetaData] = useState<Metadata | null>(null);
  const [isInvalidMint, setIsInvalidMint] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [imgUrl, setImgUrl] = useState("");
  const [ataAddress, setAtaAddress] = useState("");
  const { nftsGovernedTokenAccounts } = useGovernanceAssets();
  const { setCurrentAccount } = useTreasuryAccountStore();
  const connection = useWalletStore((s) => s.connection);
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({});
    setForm({ ...form, [propertyName]: value });
  };
  const handleGenerateATAAddress = async () => {
    setAtaAddress("");
    if (!currentAccount) {
      throw "No governance selected";
    }
    if (!realm) {
      throw "no realm selected";
    }
    const mintPK = new PublicKey(form.mint);
    const owner = currentAccount!.governance!.pubkey;
    const ataPk = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
      TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
      mintPK, // mint
      owner! // owner
    );
    const ata = ataPk.toBase58();
    const isExistingAta = await tryGetAta(connection.current, mintPK, owner);
    if (!isExistingAta) {
      try {
        await createATA(
          connection.current,
          wallet,
          mintPK,
          owner,
          wallet!.publicKey!
        );
        setAtaAddress(ata);
      } catch (e) {
        notify({
          type: "error",
          message: "Unable to create address",
        });
        setAtaAddress("");
      }
    } else {
      setAtaAddress(ata);
    }
  };
  useEffect(() => {
    setIsInvalidMint(false);
    if (form.mint) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.mint);
        if (pubKey) {
          setIsLoading(true);
          try {
            const metadataPDA = await Metadata.getPDA(pubKey);
            const tokenMetadata = await Metadata.load(
              connection.current,
              metadataPDA
            );
            setNftMetaData(tokenMetadata);
          } catch (e) {
            notify({
              type: "error",
              message: "Unable to fetch nft",
            });
            setNftMetaData(null);
          }
          setIsLoading(false);
        } else {
          setIsInvalidMint(true);
          setNftMetaData(null);
        }
      });
    } else {
      setNftMetaData(null);
    }
  }, [form.mint]);
  useEffect(() => {
    const uri = nftMetaData?.data?.data?.uri;
    const getNftData = async (uri) => {
      if (uri) {
        setIsLoading(true);
        try {
          const nftResponse = (await axios.get(uri)).data;
          setImgUrl(nftResponse.image);
        } catch (e) {
          notify({
            type: "error",
            message: "Unable to fetch nft",
          });
        }
        setIsLoading(false);
      } else {
        setImgUrl("");
      }
    };
    setAtaAddress("");
    getNftData(uri);
  }, [JSON.stringify(nftMetaData)]);
  let Button: React.ComponentType<
    React.ComponentProps<typeof AccessibleButton>
  > = AccessibleButton;
  if (!connected) {
    Button = AccessibleTooltipButton;
  }
  return (
    <div className="mx_DepositNFTAddress">
      <NFTAccountSelect
        onChange={(value) => setCurrentAccount(value, connection)}
        currentAccount={currentAccount}
        nftsGovernedTokenAccounts={nftsGovernedTokenAccounts}
      ></NFTAccountSelect>
      <DepositLabel
        transferAddress={currentAccount?.transferAddress}
      ></DepositLabel>
      <div className="mx_DepositNFTAddress_description">
        <ExclamationIcon className="mx_DepositNFTAddress_description_icon"></ExclamationIcon>
        <div className="mx_DepositNFTAddress_description_content">
          {
            "If your wallet doesn't support sending nfts to shared wallets please generate address using the nft mint"
          }
        </div>
      </div>
      <Field
        className="mx_DepositNFTAddress_field"
        label="Mint address"
        value={form.mint}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: "mint",
          })
        }
      />
      <Button
        className="mx_DepositNFTAddress_button generate"
        title={!connected && "Please connect your wallet"}
        disabled={isLoading || !imgUrl || !connected}
        onClick={handleGenerateATAAddress}
      >
        {isLoading ? <Spinner /> : <div>Generate Address</div>}
      </Button>
      {isInvalidMint && (
        <div className="mx_DepositNFTAddress_warning">Invalid mint address</div>
      )}
      {isLoading ? (
        <Spinner />
      ) : (
        imgUrl && (
          <div className="flex justify-center">
            <ImgWithLoader style={{ width: "150px" }} src={imgUrl} />
          </div>
        )
      )}
      {ataAddress && (
        <div className="bg-bkg-1 px-4 py-2 rounded-md w-full break-all flex items-center mb-4">
          <div>
            <div className="text-fgd-3 text-xs">
              {abbreviateAddress(new PublicKey(ataAddress))}
            </div>
          </div>
          <div className="ml-auto">
            <AccessibleButton
              className="ml-4 text-th-fgd-1"
              onClick={() => {
                navigator.clipboard.writeText(ataAddress);
              }}
            >
              <DuplicateIcon className="w-5 h-5 mt-1" />
            </AccessibleButton>
          </div>
        </div>
      )}
      <div className="mx_DepositNFTAddress_buttonGroup">
        {additionalBtns}
      </div>
    </div>
  );
};

export default DepositNFTAddress;
