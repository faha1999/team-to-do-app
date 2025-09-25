import { PageHeader } from "@/components/layout/PageHeader";
import { FilterBuilder } from "@/components/filters/FilterBuilder";

export default function FiltersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Filters"
        description="Curate saved views that match how your team works."
      />
      <FilterBuilder />
    </div>
  );
}
