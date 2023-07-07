import useRealm from "../../../../hooks/useRealm";
import React, { FC, useEffect, useState } from "react";
import useMembers from "./useMembers";
import MemberOverview from "./MemberOverview";
import {
  PlusCircleIcon,
  UsersIcon,
} from "@heroicons/react/outline";
import useGovernanceAssets from "../../../../hooks/useGovernanceAssets";
import useWalletStore from "../../../../stores/vote/useWalletStore";
import AddMemberForm from "./AddMemberForm";
import MembersTabs from "./MembersTabs";
import { Member } from "../../../../utils/vote/uiTypes/members";
import Field from "../../elements/Field";
import AccessibleTooltipButton from "../../elements/AccessibleTooltipButton";
import AccessibleButton from "../../elements/AccessibleButton";
import Dropdown from "../../elements/Dropdown";
import Modal from "../../../../Modal";

interface IProps {
    onParentFinished(): void;
}

const DaoMembersContainer: FC<IProps> = ({onParentFinished}) => {
  const {
    realmInfo,
    toManyCouncilOutstandingProposalsForUse,
    toManyCommunityOutstandingProposalsForUser,
  } = useRealm();
  const { activeMembers } = useMembers();
  const connected = useWalletStore((s) => s.connected);
  const { canUseMintInstruction, canMintRealmCouncilToken } =
    useGovernanceAssets();
  const [activeMember, setActiveMember] = useState(activeMembers[0]);
  const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);

  const filterMembers = (v) => {
    setSearchString(v);
    if (v.length > 0) {
      const filtered = activeMembers.filter((r) =>
        r.walletAddress?.toLowerCase().includes(v.toLowerCase())
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(activeMembers);
    }
  };

  const addNewMemberTooltip = !connected
    ? "Connect your wallet to add new council member"
    : !canMintRealmCouncilToken()
    ? "Your realm need mint governance for council token to add new member"
    : !canUseMintInstruction
    ? "You don't have enough governance power to add new council member"
    : toManyCommunityOutstandingProposalsForUser
    ? "You have too many community outstanding proposals. You need to finalize them before creating a new council member."
    : toManyCouncilOutstandingProposalsForUse
    ? "You have too many council outstanding proposals. You need to finalize them before creating a new council member."
    : "";

  useEffect(() => {
    if (activeMembers.length > 0) {
      setActiveMember(activeMembers[0]);
      setFilteredMembers(activeMembers);
    }
  }, [JSON.stringify(activeMembers)]);

  let Button: React.ComponentType<
    React.ComponentProps<typeof AccessibleButton>
  > = AccessibleButton;
  if (addNewMemberTooltip) {
    Button = AccessibleTooltipButton;
  }
 const showAddMemberDialog = () => {
    Modal.createTrackedDialog(
        'Add Member Dialog',
        '',
        AddMemberForm,
        {
            onParentFinished
        }
    )
 }

  return (
    <div className="mx_DaoMembersContainer">
      <div className="mx_DaoMembersContainer_header">
        <div className="mx_DaoMembersContainer_title">
          {realmInfo?.ogImage ? (
            <div className="mx_DaoMembersContainer_title_logo">
              <img src={realmInfo?.ogImage}></img>
            </div>
          ) : null}
          <div className="mx_DaoMembersContainer_title_content">
            {realmInfo?.displayName}
          </div>
        </div>
        <div className="mx_DaoMembersContainer_header_members">
          <UsersIcon className="mx_DaoMembersContainer_header_members_icon" />
          <div className="mx_DaoMembersContainer_header_members_number">
            Members: {activeMembers.length}
          </div>
        </div>
      </div>
      <div className="mx_DaoMembersContainer_body">
        {activeMembers.length > 15 ? (
          <div className="mx_DaoMembersContainer_search">
            <Field
              className="mx_DaoMembersContainer_search_field"
              value={searchString}
              type="text"
              onChange={(e) => filterMembers(e.target.value)}
              placeholder={`Search by Wallet Address...`}
            />
          </div>
        ) : null}
        <div className="mx_DaoMembersContainer_membersSection">
            <div className="mx_DaoMembersContainer_membersSection_header">
                <div className="mx_DaoMembersContainer_membersSection_number">
                    {searchString.length > 0
                    ? `${filteredMembers.length} Members Found`
                    : `${activeMembers.length} Members`}
                </div>
                <Button
                    title={addNewMemberTooltip}
                    onClick={showAddMemberDialog}
                    className="mx_DaoMembersContainer_membersSection_addButton"
                >
                    <PlusCircleIcon className="mx_DaoMembersContainer_membersSection_addButton_icon" />
                    <div className="mx_DaoMembersContainer_membersSection_addButton_content">
                    New Member
                    </div>
                </Button>
            </div>
          {/* <div className="col-span-12 lg:hidden">
          <Dropdown
            className="break-all"
            onChange={(v) =>
              setActiveMember(
                // @ts-ignore
                activeMembers.find((m) => {
                  return m.walletAddress === v;
                })
              )
            }
            placeholder="Please select..."
            value={activeMember?.walletAddress}
          >
            {activeMembers.map((x) => {
              return <div key={x?.walletAddress}>{x?.walletAddress}</div>;
            })}
          </Dropdown>
        </div> */}
          <div className="mx_DaoMembersContainer_membersSection_tab">
            <MembersTabs
                activeTab={activeMember}
                onChange={(t) => setActiveMember(t)}
                tabs={filteredMembers}
            />
            </div>
        </div>
        <div className="mx_DaoMembersContainer_memberOverView">
            {activeMember ? <MemberOverview member={activeMember} /> : null}
        </div>
      </div>
    </div>
  );
};

export default DaoMembersContainer;
