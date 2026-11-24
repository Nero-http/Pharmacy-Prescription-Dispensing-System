import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

interface DashboardProps {
    stats: {
        total_medicines: number;
        total_stock: number;
        low_stock_medicines: number;
        total_dispensing_records: number;
        total_patients: number;
        total_doctors: number;
    };
    recentRecords: {
        id: number;
        dispense_date: string;
        patient_name: string;
        doctor_name: string;
        items: { medicine_name: string; quantity: number }[];
        total: number;
    }[];
    lowStockMedicines: {
        id: number;
        medicine_sku: string;
        medicine_brand: string;
        generic_name: string;
        stock_quantity: number;
    }[];
}

const amount = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export default function Dashboard({ stats, recentRecords, lowStockMedicines }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: route('dashboard') }]}>
            <Head title="Dashboard" />

            <main className="ppds-page">
                <header className="ppds-page-heading">
                    <div>
                        <p>Pharmacy overview</p>
                        <h1>Dashboard</h1>
                        <p>Inventory position and recent dispensing activity.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('medicines.create')}>Add medicine</Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('dispense-records.create')}>New dispense</Link>
                        </Button>
                    </div>
                </header>

                <section aria-label="Pharmacy statistics">
                    <dl className="border-border bg-card grid border-y sm:grid-cols-2 lg:grid-cols-5">
                        <Stat label="Active medicines" value={stats.total_medicines} />
                        <Stat label="Units in stock" value={stats.total_stock} />
                        <Stat label="Patients" value={stats.total_patients} />
                        <Stat label="Prescribers" value={stats.total_doctors} />
                        <Stat label="Dispensing records" value={stats.total_dispensing_records} />
                    </dl>
                    {stats.low_stock_medicines > 0 && (
                        <p className="mt-3 text-sm text-amber-800">
                            {stats.low_stock_medicines} medicine
                            {stats.low_stock_medicines === 1 ? ' is' : 's are'} low or out of stock.
                            <Link href={route('medicines.index')} className="text-primary ml-1 font-medium underline-offset-4 hover:underline">
                                Review inventory
                            </Link>
                        </p>
                    )}
                </section>

                <div className="grid gap-10 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
                    <section className="min-w-0">
                        <div className="border-border flex items-end justify-between gap-4 border-b pb-3">
                            <div>
                                <h2 className="text-base font-semibold">Recent dispensing</h2>
                                <p className="text-muted-foreground mt-1 text-sm">Latest recorded transactions</p>
                            </div>
                            <Link
                                href={route('dispense-records.index')}
                                className="text-primary shrink-0 text-sm font-medium underline-offset-4 hover:underline"
                            >
                                View all
                            </Link>
                        </div>

                        {recentRecords.length === 0 ? (
                            <p className="text-muted-foreground py-10 text-sm">No dispensing records yet. New transactions will appear here.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[690px] text-left text-sm">
                                    <thead>
                                        <tr className="border-border text-muted-foreground border-b text-xs">
                                            <th className="py-3 pr-4 font-medium">Date</th>
                                            <th className="py-3 pr-4 font-medium">Patient</th>
                                            <th className="py-3 pr-4 font-medium">Prescriber</th>
                                            <th className="py-3 pr-4 font-medium">Dispensed</th>
                                            <th className="py-3 text-right font-medium">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentRecords.map((record) => (
                                            <tr key={record.id} className="border-border/70 border-b last:border-0">
                                                <td className="text-muted-foreground py-3.5 pr-4 tabular-nums">{record.dispense_date}</td>
                                                <td className="py-3.5 pr-4 font-medium">{record.patient_name}</td>
                                                <td className="text-muted-foreground py-3.5 pr-4">{record.doctor_name}</td>
                                                <td className="text-muted-foreground max-w-[240px] py-3.5 pr-4">
                                                    <span className="line-clamp-2">
                                                        {record.items.map((item) => `${item.medicine_name} ×${item.quantity}`).join(', ') ||
                                                            'No medicine details'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 text-right font-medium tabular-nums">{amount.format(record.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="min-w-0">
                        <div className="border-border flex items-end justify-between gap-4 border-b pb-3">
                            <div>
                                <h2 className="text-base font-semibold">Stock attention</h2>
                                <p className="text-muted-foreground mt-1 text-sm">{stats.low_stock_medicines} low or out of stock</p>
                            </div>
                            <Link
                                href={route('medicines.index')}
                                className="text-primary shrink-0 text-sm font-medium underline-offset-4 hover:underline"
                            >
                                Inventory
                            </Link>
                        </div>

                        {lowStockMedicines.length === 0 ? (
                            <p className="text-muted-foreground py-10 text-sm">No medicines currently need a stock check.</p>
                        ) : (
                            <ul className="divide-border/70 divide-y">
                                {lowStockMedicines.map((medicine) => (
                                    <li key={medicine.id} className="flex items-center justify-between gap-4 py-4">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{medicine.medicine_brand}</p>
                                            <p className="text-muted-foreground mt-1 truncate text-xs">
                                                {medicine.generic_name} · {medicine.medicine_sku}
                                            </p>
                                        </div>
                                        <span
                                            className={`shrink-0 text-sm font-semibold tabular-nums ${
                                                medicine.stock_quantity === 0 ? 'text-destructive' : 'text-amber-800'
                                            }`}
                                        >
                                            {medicine.stock_quantity === 0 ? 'Out' : `${medicine.stock_quantity} left`}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </main>
        </AppLayout>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="border-border border-b px-4 py-4 first:pl-4 sm:px-5 lg:border-r lg:border-b-0 lg:last:border-r-0">
            <dt className="text-muted-foreground text-xs font-medium">{label}</dt>
            <dd className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value.toLocaleString()}</dd>
        </div>
    );
}
