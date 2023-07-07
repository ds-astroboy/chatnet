import React, { FC } from "react";
import NavBar from "../../structures/NavBar";

interface IProps {
  onChangeTheme: (isDarkTheme: boolean) => void;
}

const Terms: FC<IProps> = ({
  onChangeTheme
}) => {
  return (
    <div className="mx_Terms">
      <NavBar
        onChangeTheme={onChangeTheme}
      />
      <div className="mx_Terms_container">
        <div className="mx_Terms_header">Terms of Service</div>
        <div className="mx_Terms_body">
          <div className="mx_Terms_title">
            1. Introduction; Your Agreement to these Terms of Service
            <div className="mx_Terms_content">
              THIS IS A BINDING CONTRACT, READ THESE TERMS OF SERVICE CAREFULLY.
              This agreement applies to the services provided and operated by
              Cafeteria.gg Ltd. (collectively with its affiliates, “Cafeteria.gg”,
              “Cafeteria” or “We”) consisting of the website available at <a href="https://www.cafeteria.gg">www.cafeteria.gg</a>, and its network of websites, software
              applications, or any other products or services offered by Cafeteria
              (the “Cafeteria.gg Services”). Other services offered by
              Cafeteria.gg may be subject to separate terms.
            </div>
            <div className="mx_Terms_content">
              Cafeteria.gg is a new service and the services paid and free are
              experimental by nature, use of any services are at the sole
              discretion of the user and in acknowledgement that Cafeteria.gg has
              no liability for any loss or damage materially or otherwise through
              the users or organisations use of the services provided.
            </div>
            <div className="mx_Terms_content">
              When using the Cafeteria.gg Services, you will be subject to the
              Cafeteria.gg, Terms of Service, Community Guidelines, Privacy Policy
              and any additional guidelines or rules that are posted on the
              Cafeteria.gg Services, made available to you, or disclosed to you in
              connection with specific services and features.
            </div>
            <div className="mx_Terms_content">
              The Terms of Service apply whether you are a user that registers an
              account in any of the means provided with the Cafeteria.gg Services
              or as an unregistered user/unregistered site user. You agree that by
              clicking “Sign Up” or otherwise registering, downloading, accessing,
              or using the Cafeteria.gg Services, you are entering into a legally
              binding agreement between you and Cafeteria.gg regarding your use of
              the Cafteria.gg Services. You acknowledge that you have read,
              understood, and agree to be bound by these Terms of Service. If you
              do not agree to these Terms of Service, do not access or otherwise
              use any of the Cafeteria.gg Services.
            </div>
            <div className="mx_Terms_content">
              When using Cafeteria.gg or opening an account with Cafeteria.gg on
              behalf of a company, entity, or organisation (collectively,
              “Subscribing Organisation”), you represent and warrant that you: (i)
              are an authorised representative of that Subscribing Organisation
              with the authority to bind that organisation to these Terms of
              Service and grant the licenses set forth herein; and (ii) agree to
              these Terms of Service on behalf of such Subscribing Organisation.
            </div>
          </div>
          <div className="mx_Terms_title">
            2. Use of Cafeteria.gg by Minors and Blocked Persons
            <div className="mx_Terms_content">
              The Cafeteria.gg Services are not available to persons under the age
              of 13. If you are between the ages of 13 and the age of legal
              majority in your jurisdiction of residence, you may only use the
              Cafeteria.gg Services under the supervision of a parent or legal
              guardian who agrees to be bound by these Terms of Service.
            </div>
            <div className="mx_Terms_content">
              The Cafeteria.gg Services are also not available to any users
              previously removed from the Cafeteria.gg Services or to any persons
              barred from receiving them under the laws of the United Kingdom
              (such as its export and re-export restrictions and regulations) or
              applicable laws in any other jurisdiction.
            </div>
            <div className="mx_Terms_content">
              BY DOWNLOADING, INSTALLING, OR OTHERWISE USING THE CAFETERIA.GG
              SERVICES, YOU REPRESENT THAT YOU ARE AT LEAST 13 YEARS OF AGE, THAT
              YOUR PARENT OR LEGAL GUARDIAN AGREES TO BE BOUND BY THESE TERMS OF
              SERVICE IF YOU ARE BETWEEN 13 AND THE AGE OF LEGAL MAJORITY IN YOUR
              JURISDICTION OF RESIDENCE, AND THAT YOU HAVE NOT BEEN PREVIOUSLY
              REMOVED FROM AND ARE NOT PROHIBITED FROM RECEIVING THE CAFETERIA.GG
              SERVICES.
            </div>
          </div>
          <div className="mx_Terms_title">
            3. Privacy Notice
            <div className="mx_Terms_content">
              Your privacy is important to Cafeteria.gg. Please see our PRIVACY
              POLICY for information relating to how we collect, use, and disclose
              your personal information, and how you can manage your information
              held by Cafeteria.gg.
            </div>
          </div>
          <div className="mx_Terms_title">
            4. Account and Features
            <div className="mx_Terms_subTitle">
              a. Account and Password
              <div className="mx_Terms_content">
                In order to open an account, depending on your chosen mode of
                registration may be asked to provide us with certain information
                such as an account name and password.
              </div>
              <div className="mx_Terms_content">
                You are solely responsible for maintaining the confidentiality of
                your account, your password and for restricting access to your
                computer. If you permit others to use your account credentials,
                you agree to these Terms of Service on behalf of all other persons
                who use the Services under your account or password, and you are
                responsible for all activities that occur under your account or
                password. Please make sure the information you provide to
                Cafeteria.gg upon registration and at all other times is true,
                accurate, current, and complete to the best of your knowledge.
              </div>
              <div className="mx_Terms_content">
                Unless expressly permitted in writing by Cafeteria.gg, you may not
                sell, rent, lease, share, or provide access to your account to
                anyone else, including without limitation, charging anyone for
                access to administrative rights on your account. Cafeteria.gg
                reserves all available legal rights and remedies to prevent
                unauthorized use of the Cafeteria.gg Services.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              b. Third-Party Accounts
              <div className="mx_Terms_content">
                Cafeteria.gg may permit you to register for and log on to the
                Cafeteria.gg Services via certain third-party services. The third
                party’s collection, use, and disclosure of your information will
                be subject to that third-party service’s privacy notice. Further
                information about how Cafeteria.gg collects, uses, and discloses
                your personal information when you link your Cafeteria.gg account
                with your account on any third-party service can be found in our
                Privacy Notice.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              c. Features
              <div className="mx_Terms_content">
                Cafeteria.gg is a new service and the services (current and
                future) paid and free are experimental by nature, use of any
                services are at the sole discretion of the user and you as the
                user acknowledge that Cafeteria.gg has no liability for any loss
                or damage materially or otherwise through the users or
                organisations use of the services provided.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Connecting your non custodial cryptocurrency wallet
              <div className="mx_Terms_content">
                While cafeteria.gg by design has no access to the control of your
                personal connected wallet and all actions need to be approved by
                you, you are solely responsible for any outcomes that may arise
                through the use of the platform with your connected wallet. Our
                strong recommendation is that you do not connect a wallet that
                holds any assets of significant value as a matter of prudence and
                good practice.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Tipping and spending using your connected cryptocurrency wallet
              <div className="mx_Terms_content">
                Cafeteria.gg has no access or control over users wallets so is
                unable to assist you in the event you accidentally send funds to
                an incorrect address or should you suffer any financial loss or
                harm.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Platform features
              <div className="mx_Terms_content">
                The platform makes certain features available such as price bots
                and other automated software services, these are used by the user
                at their own risk and you as the user acknowledge that
                Cafeteria.gg has no responsibility or liability for any outcomes
                whatsoever through your use of the platform and services.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Paid features
              <div className="mx_Terms_content">
                Cafeteria.gg offers a range of paid services which shall be
                delivered and supported by Cafeteria.gg. Cafeteria will endeavour
                to provide a fulfilling and satisfactory service and should you
                need any assistance or have any issues you should contact
                contact@cafeteria.gg
              </div>
              <div className="mx_Terms_content">
                Paid features are subject to change with 30 days notice and your
                use of any paid features are at your discretion and personal risk
                and by using any paid features you acknowledge Cafeteria.gg is no
                liable or responsible for any harms that may occur through the use
                of said services. Should a service provide a risk to the platform
                or users Cafeteria.gg reserves the right to pause or terminate the
                service with immediate effect at our sole discretion.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Cafeteria Credits
              <div className="mx_Terms_content">
                Cafeteria Credits are a native ‘in-game’ currency of the
                Cafeteria.gg platform and are not transferable off the platform or
                exchangeable for any other currencies.Your use and or purchase of
                Cafeteria Credits is subject and restricted to the services
                provided by Cafeteria.gg at any time. Cafeteria Credits may be used
                for tipping other users and groups and the purchase of services
                that are subject to change. Cafeteria.gg will be constantly
                evolving and as a result new services may be made available and
                existing services may be subject to change or removal.
              </div>
              <div className="mx_Terms_content">
                Cafeteria.gg as part of its service delivery may gift you
                Cafeteria Credits and you by using the service accept this.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              NFTS
              <div className="mx_Terms_content">
                Cafeteria.gg provides a verified NFT service as part of the
                platform service. Other NFT services may also be provided by
                Cafeteria.gg. Where NFTS are owned by the user in their own
                custody Cafeteria will reference their wallet address in order to
                enable us to provide the services, for example verified NFT. By
                using Cafeteria.gg and services the user acknowledges that they do
                so at their own risk and that Cafeteria.gg shall not be liable for
                any material or other losses the user may incur.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Access to services
              <div className="mx_Terms_content">
                Access to services on the platform may be restricted according to
                the users particular circumstances such as by not exclusively a
                wallet balance or a particular Verified NFT status. By using this
                platform you acknowledge that this is part of the platforms design
                and deemed acceptable to you should you choose to use the
                platform.
              </div>
            </div>
          </div>
          <div className="mx_Terms_title">
            5. Use of Devices and Services
            <div className="mx_Terms_content">
              Access to the Cafeteria.gg Services may require the use of your
              personal computer or mobile device, as well as communications with
              or use of space on such devices. You are responsible for any
              Internet connection or mobile fees and charges that you incur when
              accessing the Cafeteria.gg Services.
            </div>
          </div>
          <div className="mx_Terms_title">
            6. Modification of these Terms of Service
            <div className="mx_Terms_content">
              Cafeteria.gg may amend any of the terms of these Terms of Service
              and by posting the amended terms. Your continued use of the
              Cafeteria.gg Services after the effective date of the revised Terms
              of Service constitutes your acceptance of the terms.
            </div>
            <div className="mx_Terms_content">
              Cafeteria.gg will provide reasonable prior notice regarding any
              material amendments to it’s Terms of Service, Community Conduct
              Rules and Privacy Policy. All amendments shall become effective no
              sooner than 30 calendar days after posting; provided that any
              amendment regarding newly available features of the Service,
              features of the Service that are beneficial to the user, or changes
              made for legal reasons may become effective immediately.
            </div>
          </div>
          <div className="mx_Terms_title">
            7. License
            <div className="mx_Terms_content">
              The Cafeteria.gg Services are owned and operated by Cafeteria.gg.
              Unless otherwise indicated, all content, information, and other
              materials on the Cafeteria.gg Services (excluding User Content, set
              out in Section 8 below), including, without limitation,
              Cafeteria.gg’s trademarks and logos, the visual interfaces,
              graphics, design, compilation, information, software, computer code
              (including source code or object code), services, text, pictures,
              information, data, sound files, other files, and the selection and
              arrangement thereof (collectively, the “Materials”) are protected by
              relevant intellectual property and proprietary rights and laws. All
              Materials are the property of Cafeteria.gg or its subsidiaries or
              affiliated companies and/or third-party licensors. Unless otherwise
              expressly stated in writing by Cafeteria.gg, by agreeing to these
              Terms of Service you are granted a limited, non-sublicensable
              license (i.e., a personal and limited right) to access and use the
              Cafeteria.gg Services for your personal use or internal business use
              only.
            </div>
            <div className="mx_Terms_content">
              Cafeteria.gg reserves all rights not expressly granted in these
              Terms of Service. This license is subject to these Terms of Service
              and does not permit you to engage in any of the following: (a)
              resale or commercial use of the Cafeteria.gg Services or the
              Materials; (b) distribution, public performance or public display of
              any Materials; (c) modifying or otherwise making any derivative uses
              of the Cafeteria.gg Services or the Materials, or any portion of
              them; (d) use of any data mining, robots, or similar data gathering
              or extraction methods; (e) downloading (except page caching) of any
              portion of the Cafeteria.gg Services, the Materials, or any
              information contained in them, except as expressly permitted on the
              Cafeteria.gg Services; or (f) any use of the Cafeteria.gg Services
              or the Materials except for their intended purposes. Any use of the
              Cafeteria.gg Services or the Materials except as specifically
              authorized in these Terms of Service, without the prior written
              permission of Cafeteria.gg, is strictly prohibited and may violate
              intellectual property rights or other laws. Unless explicitly stated
              in these Terms of Service, nothing in them shall be interpreted as
              conferring any license to intellectual property rights, whether by
              estoppel, implication, or other legal principles. Cafeteria.gg can
              terminate this license as set out in Section 14.
            </div>
          </div>
          <div className="mx_Terms_title">
            8. User Content
            <div className="mx_Terms_content">
              Cafeteria.gg allows you to distribute streaming live and
              pre-recorded audio-visual works; to use services, such as chat,
              bulletin boards, forum postings, wiki contributions, and voice
              interactive services; and to participate in other activities in
              which you may create, post, transmit, perform, or store content,
              messages, text, sound, images, applications, code, or other data or
              materials on the Cafeteria.gg Services (“User Content”)
            </div>
            <div className="mx_Terms_subTitle">
              a. License to Cafeteria.gg
              <div className="mx_Terms_content">
                (i) Unless otherwise agreed to in a written agreement between you
                and Cafeteria.gg that was signed by an authorized representative
                of Cafeteria.gg, if you submit, transmit, display, perform, post,
                or store User Content using the Cafeteria.gg Services, you grant
                Cafeteria.gg and its sub-licensees, to the furthest extent and for
                the maximum duration permitted by applicable law (including in
                perpetuity if permitted under applicable law), an unrestricted,
                worldwide, irrevocable, fully sub-licenseable, nonexclusive, and
                royalty-free right to: (a) use, reproduce, modify, adapt, publish,
                translate, create derivative works from, distribute, perform, and
                display such User Content (including without limitation for
                promoting and redistributing part or all of the Cafeteria.gg
                Services (and derivative works thereof) in any form, format,
                media, or media channels now known or later developed or
                discovered; and (b) use the name, identity, likeness, and voice
                (or other biographical information) that you submit in connection
                with such User Content. Should such User Content contain the name,
                identity, likeness, and voice (or other biographical information)
                of third parties, you represent and warrant that you have obtained
                the appropriate consents and/or licenses for your use of such
                features and that Cafeteria.gg and its sub-licensees are allowed
                to use them to the extent indicated in these Terms of Service.
              </div>
              <div className="mx_Terms_content">
                (ii) With respect to User Content known as “add-ons”, “maps”,
                “mods”, or other types of projects submitted through
                CurseForge.com or related sites (the “Submitted Projects”), the
                rights granted by you hereunder terminate once you remove or
                delete such Submitted Projects from the Cafeteria.gg Services. You
                also acknowledge that Cafeteria.gg may retain, but not display,
                distribute, or perform, server copies of Submitted Projects that
                have been removed or deleted.
              </div>
              <div className="mx_Terms_content">
                (iii) With respect to streaming live and pre-recorded audio-visual
                works, the rights granted by you hereunder terminate once you
                delete such User Content from the Cafeteria.gg Services, or
                generally by closing your account, except:(a) to the extent you
                shared it with others as part of the Cafeteria.gg Services and
                others copied or stored portions of the User Content (e.g., made a
                Clip); (b) Cafeteria.gg used it for promotional purposes; and (c)
                for the reasonable time it takes to remove from backup and other
                systems.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              b. User Content Representations and Warranties
              <div className="mx_Terms_content">
                You are solely responsible for your User Content and the
                consequences of posting or publishing it. You represent and
                warrant that: (1) you are the creator or own or control all right
                in and to the User Content or otherwise have sufficient rights and
                authority to grant the rights granted herein; (2) your User
                Content does not and will not: (a) infringe, violate, or
                misappropriate any third-party right, including any copyright,
                trademark, patent, trade secret, moral right, privacy right, right
                of publicity, or any other intellectual property or proprietary
                right, or (b) defame any other person; (3) your User Content does
                not contain any viruses, adware, spyware, worms, or other harmful
                or malicious code; and (4) unless you have received prior written
                authorization, your User Content specifically does not contain any
                pre-release or non-public beta software or game content or any
                confidential information of Cafeteria.gg or third parties.
                Cafeteria.gg reserves all rights and remedies against any users
                who breach these representations and warranties.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              c. Content is Uploaded at Your Own Risk
              <div className="mx_Terms_content">
                Cafeteria.gg uses reasonable security measures in order to attempt
                to protect User Content against unauthorized copying and
                distribution. However, Cafeteria.gg does not guarantee that any
                unauthorized copying, use, or distribution of User Content by
                third parties will not take place. To the furthest extent
                permitted by applicable law, you hereby agree that Cafeteria.gg
                shall not be liable for any unauthorized copying, use, or
                distribution of User Content by third parties and release and
                forever waive any claims you may have against Cafeteria.gg for any
                such unauthorized copying or usage of the User Content, under any
                theory. THE SECURITY MEASURES TO PROTECT USER CONTENT USED BY
                Cafeteria.gg HEREIN ARE PROVIDED AND USED “AS-IS” AND WITH NO
                WARRANTIES, GUARANTEES, CONDITIONS, ASSURANCES, OR OTHER TERMS
                THAT SUCH SECURITY MEASURES WILL WITHSTAND ATTEMPTS TO EVADE
                SECURITY MECHANISMS OR THAT THERE WILL BE NO CRACKS, DISABLEMENTS,
                OR OTHER CIRCUMVENTION OF SUCH SECURITY MEASURES.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              d. Promotions
              <div className="mx_Terms_content">
                Users may promote, administer, or conduct a promotion (e.g., a
                contest or sweepstakes) on, through, or utilizing the Cafeteria.gg
                Services (a “Promotion”). If you choose to promote, administer, or
                conduct a Promotion, you must adhere to the following rules: (1)
                You may carry out Promotions to the extent permitted by applicable
                law and you are solely responsible for ensuring that any
                Promotions comply with any and all applicable laws, obligations,
                and restrictions; (2) You will be classified as the promoter of
                your Promotion in the applicable jurisdiction(s) and you will be
                solely responsible for all aspects of and expenses related to your
                Promotion, including without limitation the execution,
                administration, and operation of the Promotion; drafting and
                posting any official rules; selecting winners; issuing prizes; and
                obtaining all necessary third-party permissions and approvals,
                including without limitation filing any and all necessary
                registrations and bonds. Cafeteria.gg has the right to remove your
                Promotion from the Cafeteria.gg Services if Cafeteria.gg
                reasonably believes that your Promotion does not comply with the
                Terms of Service or applicable law; (3) Cafeteria.gg is not
                responsible for and does not endorse or support any such
                Promotions. You may not indicate that Cafeteria.gg is a sponsor or
                co-sponsor of the Promotion; and (4) You will display or read out
                the following disclaimer when promoting, administering, or
                conducting a Promotion: “This is a promotion by [Your Name].
                Cafeteria.gg does not sponsor or endorse this promotion and is not
                responsible for it.”.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              e. Endorsements/Testimonials
              <div className="mx_Terms_content">
                You, and not Cafeteria.gg, are solely responsible for any
                endorsements or testimonials you make regarding any product or
                service through the Cafeteria.gg Services.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              f. Political Activity
              <div className="mx_Terms_content">
                Subject to these Terms of Service and the Community Guidelines,
                you may share political opinions; participate in political
                activity; provide links to a political committee’s official
                website, including the contribution page of a political committee;
                and solicit viewers to make contributions directly to a political
                committee. You agree, however, that these activities are entirely
                your own. Moreover, by engaging in these activities, you represent
                and warrant that you are eligible to engage in them under
                applicable law, and that you will abide by all relevant laws and
                regulations while doing so.
              </div>
              <div className="mx_Terms_content">
                You agree not to solicit the use of or use any Cafeteria.gg
                monetization tool (e.g., Bits or subscriptions) for the purpose of
                making or delivering a contribution to a candidate, candidate’s
                committee, political action committee, ballot committee, or any
                other campaign committee, or otherwise for the purpose of
                influencing any election. Candidates for political office are not
                eligible to use any Cafeteria.gg monetization tool on their
                channels.
              </div>
            </div>
          </div>
          <div className="mx_Terms_title">
            9. Prohibited Conduct
            <div className="mx_Terms_content">
              YOU AGREE NOT TO violate any law, contract, intellectual property,
              or other third-party right; not to commit a tort, and that you are
              solely responsible for your conduct while on the Cafeteria.gg
              Services.
            </div>
            <div className="mx_Terms_content">
              You agree that you will comply with these Terms of Service and
              Cafeteria.gg’s Community Guidelines and will not:
            </div>
            <div className="mx_Terms_content">
              i. create, upload, transmit, distribute, or store any content that
              is inaccurate, unlawful, infringing, defamatory, obscene,
              pornographic, invasive of privacy or publicity rights, harassing,
              threatening, abusive, inflammatory, or otherwise objectionable;
            </div>
            <div className="mx_Terms_content">
              ii. impersonate any person or entity; falsely claim an affiliation
              with any person or entity; access the Cafeteria.gg Services accounts
              of others without permission; forge another person’s digital
              signature; misrepresent the source, identity, or content of
              information transmitted via the Cafeteria.gg Services; or perform
              any other similar fraudulent activity;
            </div>
            <div className="mx_Terms_content">
              iii. send junk mail or spam to users of the Cafeteria.gg Services,
              including without limitation unsolicited advertising, promotional
              materials, or other solicitation material; bulk mailing of
              commercial advertising, chain mail, informational announcements,
              charity requests, petitions for signatures, or any of the preceding
              things related to promotional giveaways (such as raffles and
              contests); and other similar activities;
            </div>
            <div className="mx_Terms_content">
              iv. harvest or collect email addresses or other contact information
              of other users from the Cafeteria.gg Services;
            </div>
            <div className="mx_Terms_content">
              v. defame, harass, abuse, threaten, or defraud users of the
              Cafeteria.gg Services, or collect or attempt to collect, personal
              information about users or third parties without their consent;
            </div>
            <div className="mx_Terms_content">
              vi. delete, remove, circumvent, disable, damage, or otherwise
              interfere with (a) security-related features of the Cafeteria.gg
              Services or User Content, (b) features that prevent or restrict use
              or copying of any content accessible through the Cafeteria.gg
              Services, (c) features that enforce limitations on the use of the
              Cafeteria.gg Services or User Content, or (d) the copyright or other
              proprietary rights notices on the Cafeteria.gg Services or User
              Content;
            </div>
            <div className="mx_Terms_content">
              vii. reverse engineer, decompile, disassemble, or otherwise attempt
              to discover the source code of the Cafeteria.gg Services or any part
              thereof, except and only to the extent that this activity is
              expressly permitted by the law of your jurisdiction of residence;
            </div>
            <div className="mx_Terms_content">
              viii. modify, adapt, translate, or create derivative works based
              upon the Cafeteria.gg Services or any part thereof, except and only
              to the extent that such activity is expressly permitted by
              applicable law notwithstanding this limitation;
            </div>
            <div className="mx_Terms_content">
              ix. interfere with or damage the operation of the Cafeteria.gg
              Services or any user’s enjoyment of them, by any means, including
              uploading or otherwise disseminating viruses, adware, spyware,
              worms, or other malicious code;
            </div>
            <div className="mx_Terms_content">
              x. relay email from a third party’s mail servers without the
              permission of that third party;
            </div>
            <div className="mx_Terms_content">
              xi. access any website, server, software application, or other
              computer resource owned, used, and/or licensed by Cafeteria.gg,
              including but not limited to the Cafeteria.gg Services, by means of
              any robot, spider, scraper, crawler, or other automated means for
              any purpose, or bypass any measures Cafeteria.gg may use to prevent
              or restrict access to any website, server, software application, or
              other computer resource owned, used, and/or licensed by
              Cafeteria.gg, including but not limited to the Cafeteria.gg
              Services;
            </div>
            <div className="mx_Terms_content">
              xii. manipulate identifiers in order to disguise the origin of any
              User Content transmitted through the Cafeteria.gg Services;
            </div>
            <div className="mx_Terms_content">
              xiii. interfere with or disrupt the Cafeteria.gg Services or servers
              or networks connected to the Cafeteria.gg Services, or disobey any
              requirements, procedures, policies, or regulations of networks
              connected to the Cafeteria.gg Services; use the Cafeteria.gg
              Services in any manner that could interfere with, disrupt,
              negatively affect, or inhibit other users from fully enjoying the
              Cafeteria.gg Services, or that could damage, disable, overburden, or
              impair the functioning of the Cafeteria.gg Services in any manner;
            </div>
            <div className="mx_Terms_content">
              xiv. use or attempt to use another user’s account without
              authorization from that user and Cafeteria.gg;
            </div>
            <div className="mx_Terms_content">
              xv. attempt to circumvent any content filtering techniques we
              employ, or attempt to access any service or area of the Cafeteria.gg
              Services that you are not authorized to access;
            </div>
            <div className="mx_Terms_content">
              xvi. attempt to indicate in any manner, without our prior written
              permission, that you have a relationship with us or that we have
              endorsed you or any products or services for any purpose; and
            </div>
            <div className="mx_Terms_content">
              xvii. use the Cafeteria.gg Services for any illegal purpose, or in
              violation of any local, state, national, or international law or
              regulation, including without limitation laws governing intellectual
              property and other proprietary rights, data protection, and privacy.
            </div>
            <div className="mx_Terms_content">
              To the extent permitted by applicable law, Cafeteria.gg takes no
              responsibility and assumes no liability for any User Content or for
              any loss or damage resulting therefrom, nor is Cafeteria.gg liable
              for any mistakes, defamation, slander, libel, omissions, falsehoods,
              obscenity, pornography, or profanity you may encounter when using
              the Cafeteria.gg Services. Your use of the Cafeteria.gg Services is
              at your own risk. In addition, these rules do not create any private
              right of action on the part of any third party or any reasonable
              expectation that the Cafeteria.gg Services will not contain any
              content that is prohibited by such rules.
            </div>
            <div className="mx_Terms_content">
              Cafeteria.gg is not liable for any statements or representations
              included in User Content. Cafeteria.gg does not endorse any User
              Content, opinion, recommendation, or advice expressed therein, and
              Cafeteria.gg expressly disclaims any and all liability in connection
              with User Content. To the fullest extent permitted by applicable
              law, Cafeteria.gg reserves the right to remove, screen, or edit any
              User Content posted or stored on the Cafeteria.gg Services at any
              time and without notice, including where such User Content violates
              these Terms of Service or applicable law, and you are solely
              responsible for creating backup copies of and replacing any User
              Content you post or store on the Cafeteria.gg Services at your sole
              cost and expense. Any use of the Cafeteria.gg Services in violation
              of the foregoing violates these Terms of Service and may result in,
              among other things, termination or suspension of your rights to use
              the Cafeteria.gg Services.
            </div>
          </div>
          <div className="mx_Terms_title">
            10. Respecting Copyright
            <div className="mx_Terms_content">
              Cafeteria.gg respects the intellectual property of others and
              follows the requirements set forth in the Digital Millennium
              Copyright Act (“DMCA”) and other applicable laws. If you are the
              copyright owner or agent thereof and believe that content posted on
              the Cafeteria.gg Services infringes upon your copyright, please
              submit a notice to us at contact@cafeteria.gg
            </div>
          </div>
          <div className="mx_Terms_title">
            11. Trademarks
            <div className="mx_Terms_content">
              Cafeteria.gg, the Cafeteria.gg logos, and any other product or
              service name, logo, or slogan used by Cafeteria.gg, and the look and
              feel of the Cafeteria.gg Services, including all page headers,
              custom graphics, button icons, and scripts, are trademarks or trade
              dress of Cafeteria.gg, and may not be used in whole or in part in
              connection with any product or service that is not Cafeteria.gg’s,
              in any manner that is likely to cause confusion among customers, or
              in any manner that disparages or discredits Cafeteria.gg, without
              our prior written permission. Any use of these trademarks must be in
              accordance with the Cafeteria.gg available on request.
            </div>
            <div className="mx_Terms_content">
              All other trademarks referenced in the Cafeteria.gg Services are the
              property of their respective owners. Reference on the Cafeteria.gg
              Services to any products, services, processes, or other information
              by trade name, trademark, manufacturer, supplier, or otherwise does
              not constitute or imply endorsement, sponsorship, or recommendation
              thereof by us or any other affiliation.
            </div>
          </div>
          <div className="mx_Terms_title">
            12. Third-Party Content
            <div className="mx_Terms_content">
              In addition to the User Content, Cafeteria.gg may provide other
              third-party content on the Cafeteria.gg Services (collectively, the
              “Third-Party Content”). Cafeteria.gg does not control or endorse any
              Third-Party Content and makes no representation or warranties of any
              kind regarding the Third-Party Content, including without limitation
              regarding its accuracy or completeness. Please be aware that we do
              not create Third-Party Content, update, or monitor it. Therefore we
              are not responsible for any Third-Party Content on the Cafeteria.gg
              Services.
            </div>
            <div className="mx_Terms_content">
              You are responsible for deciding if you want to access or use
              third-party websites or applications that link from the Cafeteria.gg
              Services (the “Reference Sites”). Cafeteria.gg does not control or
              endorse any such Reference Sites or the information, materials,
              products, or services contained on or accessible through Reference
              Sites, and makes no representations or warranties of any kind
              regarding the Reference Sites. In addition, your correspondence or
              business dealings with, or participation in promotions of,
              advertisers found on or through the Cafeteria.gg Services are solely
              between you and such advertiser. Access and use of Reference Sites,
              including the information, materials, products, and services on or
              available through Reference Sites is solely at your own risk.
            </div>
          </div>
          <div className="mx_Terms_title">
            13. Idea Submission
            <div className="mx_Terms_content">
              By submitting ideas, suggestions, documents, and/or proposals (the
              “Submissions”) to Cafeteria.gg or its employees, you acknowledge and
              agree that Cafeteria.gg shall be entitled to use or disclose such
              Submissions for any purpose in any way without providing
              compensation or credit to you.
            </div>
          </div>
          <div className="mx_Terms_title">
            14. Termination
            <div className="mx_Terms_content">
              To the fullest extent permitted by applicable law, Cafeteria.gg
              reserves the right, without notice and in our sole discretion, to
              terminate your license to use the Cafeteria.gg Services (including
              to post User Content) and to block or prevent your future access to
              and use of the Cafeteria.gg Services, including where we reasonably
              consider that: (a) your use of the Cafeteria.gg Services violates
              these Terms of Service or applicable law; (b) you fraudulently use
              or misuse the Cafeteria.gg Services; or (c) we are unable to
              continue providing the Cafeteria.gg Services to you due to technical
              or legitimate business reasons. Our right to terminate your license
              includes the ability to terminate or to suspend your access to any
              purchased products or services, including any subscriptions, Prime
              Gaming, or Turbo accounts. To the fullest extent permitted by
              applicable law, your only remedy with respect to any dissatisfaction
              with: (i) the Cafeteria.gg Services, (ii) any term of these Terms of
              Service, (iii) any policy or practice of Cafeteria.gg in operating
              the Cafeteria.gg Services, or (iv) any content or information
              transmitted through the Cafeteria.gg Services, is to terminate your
              account and to discontinue use of any and all parts of the
              Cafeteria.gg Services.
            </div>
            <div className="mx_Terms_content">
              For residents of the Republic of Korea, except in the case where
              Cafeteria.gg reasonably considers that giving notice is legally
              prohibited (for instance, when providing notice would either (i)
              violate applicable laws, regulations, or orders from regulatory
              authorities or (ii) compromise an ongoing investigation conducted by
              a regulatory authority) or that any notice may cause harm to you,
              third parties, Cafeteria.gg, and/or its affiliates (for instance,
              when providing notice harms the security of the Cafeteria.gg
              Services), Cafeteria.gg will without delay notify you of the reason
              for taking the relevant step.
            </div>
          </div>
          <div className="mx_Terms_title">
            15. Disputes
            <div className="mx_Terms_subTitle">
              a. Indemnification
              <div className="mx_Terms_content">
                To the fullest extent permitted by applicable law, you agree to
                indemnify, defend, and hold harmless Cafeteria.gg, its affiliated
                companies, and each of our respective contractors, employees,
                officers, directors, agents, third-party suppliers, licensors, and
                partners (individually and collectively, the “Cafeteria.gg
                Parties”) from any claims, losses, damages, demands, expenses,
                costs, and liabilities, including legal fees and expenses, arising
                out of or related to your access, use, or misuse of the
                Cafeteria.gg Services, any User Content you post, store, or
                otherwise transmit in or through the Cafeteria.gg Services, your
                violation of the rights of any third party, any violation by you
                of these Terms of Service, or any breach of the representations,
                warranties, and covenants made by you herein. You agree to
                promptly notify the Cafeteria.gg Parties of any third-party claim,
                and Cafeteria.gg reserves the right, at your expense, to assume
                the exclusive defense and control of any matter for which you are
                required to indemnify Cafeteria.gg, and you agree to cooperate
                with Cafeteria.gg’s defense of these claims. Cafeteria.gg will use
                reasonable efforts to notify you of any such claim, action, or
                proceeding upon becoming aware of it.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              b. Disclaimers; No Warranties
              <div className="mx_Terms_content">
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW: (A) THE
                Cafeteria.gg SERVICES AND THE CONTENT AND MATERIALS CONTAINED
                THEREIN ARE PROVIDED ON AN “AS IS” BASIS WITHOUT WARRANTIES OF ANY
                KIND, EITHER EXPRESS OR IMPLIED, EXCEPT AS EXPRESSLY PROVIDED TO
                THE CONTRARY IN WRITING BY Cafeteria.gg; (B) THE Cafeteria.gg
                PARTIES DISCLAIM ALL OTHER WARRANTIES, STATUTORY, EXPRESS, OR
                IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND
                NON-INFRINGEMENT AS TO THE Cafeteria.gg SERVICES, INCLUDING ANY
                INFORMATION, CONTENT, OR MATERIALS CONTAINED THEREIN; (C)
                Cafeteria.gg DOES NOT REPRESENT OR WARRANT THAT THE CONTENT OR
                MATERIALS ON THE Cafeteria.gg SERVICES ARE ACCURATE, COMPLETE,
                RELIABLE, CURRENT, OR ERROR-FREE; (D) Cafeteria.gg IS NOT
                RESPONSIBLE FOR TYPOGRAPHICAL ERRORS OR OMISSIONS RELATING TO TEXT
                OR PHOTOGRAPHY; AND (E) WHILE Cafeteria.gg ATTEMPTS TO MAKE YOUR
                ACCESS AND USE OF THE Cafeteria.gg SERVICES SAFE, Cafeteria.gg
                CANNOT AND DOES NOT REPRESENT OR WARRANT THAT THE Cafeteria.gg
                SERVICES OR OUR SERVER(S) ARE FREE OF VIRUSES OR OTHER HARMFUL
                COMPONENTS, AND THEREFORE, YOU SHOULD USE INDUSTRY-RECOGNIZED
                SOFTWARE TO DETECT AND DISINFECT VIRUSES FROM ANY DOWNLOAD. NO
                ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED BY YOU
                FROM Cafeteria.gg OR THROUGH THE Cafeteria.gg SERVICES WILL CREATE
                ANY WARRANTY NOT EXPRESSLY STATED HEREIN.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              c. Limitation of Liability and Damages
              <div className="mx_Terms_subTitle2">
                i. Limitation of Liability
                <div className="mx_Terms_content">
                  TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW: (A) IN NO
                  EVENT SHALL Cafeteria.gg OR THE Cafeteria.gg PARTIES BE LIABLE
                  FOR ANY DIRECT, SPECIAL, INDIRECT, OR CONSEQUENTIAL DAMAGES, OR
                  ANY OTHER DAMAGES OF ANY KIND, INCLUDING BUT NOT LIMITED TO LOSS
                  OF USE, LOSS OF PROFITS, OR LOSS OF DATA, WHETHER IN AN ACTION
                  IN CONTRACT, TORT (INCLUDING BUT NOT LIMITED TO NEGLIGENCE), OR
                  OTHERWISE, ARISING OUT OF OR IN ANY WAY CONNECTED WITH THE USE
                  OF OR INABILITY TO USE THE Cafeteria.gg SERVICES, THE CONTENT OR
                  THE MATERIALS, INCLUDING WITHOUT LIMITATION ANY DAMAGES CAUSED
                  BY OR RESULTING FROM RELIANCE ON ANY INFORMATION OBTAINED FROM
                  Cafeteria.gg, OR THAT RESULT FROM MISTAKES, OMISSIONS,
                  INTERRUPTIONS, DELETION OF FILES OR EMAIL, ERRORS, DEFECTS,
                  VIRUSES, DELAYS IN OPERATION OR TRANSMISSION, OR ANY FAILURE OF
                  PERFORMANCE, WHETHER OR NOT RESULTING FROM ACTS OF GOD,
                  COMMUNICATIONS FAILURE, THEFT, DESTRUCTION, OR UNAUTHORISED
                  ACCESS TO Cafeteria.gg’S RECORDS, PROGRAMS, OR SERVICES; AND (B)
                  IN NO EVENT SHALL THE AGGREGATE LIABILITY OF Cafeteria.gg,
                  WHETHER IN CONTRACT, WARRANTY, TORT (INCLUDING NEGLIGENCE,
                  WHETHER ACTIVE, PASSIVE, OR IMPUTED), PRODUCT LIABILITY, STRICT
                  LIABILITY, OR OTHER THEORY, ARISING OUT OF OR RELATING TO THE
                  USE OF OR INABILITY TO USE THE Cafeteria.gg SERVICES EXCEED THE
                  AMOUNT PAID BY YOU, IF ANY, FOR ACCESSING THE Cafeteria.gg
                  SERVICES DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE
                  DATE OF THE CLAIM OR ONE HUNDRED DOLLARS, WHICHEVER IS GREATER.
                  TO THE EXTENT THAT APPLICABLE LAW PROHIBITS LIMITATION OF SUCH
                  LIABILITY, Cafeteria.gg SHALL LIMIT ITS LIABILITY TO THE FULL
                  EXTENT ALLOWED BY APPLICABLE LAW.
                </div>
              </div>
              <div className="mx_Terms_subTitle2">
                ii. Reference Sites
                <div className="mx_Terms_content">
                  THESE LIMITATIONS OF LIABILITY ALSO APPLY WITH RESPECT TO
                  DAMAGES INCURRED BY YOU BY REASON OF ANY PRODUCTS OR SERVICES
                  SOLD OR PROVIDED ON ANY REFERENCE SITES OR OTHERWISE BY THIRD
                  PARTIES OTHER THAN Cafeteria.gg AND RECEIVED THROUGH OR
                  ADVERTISED ON THE Cafeteria.gg SERVICES OR RECEIVED THROUGH ANY
                  REFERENCE SITES.
                </div>
              </div>
              <div className="mx_Terms_subTitle2">
                iii. Basis of the Bargain
                <div className="mx_Terms_content">
                  YOU ACKNOWLEDGE AND AGREE THAT Cafeteria.gg HAS OFFERED THE
                  Cafeteria.gg SERVICES, USER CONTENT, MATERIALS, AND OTHER
                  CONTENT AND INFORMATION, SET ITS PRICES, AND ENTERED INTO THESE
                  TERMS OF SERVICE IN RELIANCE UPON THE WARRANTY DISCLAIMERS AND
                  LIMITATIONS OF LIABILITY SET FORTH HEREIN, THAT THE WARRANTY
                  DISCLAIMERS AND LIMITATIONS OF LIABILITY SET FORTH HEREIN
                  REFLECT A REASONABLE AND FAIR ALLOCATION OF RISK BETWEEN YOU AND
                  Cafeteria.gg, AND THAT THE WARRANTY DISCLAIMERS AND LIMITATIONS
                  OF LIABILITY SET FORTH HEREIN FORM AN ESSENTIAL BASIS OF THE
                  BARGAIN BETWEEN YOU AND Cafeteria.gg. Cafeteria.gg WOULD NOT BE
                  ABLE TO PROVIDE THE Cafeteria.gg SERVICES TO YOU ON AN
                  ECONOMICALLY REASONABLE BASIS WITHOUT THESE LIMITATIONS.
                </div>
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              d. Applicable Law and Venue
              <div className="mx_Terms_content">
                (i) To the fullest extent permitted by applicable law, you and
                Cafeteria.gg agree that if you are a Subscribing Organisation or a
                consumer resident of a jurisdiction other than those in (ii)
                below, the following governing law and arbitration provision
                applies:
              </div>
              <div className="mx_Terms_content">
                PLEASE READ THE FOLLOWING CAREFULLY BECAUSE IT REQUIRES YOU TO
                ARBITRATE DISPUTES WITH Cafeteria.gg AND LIMITS THE MANNER IN
                WHICH YOU CAN SEEK RELIEF FROM Cafeteria.gg.
              </div>
              <div className="mx_Terms_content">
                You and Cafeteria.gg agree to arbitrate any dispute arising from
                these Terms of Service or your use of the Cafeteria.gg Services,
                except that you and Cafeteria.gg are not required to arbitrate any
                dispute in which either party seeks equitable and other relief for
                the alleged unlawful use of copyrights, trademarks, trade names,
                logos, trade secrets, or patents. ARBITRATION PREVENTS YOU FROM
                SUING IN COURT OR FROM HAVING A JURY TRIAL. You and Cafeteria.gg
                agree that you will notify each other in writing of any dispute
                within thirty (30) days of when it arises. Notice to Cafeteria.gg
                shall be sent to: Cafeteria.gg Suite 797 Unit 3a, 34-35 Hatton
                Garden, Holborn, London, EC1N 8DX. You and Cafeteria.gg further
                agree: to attempt informal resolution prior to any demand for
                arbitration; that any arbitration will occur in Hertfordshire, the
                United Kingdom; that arbitration will be conducted confidentially
                by a single arbitrator in accordance with the rules of The United
                Kingdom; and that the UK Courts have exclusive jurisdiction over
                any appeals of an arbitration award and over any suit between the
                parties not subject to arbitration. Other than class procedures
                and remedies discussed below, the arbitrator has the authority to
                grant any remedy that would otherwise be available in court. Any
                dispute between the parties will be governed by this Agreement and
                the laws of England of the United Kingdom, without giving effect
                to any conflict of laws principles that may provide for the
                application of the law of another jurisdiction. Whether the
                dispute is heard in arbitration or in court, you and Cafeteria.gg
                will not commence against the other a class action, class
                arbitration, or other representative action or proceeding.
              </div>
              <div className="mx_Terms_content">
                (ii) If you are a resident in any jurisdiction in which the
                provision in the section above is found to be unenforceable, then
                any disputes, claims, or causes of action arising out of or in
                connection with these Terms of Service will be governed by and
                construed under the laws of your jurisdiction of residence, and
                shall be resolved by competent civil courts within your
                jurisdiction of residence.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              e. Claims
              <div className="mx_Terms_content">
                YOU AND Cafeteria.gg AGREE THAT ANY CAUSE OF ACTION ARISING OUT OF
                OR RELATED TO THE Cafeteria.gg SERVICES MUST COMMENCE WITHIN ONE
                (1) YEAR AFTER THE CAUSE OF ACTION ACCRUES. OTHERWISE, SUCH CAUSE
                OF ACTION IS PERMANENTLY BARRED.
              </div>
            </div>
          </div>
          <div className="mx_Terms_title">
            16. Miscellaneous
            <div className="mx_Terms_subTitle">
              a. Waiver
              <div className="mx_Terms_content">
                If we fail to exercise or enforce any right or provision of these
                Terms of Service, it will not constitute a waiver of such right or
                provision. Any waiver of any provision of these Terms of Service
                will be effective only if in writing and signed by the relevant
                party.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              b. Severability
              <div className="mx_Terms_content">
                If any provision of these Terms of Service is held to be unlawful,
                void, or for any reason unenforceable, then that provision will be
                limited or eliminated from these Terms of Service to the minimum
                extent necessary and will not affect the validity and
                enforceability of any remaining provisions.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              c. Assignment
              <div className="mx_Terms_content">
                These Terms of Service, and any rights and licenses granted
                hereunder, may not be transferred or assigned by you, but may be
                assigned by Cafeteria.gg without restriction. Any assignment
                attempted to be made in violation of this Terms of Service shall
                be void.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              d. Survival
              <div className="mx_Terms_content">
                Upon termination of these Terms of Service, any provision which,
                by its nature or express terms should survive, will survive such
                termination or expiration, including, but not limited to, Sections
                7, 8, 11, 12, and 15-17.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              e. Entire Agreement
              <div className="mx_Terms_content">
                The Terms of Service, which incorporate the Terms of Sale and the
                Community Guidelines, is the entire agreement between you and
                Cafeteria.gg relating to the subject matter herein and will not be
                modified except by a writing signed by authorized representatives
                of both parties, or by a change to these Terms of Service made by
                Cafeteria.gg as set forth in Section 6 above.
              </div>
            </div>
          </div>
          <div className="mx_Terms_title">
            17. Requests for Information and How to Serve a Legal Notice
            <div className="mx_Terms_content">
              All requests for information or documents related to potential,
              anticipated, or current legal proceedings, investigations, or
              disputes must be made using the appropriate level of legal process,
              and must be properly served on Cafeteria.gg.:
            </div>
            <div className="mx_Terms_content">
              Cafeteria.gg Ltd Suite 797 Unit 3a, 34-35 Hatton Garden, Holborn,
              London, EC1N 8DX
            </div>
            <div className="mx_Terms_content">
              Please note that Cafeteria.gg does not accept requests for
              information or documents, or service of process, via e-mail or fax
              and will not respond to such requests. All requests must include the
              information you may have that will help us identify the relevant
              records. Please also note that limiting your request to the relevant
              records (e.g., a limited time period) will facilitate efficient
              processing of your request.
            </div>
            <div className="mx_Terms_content">
              The Cafeteria.gg Services are offered by Cafeteria.gg Ltd, Suite 797
              Unit 3a, 34-35 Hatton Garden, Holborn, London, EC1N 8DX and email:
              contact@Cafeteria.gg
            </div>
            <div className="mx_Terms_subTitle">
              Community Conduct Rules
              <div className="mx_Terms_content">
                A general principle of respectful and sensible behaviour applies
                to all users of Cafeteria.gg and its services. Any actions which
                may cause harm or threat to other users or yourself is not
                permitted. We strongly advise that users do not disclose any
                personal information or arrange to meet in person with any other
                users on the platform. If you are unable to use the platform in a
                way that keeps you and others safe and otherwise respectfully
                treated we will act in the best interests of all parties as
                required using our discretion.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Self-Destructive Behaviour
              <div className="mx_Terms_content">
                Activity that may endanger your life, lead to your physical harm,
                or encourage others to engage in physically harmful behaviour is
                prohibited. This includes, but is not limited to: suicide threats,
                glorification or encouragement of self-harm, intentional physical
                trauma, illegal use of drugs, illegal or dangerous consumption of
                alcohol, and dangerous or distracted driving.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Violence and Threats
              <div className="mx_Terms_content">
                Acts and threats of violence will be taken seriously and are
                considered zero-tolerance violations and all accounts associated
                with such activities will be indefinitely suspended. This
                includes, but is not limited to:
                <ul className="mx_Terms_list">
                  <li>Attempts or threats to physically harm or kill others</li>
                  <li>Attempts or threats to hack, DDOS, or SWAT others</li>
                  <li>
                    Use of weapons to physically threaten, intimidate, harm, or
                    kill others
                  </li>
                </ul>
              </div>
              <div className="mx_Terms_content">
                Cafeteria.gg does not allow content that depicts, glorifies,
                encourages, or supports terrorism, or violent extremist actors or
                acts. This includes threatening to or encouraging others to commit
                acts that would result in serious physical harm to groups of
                people or significant property destruction. You may not display or
                link terrorist or extremist propaganda, including graphic pictures
                or footage of terrorist or extremist violence, even for the
                purposes of denouncing such content.
              </div>
              <div className="mx_Terms_content">
                In exceptional circumstances, we may preemptively suspend accounts
                when we believe an individual’s use of Cafeteria.gg poses a high
                likelihood of inciting violence. In weighing the risk of harm, we
                consider an individual’s influence, the level of recklessness in
                their past behaviours (regardless of whether any past behaviour
                occurred on Cafeteria.gg), whether or not there continues to be a
                risk of harm, and the scale of ongoing threats.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Hateful Conduct and Harassment
              <div className="mx_Terms_content">
                Hateful conduct and harassment are not allowed on Cafeteria.gg.
                Hateful conduct is any content or activity that promotes or
                encourages discrimination, denigration, harassment, or violence
                based on the following protected characteristics: race, ethnicity,
                color, caste, national origin, immigration status, religion, sex,
                gender, gender identity, sexual orientation, disability, serious
                medical condition, and veteran status. We also provide certain
                protections for age. Cafeteria.gg has zero tolerance for hateful
                conduct, meaning we act on every valid reported instance of
                hateful conduct. We afford every user equal protections under this
                policy, regardless of their particular characteristics.
              </div>
              <div className="mx_Terms_content">
                Harassment has many manifestations, including stalking, personal
                attacks, promotion of physical harm, hostile raids, and malicious
                false report brigading. Sexual harassment, specifically, can take
                the form of unwelcome sexual advances and solicitations, sexual
                objectification, or degrading attacks relating to a person’s
                perceived sexual practices.
              </div>
              <div className="mx_Terms_content">
                We will take action on all instances of hateful conduct and
                harassment, with an increasing severity of enforcement when the
                behaviour is targeted, personal, graphic, or repeated/prolonged,
                incites further abuse, or involves threats of violence or
                coercion. The most egregious violations may result in an
                indefinite suspension on the first offense.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Unauthorized Sharing of Private Information
              <div className="mx_Terms_content">
                Do not invade the privacy of others. It is prohibited to share
                content that may reveal private personal information about
                individuals, or their private property, without permission. This
                includes but is not limited to:
                <ul className="mx_Terms_list">
                  <li>
                    Sharing personally identifiable information (such as real
                    name, location, or ID)
                  </li>
                  <li>
                    Sharing restricted or protected social profiles or any
                    information from those profiles
                  </li>
                  <li>
                    Sharing content that violates another’s reasonable expectation
                    of privacy
                  </li>
                </ul>
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Impersonation
              <div className="mx_Terms_content">
                Content or activity meant to impersonate an individual or
                organization is prohibited. Any attempts to misrepresent yourself
                as a member of Cafeteria.gg representatives is a zero-tolerance
                violation and will result in indefinite suspension.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Account Usernames and Display Names
              <div className="mx_Terms_content">
                In order to ensure that our community is safe and inclusive,
                inappropriate account names that violate our Community Guidelines
                are prohibited. We also recognize that an account’s username has
                more impact across our services than many other forms of content
                because they are persistent, cross-functional, and, in most cases,
                much more visible. Because of this, we have additional, higher
                standards for usernames based on reducing harm across our
                services. Usernames and display names created on Cafeteria.gg may
                not include:
                <ul className="mx_Terms_list">
                  <li>
                    Breaking the Law, including Terrorism and Child Exploitation
                  </li>
                  <li>Violence and Threats</li>
                  <li>Hateful Conduct</li>
                  <li>Impersonation</li>
                  <li>Glorification of natural or violent tragedies</li>
                  <li>Self-Destructive behaviour</li>
                  <li>
                    References to recreational drugs, hard drugs, and drug abuse,
                    with exceptions for alcohol, tobacco, and marijuana
                  </li>
                  <li>References to sexual acts, genital, or sexual fluids</li>
                </ul>
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Spam, Scams, and Other Malicious Conduct
              <div className="mx_Terms_content">
                Any content or activity that disrupts, interrupts, harms, or
                otherwise violates the integrity of Cafeteria.gg services or
                another user’s experience or devices is prohibited. Such activity
                includes:
                <ul className="mx_Terms_list">
                  <li>
                    Posting large amounts of repetitive, unwanted messages or user
                    reports
                  </li>
                  <li>Distributing unauthorized advertisements</li>
                  <li>Phishing</li>
                  <li>Defrauding others</li>
                  <li>Spreading malware or viruses</li>
                  <li>Misinformation</li>
                  <li>Harmful misinformation actors</li>
                  <li>Tampering</li>
                  <li>Selling or sharing user accounts</li>
                  <li>Reselling Cafeteria.gg services or features</li>
                  <li>
                    Defacing, or attempting to deface, website pages or other
                    Cafeteria.gg services (such as uploading inappropriate or
                    malicious content)
                  </li>
                  <li>Cheating a Cafeteria.gg rewards system</li>
                </ul>
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Harmful Misinformation Actors
              <div className="mx_Terms_content">
                In order to reduce harm to our community and the public without
                undermining our users open dialogue with their communities, we
                also prohibit harmful misinformation superspreaders who
                persistently share misinformation on or off of Cafeteria.gg. We
                seek to remove users whose online presence is dedicated to (1)
                persistently sharing (2) widely disproven and broadly shared (3)
                harmful misinformation topics.
              </div>
              <div className="mx_Terms_content">
                This policy is focused on Cafeteria.gg users who persistently
                share harmful misinformation. It will not be applied to users
                based upon individual statements or discussions that occur on the
                channel. All three of the criteria listed above must be satisfied
                in order for us to take action on an account. We will evaluate
                whether a user violates the policy by assessing both their
                on-platform behaviour as well as their off-platform behaviour. You
                can report these actors by sending an email to
                contact@cafeteria.gg with the account name and any available
                supporting evidence.
              </div>
              <div className="mx_Terms_content">
                Below we provide a short list of non-comprehensive examples of the
                types of content that harmful misinformation actors persistently
                share. However, misinformation evolves rapidly, and we will
                continue to update these guidelines and topic categories as new
                trends and behaviours emerge.
                <ul className="mx_Terms_list">
                  <li>Misinformation that targets protected groups.</li>
                  <li>
                    Misinformation promoted by conspiracy networks tied to
                    violence and/or promoting violence
                  </li>
                  <li>
                    Civic misinformation that undermines the integrity of a civic
                    or political process
                  </li>
                  <li>
                    In instances of public emergencies (e.g., wildfires,
                    earthquakes, active shootings), we may also act on
                    misinformation that may impact public safety
                  </li>
                </ul>
              </div>
              <div className="mx_Terms_content">
                *Note: In order to evaluate civic misinformation claims, we work
                with independent misinformation experts such as (but not
                exclusively) the Global Disinformation Index.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Nudity, Pornography, and Other Sexual Content
              <div className="mx_Terms_content">
                Nudity and sexually explicit content or activities, such as
                pornography, sexual acts or intercourse, and sexual services, are
                prohibited.
              </div>
              <div className="mx_Terms_content">
                Content or activities that threaten or promote sexual violence or
                exploitation are strictly prohibited and may be reported to law
                enforcement. Child exploitation will be reported to relevant
                authorities.
              </div>
              <div className="mx_Terms_content">
                Sexually suggestive content or activities are also prohibited,
                although they may be allowed in educational contexts or for
                pre-approved licensed content, in each case subject to additional
                restrictions
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Extreme Violence, Gore, and Other Obscene Conduct
              <div className="mx_Terms_content">
                Content that exclusively focuses on extreme or gratuitous gore and
                violence is prohibited.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Intellectual Property Rights
              <div className="mx_Terms_content">
                You should only share content on your Cafeteria.gg channel that
                you own, or that you otherwise have rights to or are authorized to
                share on Cafeteria.gg. If you share content on your Cafeteria.gg
                channel that you do not own or otherwise do not have the rights to
                share on Cafeteria.gg, you may be infringing another person’s
                intellectual property rights. This includes any third party
                content included in your content, derivative creations, or
                performances of others’ copyrighted content. We encourage you to
                assess your content for adherence to applicable intellectual
                property laws and the proper application of principles such as
                fair use, and to secure all appropriate rights needed, before
                sharing your content on Cafeteria.gg.
              </div>
              <div className="mx_Terms_content">
                Any unauthorized content you share on Cafeteria.gg violates our
                Terms of Service and is subject to removal. Multiple violations of
                our policies may lead to a permanent suspension of your account.
                Rights holders may request that Cafeteria.gg remove unauthorized
                content and/or issue penalties through the following processes:
                <ul className="mx_Terms_list">
                  <li>
                    For copyrighted works, the notice-and-takedown process can be
                    made available on request.
                  </li>
                  <li>
                    For trademarks, the process can be made available on request.
                  </li>
                  <li>
                    For copyrighted works owned by rights holders with whom
                    Cafeteria.gg has contractual arrangements, we may have
                    separate reporting and handling processes.
                  </li>
                </ul>
              </div>
              <div className="mx_Terms_content">
                Examples of content you should not share on Cafeteria.gg without
                permission from the rights holders or unless otherwise permitted
                by law include:
                <ul className="mx_Terms_list">
                  <li>Other Cafeteria.gg creators’ content</li>
                  <li>
                    Pirated games or content from unauthorized private servers
                  </li>
                  <li>Content from other sites</li>
                  <li>Movies, television shows, or sports matches</li>
                  <li>Music you do not own or do not have the rights to share</li>
                  <li>Goods or services protected by trademark</li>
                </ul>
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Content Labeling
              <div className="mx_Terms_content">
                You are expected to accurately ascribe acknowledgement and label
                your content to the best of your ability.
              </div>
            </div>
            <div className="mx_Terms_subTitle">
              Off-Service Conduct
              <div className="mx_Terms_content">
                Cafeteria.gg is committed to facilitating vibrant and dynamic
                communities, which can only happen if our users feel secure and
                protected. In order to achieve this goal, Cafeteria.gg enforces
                against severe offenses committed by members of the Cafeteria.gg
                community that occur outside of our services, such as hate group
                membership, terrorist recruitment, sexual assault, and child
                grooming. We will investigate reports that include verifiable
                evidence of these behaviours and, if we are able to confirm, issue
                enforcements against the relevant users. We will also consider
                allegations of similarly severe conduct by those wishing to join
                the Cafeteria.gg community and, if substantiated, we will
                terminate the account.
              </div>
            </div>
            <div className="mx_Terms_content">
              We will do our best to ensure that our enforcement decisions are
              accurate, which in some cases will necessitate us bringing in a
              third party investigator for thorough and impartial review. If we
              are able to verify reports of off-service statements or behaviours
              that relate to an incident that took place on Cafeteria.gg, we will
              use this evidence to support and inform our enforcement decisions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
