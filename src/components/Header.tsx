import gridUnlockIcon from "../assets/grid-unlock.svg";

export const Header = (): JSX.Element => {
  return (
    <div className="page-header">
      <h1>Grid Unlock</h1>
      <img src={gridUnlockIcon} className="grid-unlock-icon" alt="Grid Unlock Logo" />
    </div>
  );
};
