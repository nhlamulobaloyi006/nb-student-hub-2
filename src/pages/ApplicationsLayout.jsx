import { Outlet } from 'react-router-dom';
import './ApplicationsLayout.css';

/**
 * Shared shell for /applications and /applications/:id.
 *
 * Desktop (>1024px): two-pane. The list lives in the left column and
 * <Outlet /> renders the detail into the right column when a :id is
 * present. When no :id, the right column shows an empty prompt.
 *
 * Mobile (<=1024px): single column. /applications renders the list,
 * /applications/:id renders the detail full-screen. Routing — not CSS
 * toggling — decides which one is on screen.
 */
export default function ApplicationsLayout() {
  return (
    <div className="al">
      <Outlet />
    </div>
  );
}
