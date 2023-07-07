import React, { FC } from "react";
import NavBar from "../../structures/NavBar";

interface IProps {
  onChangeTheme: (isDarkTheme: boolean) => void;
}

const Privacy: FC<IProps> = ({
  onChangeTheme
}) => {
  return (
    <div className="mx_Privacy">
      <NavBar
        onChangeTheme={onChangeTheme}
      />
      <div className="mx_Privacy_container">
        <div className="mx_Privacy_header">
          PRIVACY AND COOKIES POLICY
        </div>
        <div className="mx_Privacy_body">
          <div className="mx_Privacy_content">
            Please note that where you use Cafeteria.gg services you are subject
            to the Cafeteria.gg privacy policy.
          </div>
          <div className="mx_Privacy_title">
            OUR PRIVACY POLICY IN PLAIN LANGUAGE
            <ol className="mx_Privacy_list">
              <li>We only ask for data we need</li>
              <li>We only store data for as long as we need to</li>
              <li>We will resolve any issues quickly</li>
              <li>
                It’s your data; if you want to see it, have it or delete it just
                let us know
              </li>
            </ol>
          </div>
          <div className="mx_Privacy_title">
            YOUR RIGHTS UNDER GDPR (GENERAL DATA PROTECTION REGULATION)
            <ol className="mx_Privacy_list">
              <li>
                The right to be informed about how your personal information is
                being used
              </li>
              <li>
                The right to access the personal information we hold about you
              </li>
              <li>
                The right to request the correction of inaccurate personal
                information we hold about you
              </li>
              <li>
                The right to request that we delete your data, or stop processing
                it or collecting it, in some circumstances
              </li>
              <li>
                The right to withdraw consent for any communication or
                consent-based processing at any time
              </li>
              <li>
                The right to request that we transfer or port elements of your
                data either to you or another service provider
              </li>
              <li>
                The right to complain to your data protection regulator – as a
                United Kingdom registered company we fall under the Information
                Commissioner’s Office (ICO)
              </li>
            </ol>
          </div>
          <div className="mx_Privacy_content">
            <span>
              To exercise any of these rights contact us at contact@cafeteria.gg
              or write to us at 
            </span>
            Suite 797 Unit 3a, 34-35 Hatton Garden, Holborn, London, EC1N 8DX.
          </div>
          <div className="mx_Privacy_title">
            WHAT THE PRIVACY POLICY GOVERNS
            <div className="mx_Privacy_content">
              This privacy policy governs Your use of the software services for
              web, mobile and any other device(s) that was created by Cafeteria.gg
              Ltd and the processing of the data obtained and stored as part of
              providing that service.
            </div>
          </div>
          <div className="mx_Privacy_title">
            DATA CONTROLLER AND DATA PROCESSOR
            <div className="mx_Privacy_content">
              You should know that Cafeteria.gg Ltd is a controller processor of
              your personal information registered with ICO, the Data Commissioner
              in the United Kingdom. As such we are subject to the principles of
              GDPR (EU) 2016/679 (EU GDPR). Regardless of your geographic location
              as a user GDPR principles and obligations are to be extended to all
              persons. The principles of GDPR are regarded as a human right and as
              such are extended to all our users. The legal bases for which we
              collect and use the information depends on what the information is
              and why we collected it.
            </div>
          </div>
          <div className="mx_Privacy_title">
            THE FOUR LEGAL BASIS WE RELY ON
            <div className="mx_Privacy_content">
              Contract. This means we need the information to perform our contract
              with you. For example, in order to create a login to your school or
              organisation account we need to be provided with your email address.
            </div>
            <div className="mx_Privacy_content">
              Legitimate Interests. This means we have a legitimate interest that
              does not outweigh your privacy rights. When we collect and process
              information based on our legitimate interests, we consider how we
              can accomplish what we need to in a way that is the least obtrusive
              on your privacy.
            </div>
            <div className="mx_Privacy_content">
              Legal Obligation. We may need to use your personal information to
              comply with a law enforcement preservation request, subpoena, or
              other legal process or to protect the rights of other users.
            </div>
            <div className="mx_Privacy_content">
              Consent. If we have no other legal basis for collecting or using
              your information, we will ask you for consent for a specific
              purpose. If we do, you have the right to withdraw consent at any
              time. Withdrawing your consent will not apply to any processing
              conducted in reliance on lawful processing bases other than consent.
            </div>
          </div>
          <div className="mx_Privacy_title">
            WHAT ARE MY OPT-OUT RIGHTS?
            <div className="mx_Privacy_content">
              Opt-out of all information collection by deleting your account and
              contact us to inform us of your wish for all personal information
              held by Cafeteria.gg services to be deleted.
            </div>
          </div>
          <div className="mx_Privacy_title">
            DATA RETENTION POLICY, MANAGING YOUR INFORMATION
            <div className="mx_Privacy_content">
              We will retain User Provided data for as long as You use the
              Services and for a reasonable time thereafter. We will retain
              Automatically Collected information for up to 24 months and
              thereafter may store it in aggregate. If You would like us to delete
              User Provided Data that You have provided via the Services, please
              contact us at contact@cafeteria.gg and we will respond in a
              reasonable time. Please note that some or all of the User Provided
              Data may be required in order for the Services to function properly.
            </div>
          </div>
          <div className="mx_Privacy_title">
            CHILDREN
            <div className="mx_Privacy_content">
              If a parent or guardian becomes aware that his or her child has
              provided us with information without their (the parents or
              guardians) consent, he or she should contact us at
              contact@cafeteria.gg. We will delete such information from Our files
              within a reasonable time.
            </div>
          </div>
          <div className="mx_Privacy_title">
            SECURITY
            <div className="mx_Privacy_content">
              We are concerned about safeguarding the confidentiality of Your
              information. We provide physical, electronic, and procedural
              safeguards to protect information We process and maintain. For
              example, We limit access to this information to authorised employees
              and contractors who need to know that information in order to
              operate, develop or improve our Services.
            </div>
            <div className="mx_Privacy_content">
              We use leading third party providers for data storage and
              application security in order to provide industry standard robust
              security for information We process and maintain. We also undertake
              regular internal security testing and employ the services of third
              party security experts to rigorously test the security of our
              applications and processes.
            </div>
          </div>
          <div className="mx_Privacy_title">
            WHERE THE INFORMATION IS PROCESSED AND STORED
            <div className="mx_Privacy_content">
              Cafeteria.gg processes information using servers and services
              provided by origanisations compliant with GDPR rules and guidelines.
            </div>
            <div className="mx_Privacy_content">
              Where users be there legal entities or organisations are based
              outside of the UK all data will be processed according to GDPR
              guidelines. We may also employ the services of contractors or agents
              outside of the UK to serve foreign or all markets, any data managed
              or acquired in the course of their duties will be processed
              according to GDPR guidelines.
            </div>
          </div>
          <div className="mx_Privacy_title">
            CHANGES
            <div className="mx_Privacy_content">
              This Privacy Policy may be updated from time to time for any reason.
              We will notify you of any changes to our Privacy Policy by posting
              the new Privacy Policy here. You are advised to consult this Privacy
              Policy regularly for any changes, as continued use is deemed
              approval of all changes. You can request historical versions of this
              policy by email. Any new versions of this privacy policy will
              replace any former versions and You agree to be bound to the latest
              version as long as You are using this application.
            </div>
          </div>
          <div className="mx_Privacy_title">
            DATA BREACH
            <div className="mx_Privacy_content">
              The GDPR introduces a duty on all organisations to report certain
              types of personal data breach to the relevant supervisory authority.
              We must do this within 72 hours of becoming aware of any breach,
              where feasible. If the breach is likely to result in a high risk of
              adversely affecting individuals’ rights and freedoms, we must also
              inform those individuals without undue delay.
            </div>
          </div>
          <div className="mx_Privacy_title">
            YOUR CONSENT
            <div className="mx_Privacy_content">
              By using our Services, You are consenting to Our processing of Your
              information as set forth in this Privacy Policy now and as amended
              by Us. “Processing,” means using cookies on a computer/handheld
              device or using or touching information in any way, including, but
              not limited to, collecting, storing, deleting, using, combining and
              disclosing information.
            </div>
          </div>
          <div className="mx_Privacy_title">
            INFORMATION THE APPLICATION MAY OBTAIN AND HOW MAY IT BE USED
          </div>
          <div className="mx_Privacy_title">
            Potential sources of collected personal information
            <ol className="mx_Privacy_list">
              <li>From users when they register with Cafeteria.gg</li>
              <li>Information inputted through the use of the services</li>
              <li>
                Marketing and promotional activities where user information is
                provided to Cafeteria.gg by users in the course of our marketing
                and promotional activities.
              </li>
            </ol>
          </div>
          <div className="mx_Privacy_title">
            User Provided Information
            <div className="mx_Privacy_content">
              We receive your information when You register with Us and use the
              Services. You may provide (a) your email address and public address
              of linked cryptocurrency wallet (b) transaction-related information,
              such as when you respond to any offers, or download or use Services
              from us; (c) information You provide Us when You contact Us for
              help; (d) information You enter into Our system when using the
              services, such as chosen username; (e) photos and other uploads
              submitted to the Services in the course of using the platform.
            </div>
            <div className="mx_Privacy_content">
              We operate on a minimum user footprint policy in keeping with GDPR
              rules and guidelines.
            </div>
            <div className="mx_Privacy_content">
              We may also use the information You provided Us to contact You from
              time to time to provide You with important information, required
              notices and marketing promotions. Any permission for communications
              from Cafeteria.gg or affiliates must be given explicitly by you and
              recorded as such.
            </div>
          </div>
          <div className="mx_Privacy_title">
            Automatically Collected Information
            <div className="mx_Privacy_content">
              In addition, the Services may collect certain information
              automatically, including, but not limited to, the type of device You
              use, Your devices unique device ID, the IP address of Your device,
              Your operating system, the type of Internet browsers You use, and
              information about the way You use the Services.
            </div>
          </div>
          <div className="mx_Privacy_title">
            Do third parties see and/or have access to information obtained
            through the Services?
            <div className="mx_Privacy_content">
              Yes, we will share your information with third parties only in the
              ways that are described in this privacy statement. Such as where
              relevant and agreed to such as Server Hosts and Analytics providers
              like Google and Firebase.
            </div>
          </div>
          <div className="mx_Privacy_title">
            We may disclose User Provided and Automatically Collected Information
            <div className="mx_Privacy_content">
              As required by law; such as to comply with a legal order, or similar
              legal process. When we believe in good faith that disclosure is
              necessary to protect our rights, protect your safety or the safety
              of others, investigate fraud, or respond to a government request.
              And with Our trusted service providers who work on Our behalf, who
              do not have an independent use of the information We disclose to
              them, and have agreed to adhere to the rules set forth in this
              privacy statement such as Google and Firebase.
            </div>
            <div className="mx_Privacy_content">
              <div className="mx_Privacy_content">
                If Cafeteria.gg Ltd is involved in a merger; acquisition or sale
                of all or a portion of its assets this agreement You enter into by
                downloading and using the application will pass over to the new
                owners.
              </div>
            </div>
          </div>

          <div className="mx_Privacy_title">
            AUTOMATIC DATA COLLECTION AND ADVERTISING
            <div className="mx_Privacy_content">
              We may work with analytics tools from companies such as Google to
              help Us understand how the Services are being used, such as the
              frequency and duration of usage.
            </div>
            <div className="mx_Privacy_content">
              We may provide non personal identifying targeted advertising on the
              Services. An example of this would be an advert or offer appearing
              on the pages of the Services.
            </div>
          </div>
          <div className="mx_Privacy_title">
            SURVEYS AND OTHER ADVERTISING ENGAGEMENTS
            <div className="mx_Privacy_content">
              Cafeteria.gg may include features where you are able to choose to
              participate in rewarded engagements such as completing surveys or
              watching video adverts. Cafeteria.gg may choose to share a portion
              of any resulting remuneration in part or in full with you as the end
              user. Any such sharing of remuneration will be clearly described in
              the relevant Service. In the event that you participate in any such
              engagements you will be sharing your data in some instances directly
              with the third party (such as Pollfish) who will be responsible for
              the data you have provided and you will be subject to their
              particular privacy policies and Terms and Conditions in regards to
              the particular actions taken and data shared with them.
            </div>
            <div className="mx_Privacy_content missive">
              “<span className="bold">Survey Serving Technology</span><br/> These services use Pollfish SDK. Pollfish
              is an on-line survey platform, through which, anyone may conduct
              surveys. Pollfish collaborates with Developers of applications for
              smartphones in order to have access to users of such applications
              and address survey questionnaires to them. When a user connects to
              this app, a specific set of user’s device data (including
              Advertising ID which will may be processed by Pollfish only in
              strict compliance with google play policies- and/or other device
              data) and response meta-data is automatically sent to Pollfish
              servers, in order for Pollfish to discern whether the user is
              eligible for a survey. For a full list of data received by Pollfish
              through this app, please read carefully Pollfish respondent terms
              located at https://www.pollfish.com/terms/respondent. These data
              will be associated with your answers to the questionnaires whenever
              Pollfish sends such questionnaires to eligible users. By downloading
              the application you accept this privacy policy document and you
              hereby give your consent for the processing by Pollfish of the
              aforementioned data. Furthermore, you are informed that you may
              disable Pollfish operation at any time by using the Pollfish “opt
              out section” available on Pollfish website . We once more invite you
              to check the respondent’s terms of use, if you wish to have more
              detailed view of the way Pollfish works.
              <div className="missive_footer">
                APPLE, GOOGLE AND AMAZON ARE NOT A SPONSOR NOR ARE INVOLVED IN ANY
                WAY IN THIS CONTEST/DRAW. NO APPLE PRODUCTS ARE BEING USED AS
                PRIZES.”
              </div>
            </div>
          </div>
          <div className="mx_Privacy_title">
            SEVERABILITY
            <div className="mx_Privacy_content">
              If any part of these Terms found in this document in its entirety is
              found to be invalid, illegal or unenforceable for any reason, then
              that provision will be severed from these Terms to the minimum
              extent such that the remaining provisions of these Terms will
              continue in full force and effect.
            </div>
          </div>
          <div className="mx_Privacy_title">COOKIES POLICY</div>
          <div className="mx_Privacy_title">
            WHAT ARE COOKIES
            <div className="mx_Privacy_content">
              Cookies are small text files that are saved to your computer. We use
              cookies to remember users during a visit, upon return to the site,
              and are required to enable certain functionality. In addition,
              cookies are used to help us understand how our customers use our
              website and we use this information to help plan improvements to the
              site enabling us to get to know you better. For example, using
              persistent cookies allows us to recognise you when you return to the
              site, identify your preferences so as to provide you with a more
              personalised service and speed up searches that you conduct when
              visiting.
            </div>
            <div className="mx_Privacy_content">
              By using the Website as per our Cookie Banner Notice and the
              registration process you give consent for Cafeteria.gg Education Ltd
              to place Cookies on your computer or device. You may, if you wish,
              remove any placed Cookies following the information provided below;
              however certain features of the Website may not function fully or as
              intended.
            </div>
          </div>
          <div className="mx_Privacy_title">
            THE SERVICES MAY PLACE THE FOLLOWING COOKIES
            <div className="mx_Privacy_subTitle">
              1. SESSION COOKIES
              <div className="mx_Privacy_content">
                Session cookies are used by us to recognise a user throughout a
                visit. This enables us to remember information that you have
                entered such as the product you have selected during a purchase
                which can then be used at each stage of processing your purchase.
                Session cookies are also used to remember you when you log in for
                the duration of your visit.
              </div>
            </div>
            <div className="mx_Privacy_subTitle">
              2. PERSISTENT COOKIES
              <div className="mx_Privacy_content">
                Persistent cookies allow us to retain information and settings
                about a user for more than one session. These cookies stay on a
                computer or a device until they expire or a user removes them.
                They enable us to recognise a user when they return to our site,
                identify their preferences so as to provide a user with a more
                personalised service and speed up searches a user conducts when
                visiting the site. They allow us to tailor marketing and servicing
                messages to users based on what we know users have or haven’t done
                in previous sessions. We are able to use this information to
                optimise the website for a user’s return to the site knowing their
                previous searches and interactions on the site.
              </div>
            </div>
          </div>
          <div className="mx_Privacy_title">
            WEBSITE ANALYTICS COOKIES
            <div className="mx_Privacy_content">
              Website analytics cookies enable us to see how people use our
              website. This gives us the information to be able to make
              improvements, to make the site easier to use and based on the areas
              of the site people find most useful.
            </div>
          </div>
          <div className="mx_Privacy_title">
            WEBSITE OPTIMISATION COOKIES
            <div className="mx_Privacy_content">
              We test different versions of parts of the site before we finalise
              changes to ensure that any improvements make the site easier to use
              for our customers. These cookies help us to track how a user
              progresses through sections of the website that we are testing.
            </div>
          </div>
          <div className="mx_Privacy_title">
            MARKETING AND TRACKING COOKIES
            <div className="mx_Privacy_content">
              These cookies record your visit to our website, the pages you have
              visited and the links you have followed. We will use this
              information to make our website and the advertising displayed on it
              more relevant to your interests. We may also share this information
              with third parties for this purpose. We may also allow selected
              third party cookies for these purposes. These are regarded as
              non-essential third party cookies.
            </div>
          </div>
          <div className="mx_Privacy_title">
            ADJUSTING YOUR PRIVACY SETTINGS
            <div className="mx_Privacy_content">
              You can choose to enable or disable Cookies in your internet
              browser/ device. By default, most internet browsers accept Cookies
              but this can be changed. For further details, please consult the
              help menu in your internet browser.
            </div>
            <div className="mx_Privacy_content">
              You can choose to delete Cookies at any time; however you may lose
              any information and or functionality that enables you to access and
              or use the Website more quickly and efficiently including, but not
              limited to, personalisation settings.
            </div>
            <div className="mx_Privacy_content">
              It is recommended that you ensure that your internet browser is
              up-to-date and that you consult the help and guidance provided by
              the developer of your internet browser if you are unsure about
              adjusting your privacy settings.
            </div>
            <div className="mx_Privacy_content">
              For more information generally on cookies, including how to disable
              or delete them, please refer to aboutcookies.org.
            </div>
          </div>
          <div className="mx_Privacy_title">
            To disable Google Analytics please use this <a href="#">tool</a>
          </div>
        </div>
        <div className="mx_Privacy_footer">
          <div className="mx_Privacy_contact">
            <div className="mx_Privacy_title">CONTACT US</div>
            <div className="mx_Privacy_email">
              Email: <span>contact@cafeteria.gg</span>
            </div>
            <div className="mx_Privacy_address">
              Write to us: <span>Suite 797 Unit 3a, 34-35 Hatton Garden, Holborn, London, EC1N 8DX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
