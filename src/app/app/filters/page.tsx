import { PageHeader } from "@/components/layout/PageHeader";
import { FilterBuilder } from "@/components/filters/FilterBuilder";

export default function FiltersPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Filters"
        description="Compose bespoke views using priority, due dates, labels, and ownership. Save and share them with your team."
      />
      <FilterBuilder />
    </div>
  );
}
