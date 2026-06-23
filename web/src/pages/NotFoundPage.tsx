import { Link } from "react-router-dom";
import { Page } from "../wiki/Page";
export function NotFoundPage() {
  return (
    <Page title="Not found" lede="That page does not exist.">
      <p>
        <Link to="/">Back to the overview →</Link>
      </p>
    </Page>
  );
}
