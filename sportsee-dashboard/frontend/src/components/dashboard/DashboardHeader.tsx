// src/components/dashboard/DashboardHeader.tsx

type Props = {
  fullName: string;
  memberSince: string;
  totalDistanceKm: string;
  profilePicture?: string | null;
  onOpenChat: () => void;
};

export default function DashboardHeader({
  fullName,
  memberSince,
  totalDistanceKm,
  profilePicture,
  onOpenChat,
}: Props) {
  return (
    <div className="dashHeaderBlocks">
      {/* BLOC 1 */}
      <section className="dashCard dashAskCard">
        <div className="dashAskLeft">
          <img className="dashAskIcon" src="/star-icon.svg" alt="star-icon" />
          <p className="dashAskText">
            Posez vos questions sur votre programme, vos performances ou vos objectifs.
          </p>
        </div>
        <button className="dashAskBtn" type="button" onClick={onOpenChat}>
          Lancer une conversation
        </button>
      </section>

      {/* BLOC PROFIL */}
        <section className="dashCard dashProfileCard">
          {/* sous bloc 1 */}
          <div className="dashProfileInfo">
            <div className="dashAvatar">
              {profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profilePicture} alt={fullName} />
              ) : null}
            </div>

            <div className="dashProfileTexts">
              <div className="dashProfileName">{fullName}</div>
              <div className="dashProfileMeta">{memberSince}</div>
            </div>
          </div>

          {/* sous bloc 2 */}
          <div className="dashDistanceWrap">
            <div className="dashDistanceLabel">Distance totale parcourue</div>

            <div className="dashDistanceCard">
              <img className="dashDistanceIcon" src="/flag.svg" alt="" />
              <div className="dashDistanceValue">{totalDistanceKm}</div>
            </div>
          </div>
        </section>

    </div>
  );
}
