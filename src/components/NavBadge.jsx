import "./NavBadge.css";

/**
 * A small pill or dot badge for navigation items.
 * @param {object} badge   { value, tone } or { dot: true, tone }
 * @param {boolean} inline  add margin-left:auto to push it right in flex rows
 */
export default function NavBadge({ badge, inline }) {
  if (!badge) return null;

  if (badge.dot) {
    return (
      <span
        className={"nav-badge nav-badge-dot nav-badge-" + (badge.tone || "amber") + (inline ? " nav-badge-inline" : "")}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className={"nav-badge nav-badge-" + (badge.tone || "gold") + (inline ? " nav-badge-inline" : "")}
      aria-label={badge.value + " pending"}
    >
      {badge.value > 99 ? "99+" : badge.value}
    </span>
  );
}
