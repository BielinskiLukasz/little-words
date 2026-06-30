import { Link } from 'react-router';

export function MorePage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Link to="/categories" className="text-foreground hover:text-primary">Categories</Link>
      <Link to="/timeline" className="text-foreground hover:text-primary">Timeline</Link>
      <Link to="/doctor-report" className="text-foreground hover:text-primary">Doctor Report</Link>
      <Link to="/settings" className="text-foreground hover:text-primary">Settings</Link>
    </div>
  );
}
