import PageHeader from '../components/PageHeader';

export default function Dashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of today" />
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Dashboard cards coming in Task 1.6.
      </div>
    </div>
  );
}