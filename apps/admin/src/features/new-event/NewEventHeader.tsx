import Link from "next/link";
import { IconBack } from "@pokanito/ui";

/** Back link, breadcrumb, title and the two-step indicator. */
export default function NewEventHeader() {
  return (
    <div className="admin-newhead">
      <Link href="/" className="admin-newhead__back" aria-label="Back to events">
        <IconBack />
      </Link>
      <div className="admin-newhead__titles">
        <nav className="admin-newhead__crumbs" aria-label="Breadcrumb">
          <Link href="/">Events</Link>
          <span aria-hidden>/</span>
          <span aria-current="page">New event</span>
        </nav>
        <h1 className="ui-heading ui-heading--page">New event</h1>
      </div>
      <ol className="admin-steps" aria-label="Steps">
        <li className="admin-steps__step admin-steps__step--on" aria-current="step">
          <span className="admin-steps__num">1</span>
          Choose a template
        </li>
        <li className="admin-steps__line" aria-hidden />
        <li className="admin-steps__step">
          <span className="admin-steps__num">2</span>
          Customize &amp; publish
        </li>
      </ol>
    </div>
  );
}
