import PageHeader from '../components/PageHeader';

export default function ModulePlaceholder({ title, owner }: { title: string; owner: string }) {
  return (
    <div>
      <PageHeader title={title} subtitle={`Assigned to ${owner}`} />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        {title} page placeholder — {owner} will replace this component.
      </div>
    </div>
  );
}